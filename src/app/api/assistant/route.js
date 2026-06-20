import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { EMISSION_FACTORS, COMPARISONS } from '@/lib/calculator';

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (apiKey && apiKey !== 'YOUR_OPENAI_API_KEY' && apiKey.length > 20) {
  openai = new OpenAI({ apiKey });
}

/**
 * Build the system prompt for the AI assistant with user context.
 * @param {string} name - User's display name
 * @param {number} goal - Monthly carbon budget in kg CO₂
 * @param {Object} metrics - User's carbon footprint breakdown
 * @returns {string} System prompt for OpenAI
 */
function buildSystemPrompt(name, goal, metrics) {
  const b = metrics?.breakdown || {};
  const total = metrics?.total ?? 'Unknown';
  const transport = b.transport ?? 'Unknown';
  const electricity = b.electricity ?? 'Unknown';
  const food = b.food ?? 'Unknown';
  const waste = b.waste ?? 'Unknown';
  const shopping = b.shopping ?? 'Unknown';

  return `You are EcoBot, a world-class AI sustainability advisor. Your mission is to help users understand, track, and shrink their carbon footprint with warmth and precision.

## CORE RULES
1. Always reference the user's actual numbers from their metrics below. Never give generic advice.
2. For every recommendation, state the estimated kg CO₂ saved per month and give a **relatable comparison** (e.g., "saving 25 kg CO₂/month — that's like planting 14 trees 🌳 or skipping a 140 km car trip 🚗").
3. Always end with a **Daily Action** section: one simple, concrete thing they can do today.
4. Explain environmental impacts simply: use analogies (burger equivalents, phone charges, tree planting, car km).
5. Keep responses concise: 3–5 short paragraphs. Use **bold** for key numbers and headings (###).
6. Be encouraging and positive. Celebrate wins. Never shame.

## USER PROFILE
- Name: ${name}
- Target Monthly Carbon Budget: ${goal} kg CO₂/month

## USER'S CARBON METRICS (MONTHLY)
| Category | kg CO₂/month |
|---|---|
| Transport | ${transport} |
| Home Energy | ${electricity} |
| Food & Diet | ${food} |
| Waste | ${waste} |
| Shopping | ${shopping} |
| **Total** | **${total}** |

Target: ${goal} kg CO₂/month
${total !== 'Unknown' && total > goal ? `Overshoot: ${(total - goal).toFixed(1)} kg CO₂/month` : 'On track or under budget!'}

## REFERENCE EMISSION FACTORS (kg CO₂ per unit)
- Petrol car: 0.18 /km | Diesel: 0.17 /km | Hybrid: 0.10 /km | Electric: 0.04 /km | Transit: 0.03 /km
- Grid electricity: 0.42 /kWh
- Heavy meat diet: 2.5 /day | Average meat: 1.8 /day | Vegetarian: 1.1 /day | Vegan: 0.6 /day
- Waste per bag: 2.1 (40% less if recycled)
- Shopping: Minimalist 45 /month | Average 140 /month | Heavy 320 /month

## RELATABLE COMPARISONS
- 1 kg CO₂ ≈ planting 0.55 trees for a month
- 1 kg CO₂ ≈ driving 5.5 km in a petrol car
- 1 kg CO₂ ≈ charging a smartphone 200 times
- 1 kg CO₂ ≈ producing 0.4 beef burgers

## RESPONSE STRUCTURE (follow this order)
1. **Greeting & acknowledgment** — reply to their question warmly.
2. **Personal analysis** — reference their specific numbers and biggest category.
3. **Top 2–3 recommendations** — with kg CO₂ savings + relatable comparison.
4. **Daily Action** — one thing they can do right now, today.
5. **Closing** — encouragement and offer to dive deeper.`;
}

export async function POST(request) {
  try {
    const { messages, userMetrics, userProfile } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages thread is required' }, { status: 400 });
    }

    if (messages.length > 50) {
      return NextResponse.json({ error: 'Conversation too long, please start a new chat' }, { status: 400 });
    }

    const MAX_CONTENT_LENGTH = 2000;
    for (const msg of messages) {
      if (typeof msg?.content !== 'string' || msg.content.length > MAX_CONTENT_LENGTH) {
        return NextResponse.json(
          { error: `Each message must be a string under ${MAX_CONTENT_LENGTH} characters` },
          { status: 400 }
        );
      }
    }

    const displayName = typeof userProfile?.displayName === 'string' ? userProfile.displayName : 'Eco Pioneer';
    const goal = typeof userProfile?.monthlyGoal === 'number' ? userProfile.monthlyGoal : 400;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || !latestMessage.content || typeof latestMessage.content !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPrompt(displayName, goal, userMetrics) },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7,
          max_tokens: 800,
        });

        const aiResponse = response.choices[0].message.content;
        return NextResponse.json({ role: 'assistant', content: aiResponse, isMock: false });
      } catch (err) {
        console.error('OpenAI API call failed, falling back to local engine:', err.message);
      }
    }

    const responseText = generateHeuristicResponse(latestMessage.content, userMetrics, displayName, goal);
    return NextResponse.json({ role: 'assistant', content: responseText, isMock: true });

  } catch (error) {
    console.error('Assistant API handler error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
}

export function getTopCategory(metrics) {
  const cats = [
    { name: 'Transport', value: metrics?.breakdown?.transport ?? 0 },
    { name: 'Home Energy', value: metrics?.breakdown?.electricity ?? 0 },
    { name: 'Food & Diet', value: metrics?.breakdown?.food ?? 0 },
    { name: 'Waste', value: metrics?.breakdown?.waste ?? 0 },
    { name: 'Shopping', value: metrics?.breakdown?.shopping ?? 0 }
  ];
  cats.sort((a, b) => b.value - a.value);
  return cats[0];
}

function makeComparison(kgCo2) {
  const trees = (kgCo2 * COMPARISONS.treePerKg).toFixed(1);
  const carKm = (kgCo2 * COMPARISONS.carKmPerKg).toFixed(0);
  const phones = (kgCo2 * COMPARISONS.phoneChargePerKg).toFixed(0);
  const burgers = (kgCo2 * COMPARISONS.burgerPerKg).toFixed(1);
  if (kgCo2 < 5) return `That's about **${phones} phone charges** worth of electricity!`;
  if (kgCo2 < 20) return `Equivalent to driving **${carKm} km** in a petrol car or charging **${phones} smartphones**.`;
  return `That saves as much CO₂ as **${trees} trees** absorb in a month 🌳, or driving **${carKm} km** less 🚗.`;
}

export function generateHeuristicResponse(userPrompt, metrics, name, goal) {
  const query = userPrompt.toLowerCase();
  const transport = metrics?.breakdown?.transport ?? 180;
  const electricity = metrics?.breakdown?.electricity ?? 120;
  const food = metrics?.breakdown?.food ?? 54;
  const waste = metrics?.breakdown?.waste ?? 25;
  const shopping = metrics?.breakdown?.shopping ?? 140;
  const total = metrics?.total ?? 519;

  const top = getTopCategory(metrics);
  const hasMetrics = metrics?.breakdown && Object.values(metrics.breakdown).some(v => v > 0);
  const overshoot = total > goal ? total - goal : 0;

  let response = '';

  const keywords = {
    travel: ['travel', 'transport', 'car', 'vehicle', 'drive', 'driving', 'commute', 'bus', 'train', 'flight', 'plane', 'fly', 'fuel', 'petrol', 'diesel', 'ev', 'electric vehicle', 'bike', 'cycling'],
    food: ['food', 'diet', 'meat', 'eat', 'eating', 'vegan', 'vegetarian', 'plant', 'meal', 'cook', 'cooking', 'recipe', 'groceries', 'restaurant', 'compost', 'waste food'],
    energy: ['energy', 'electricity', 'home', 'power', 'bill', 'heating', 'cooling', 'ac', 'heater', 'light', 'led', 'appliance', 'kwh', 'solar', 'renewable', 'green tariff', 'thermostat'],
    shopping: ['shop', 'shopping', 'buy', 'buying', 'clothes', 'fashion', 'product', 'purchase', 'consumer', 'stuff', 'amazon', 'delivery', 'packaging', 'plastic', 'zero waste'],
    general: ['tip', 'advice', 'help', 'suggestion', 'recommend', 'start', 'beginner', 'how', 'what', 'why', 'explain', 'carbon', 'footprint', 'climate', 'environment', 'sustainable', 'eco', 'green']
  };

  const match = (list) => list.some(k => query.includes(k));

  if (match(keywords.travel)) {
    const savings = Math.min(transport * 0.3, 80);
    response = `### 🚗 Travel & Transport Analysis\n\n`;
    response += `Your transport emissions are **${transport} kg CO₂/month**. ${makeComparison(transport)}\n\n`;
    response += `### 💡 Top Recommendations\n\n`;
    response += `1. **Swap 20% of car trips to transit or cycling** — saves ~**${(transport * 0.2).toFixed(0)} kg CO₂/month**. ${makeComparison(transport * 0.2)}\n`;
    response += `2. **Combine errands into one trip** — cold starts burn 2x fuel. Saves roughly **${(savings * 0.3).toFixed(0)} kg CO₂/month**.\n`;
    response += `3. **Try carpooling twice a week** — cuts driving by 40% on those days. Saves ~**${(savings * 0.5).toFixed(0)} kg CO₂/month**.\n\n`;
    response += `### 🌱 Daily Action\nFor your next trip under 3 km, **walk or bike instead of driving**. You'll save ~**0.5 kg CO₂ per trip**. ${makeComparison(0.5)}\n\n`;
    response += `To put it simply: a petrol car emits roughly **a 1 kg bag of CO₂ every 5.5 km**. By cutting just 20 km of driving per week, you avoid nearly **15 kg CO₂/month** — the same as what **8 trees** absorb!`;

  } else if (match(keywords.food)) {
    response = `### 🥗 Food & Diet Analysis\n\n`;
    response += `Your food emissions are **${food} kg CO₂/month**. ${makeComparison(food)}\n\n`;
    response += `### 💡 Top Recommendations\n\n`;
    const meatSaving = Math.min(food * 0.35, 30);
    response += `1. **Replace 2 meat meals per week with plant-based** — saves ~**${meatSaving.toFixed(0)} kg CO₂/month**. ${makeComparison(meatSaving)}\n`;
    response += `2. **Cut food waste in half** — the average household wastes 30% of food. Saving half avoids **${(food * 0.15).toFixed(0)} kg CO₂/month**.\n`;
    response += `3. **Compost scraps** — food in landfill creates methane (25x worse than CO₂). Composting eliminates this.\n\n`;
    response += `### 🌱 Daily Action\n**Try one plant-based meal today** — breakfast oatmeal, a bean burrito, or lentil soup. One plant-based meal saves ~**2.5 kg CO₂** vs a beef meal. ${makeComparison(2.5)}\n\n`;
    response += `Here's the simple truth: a beef burger has a carbon footprint of about **2.5 kg CO₂** — equivalent to driving **14 km** in a petrol car. A veggie burger? Just **0.3 kg CO₂**.`;

  } else if (match(keywords.energy)) {
    response = `### ⚡ Home Energy Analysis\n\n`;
    response += `Your home energy emissions are **${electricity} kg CO₂/month**. ${makeComparison(electricity)}\n\n`;
    response += `### 💡 Top Recommendations\n\n`;
    response += `1. **Switch to LED bulbs** — LEDs use 75% less energy. If you replace 5 bulbs, save ~**${Math.min(electricity * 0.1, 15).toFixed(0)} kg CO₂/month**. ${makeComparison(Math.min(electricity * 0.1, 15))}\n`;
    response += `2. **Adjust thermostat by 1°C** — lower heating by 1°C in winter or raise AC by 1°C in summer saves **~8%** on your bill. That's **${(electricity * 0.08).toFixed(0)} kg CO₂/month**.\n`;
    response += `3. **Unplug standby devices** — "vampire power" is 5–10% of home electricity. Unplugging saves **${(electricity * 0.07).toFixed(0)} kg CO₂/month**.\n\n`;
    response += `### 🌱 Daily Action\n**Turn off lights and unplug chargers when leaving a room** — this simple habit saves ~**0.1 kg CO₂ per day**, or **3 kg CO₂/month**. ${makeComparison(3)}\n\n`;
    response += `Think of it this way: every **kWh of electricity** you save prevents **0.42 kg of CO₂** from entering the atmosphere. That's like not driving **2.3 km** for every kWh saved!`;

  } else if (match(keywords.shopping)) {
    response = `### 🛍️ Shopping & Consumption Analysis\n\n`;
    response += `Your shopping emissions are **${shopping} kg CO₂/month**. ${makeComparison(shopping)}\n\n`;
    response += `### 💡 Top Recommendations\n\n`;
    response += `1. **Buy second-hand first** — pre-owned items have zero manufacturing carbon. If 30% of purchases are used, save **${(shopping * 0.25).toFixed(0)} kg CO₂/month**. ${makeComparison(shopping * 0.25)}\n`;
    response += `2. **Follow the "30-day rule"** — wait 30 days before buying non-essentials. This typically cuts impulse purchases by 40%, saving **${(shopping * 0.3).toFixed(0)} kg CO₂/month**.\n`;
    response += `3. **Choose minimal packaging** — buy in bulk and avoid single-use plastics. This reduces waste by up to **30%**.\n\n`;
    response += `### 🌱 Daily Action\n**Before buying anything today, ask yourself: "Do I need this, or can I borrow/repair it?"** One avoided purchase saves an average **5–10 kg CO₂**. ${makeComparison(7)}\n\n`;
    response += `Here's the real impact: manufacturing a new pair of jeans emits roughly **20 kg CO₂** — the same as driving **110 km** in a car. Buying them second-hand avoids that entirely.`;

  } else if (match(keywords.general) || query.includes('carbon') || query.includes('footprint') || query.includes('explain')) {
    response = `### 🌍 Understanding Your Carbon Footprint\n\n`;
    if (hasMetrics) {
      response += `Your total footprint is **${total} kg CO₂/month** (target: **${goal} kg**). Your top category is **${top.name}** at **${top.value} kg CO₂/month**. ${makeComparison(total)}\n\n`;
      if (overshoot > 0) {
        response += `You're currently **${overshoot.toFixed(0)} kg over budget**. The good news: focusing on **${top.name}** alone can close that gap.\n\n`;
      }
    } else {
      response += `A carbon footprint measures the total greenhouse gases caused by your lifestyle — travel, home energy, food, waste, and shopping. The global average is about **700 kg CO₂/month** per person. To stay within climate targets, we need to aim for **under 200 kg**. \n\n`;
    }
    response += `### 💡 Where to Start\n\n`;
    response += `1. **Track your footprint** with the **Carbon Calculator** — know your baseline.\n`;
    response += `2. **Pick your biggest category** and make one change this week.\n`;
    response += `3. **Log your progress** in the **Daily Challenges** to build lasting habits.\n\n`;
    response += `### 🌱 Daily Action\n**Pick one area** (travel, food, energy, shopping) and ask EcoBot for specific tips. Even a 5% reduction — about **${Math.max(25, Math.round(total * 0.05))} kg CO₂/month** — makes a real difference. ${makeComparison(25)}\n\n`;
    response += `The key insight: **one person cutting 1 ton of CO₂ per year** (about 83 kg/month) removes as much as **45 trees** absorb annually. Small daily actions really do add up!`;

  } else {
    response = `### 💚 Great Question!\n\n`;
    if (hasMetrics) {
      response += `Looking at your profile, your biggest impact area is **${top.name}** (**${top.value} kg CO₂/month**). Here are 3 quick wins:\n\n`;
      if (top.name === 'Transport') {
        response += `1. **Walk or bike for trips under 3 km** — save **0.5 kg CO₂ per trip**. ${makeComparison(0.5)}\n`;
        response += `2. **Carpool once a week** — reduces weekly driving by 20%, saving **${(transport * 0.08).toFixed(0)} kg CO₂/month**.\n`;
        response += `3. **Keep tires inflated** — proper pressure improves fuel economy by 3%, saving **${(transport * 0.03).toFixed(0)} kg CO₂/month**.\n\n`;
      } else if (top.name === 'Home Energy') {
        response += `1. **Swap 5 bulbs to LED** — save **${Math.min(electricity * 0.1, 15).toFixed(0)} kg CO₂/month**. ${makeComparison(Math.min(electricity * 0.1, 15))}\n`;
        response += `2. **Wash clothes in cold water** — 90% of washer energy goes to heating. Save **${(electricity * 0.05).toFixed(0)} kg CO₂/month**.\n`;
        response += `3. **Seal drafty windows** — reduces heating/cooling loss by up to 20%. Save **${(electricity * 0.08).toFixed(0)} kg CO₂/month**.\n\n`;
      } else if (top.name === 'Food & Diet') {
        response += `1. **One meatless day per week** — save **${(food * 0.15).toFixed(0)} kg CO₂/month**. ${makeComparison(food * 0.15)}\n`;
        response += `2. **Eat what you buy** — halving food waste saves **${(food * 0.15).toFixed(0)} kg CO₂/month**.\n`;
        response += `3. **Choose tap over bottled** — saves packaging and transport emissions.\n\n`;
      } else {
        response += `1. **Repair instead of replace** — one repair saves **5–15 kg CO₂**. ${makeComparison(10)}\n`;
        response += `2. **Say no to single-use** — bring reusable bags, bottles, and coffee cups.\n`;
        response += `3. **Buy in bulk** — less packaging means less waste carbon.\n\n`;
      }
    } else {
      response += `Sustainability means meeting our needs without compromising future generations. The biggest sources of carbon emissions for most people are:\n\n`;
      response += `1. 🚗 **Transport** — cars, flights, fuel\n`;
      response += `2. ⚡ **Home Energy** — electricity, heating, cooling\n`;
      response += `3. 🥩 **Food** — especially meat and dairy\n`;
      response += `4. 🛍️ **Shopping** — new goods, fashion, packaging\n`;
      response += `5. 🗑️ **Waste** — landfill methane\n\n`;
    }
    response += `### 🌱 Daily Action\n**Share one sustainability goal with a friend** — accountability doubles your chances of sticking with a new habit. Start small, stay consistent!\n\n`;
    response += `Want me to dive deeper into any specific area? Try asking: "How can I improve my **${top ? top.name.toLowerCase() : 'transport'} habits?" or "Tips for reducing **${top && top.name !== 'Transport' ? 'home energy' : 'food'}** costs?"`;
  }

  return response.trim();
}
