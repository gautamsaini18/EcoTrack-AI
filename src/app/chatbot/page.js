'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dbGetLogs } from '@/lib/db';
import {
  Sparkles,
  Send,
  User,
  ArrowRight,
  HelpCircle,
  TrendingDown,
  Info,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

export default function Chatbot() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [latestLog, setLatestLog] = useState(null);
  const [topCategory, setTopCategory] = useState(null);
  const msgCounter = useRef(0);

  const messagesEndRef = useRef(null);

  const loadLogsAndGreet = async () => {
    try {
      const logs = await dbGetLogs(user.uid);
      const latest = logs[0] || null;
      setLatestLog(latest);

      let greetMsg = `Hello **${user.displayName}**! I am your EcoTrack AI Assistant.`;

      if (latest) {
        const transport = latest.breakdown?.transport || 0;
        const electricity = latest.breakdown?.electricity || 0;
        const food = latest.breakdown?.food || 0;
        const waste = latest.breakdown?.waste || 0;
        const shopping = latest.breakdown?.shopping || 0;

        const categories = [
          { name: 'Transport', value: transport },
          { name: 'Home Energy', value: electricity },
          { name: 'Food & Diet', value: food },
          { name: 'Waste', value: waste },
          { name: 'Shopping', value: shopping }
        ];
        categories.sort((a, b) => b.value - a.value);
        const topCat = categories[0];
        setTopCategory(topCat);

        greetMsg += `\n\nI've analyzed your latest footprint of **${latest.total} kg CO₂/month**. Your top emission driver is **${topCat.name}** at **${topCat.value} kg CO₂/month**.\n\nWould you like tailored recommendations for this area, or do you have a specific question about sustainable habits?`;
      } else {
        greetMsg += `\n\nI noticed you haven't logged your carbon metrics yet. Take the **Carbon Footprint Calculator** so I can provide personalized saving targets.\n\nIn the meantime, ask me general questions like "How do I start composting?" or "What is a green energy tariff?"`;
      }

      setMessages([
        { role: 'assistant', content: greetMsg, id: 'greet' }
      ]);
    } catch (e) {
      console.error(e);
      setMessages([
        { role: 'assistant', content: `Hello! I'm your EcoTrack AI coach. Ask me anything about reducing your carbon footprint!`, id: 'greet' }
      ]);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        loadLogsAndGreet();
      }
    }
  }, [user, loading, router, loadLogsAndGreet]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const nextMsgId = () => {
    msgCounter.current += 1;
    return 'msg_' + msgCounter.current;
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || sending) return;

    const userMsg = { role: 'user', content: text, id: nextMsgId() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userMetrics: latestLog,
          userProfile: user
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        id: nextMsgId(),
        isMock: data.isMock
      }]);
    } catch (err) {
      console.error("AI fetch failed:", err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection issue detected. Make sure your server is online and check your \`.env.local\` keys.`,
        id: 'msg_err_' + nextMsgId()
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const resetChat = () => {
    if (confirm("Reset current conversation thread?")) {
      loadLogsAndGreet();
    }
  };

  const renderMessageContent = (content) => {
    if (!content) return '';

    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-white mt-4 mb-2 tracking-tight">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const pointText = trimmed.replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="list-disc ml-5 mb-1.5 text-xs text-gray-300 font-light leading-relaxed">
            {parseBoldText(pointText)}
          </li>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const numText = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <li key={idx} className="list-decimal ml-5 mb-1.5 text-xs text-gray-300 font-light leading-relaxed">
            {parseBoldText(numText)}
          </li>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-gray-300 font-light leading-relaxed mb-2">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getSuggestions = () => {
    if (!topCategory || !topCategory.value) {
      return [
        "How do I calculate my carbon footprint?",
        "Tips for eating an eco-friendly diet",
        "How do I save home energy on a budget?",
        "What's the biggest impact I can make?"
      ];
    }
    const base = [
      `How can I reduce my ${topCategory.name.toLowerCase()} footprint?`,
      "What's a simple daily habit that helps the planet?",
      "Explain my carbon footprint like I'm 10",
      "Give me a weekly eco-action plan"
    ];
    const alt = {
      Transport: ["Is an electric car worth it?", "How much CO2 does a flight create?"],
      'Home Energy': ["How do I switch to renewable energy?", "What appliances use the most power?"],
      'Food & Diet': ["What's the most eco-friendly diet?", "How do I start composting at home?"],
      Waste: ["How do I go zero waste?", "What can I recycle vs compost?"],
      Shopping: ["Tips for sustainable fashion", "How do I avoid impulse buying?"]
    };
    const extras = alt[topCategory.name] || ["What's the carbon impact of online shopping?"];
    return [...base, ...extras];
  };

  const suggestions = getSuggestions();

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex-grow flex flex-col justify-between h-[calc(100vh-4rem)]">

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 shadow-lg shadow-emerald-500/5">
            <Sparkles className="w-5 h-5 fill-emerald-400/20" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Sustainability Companion</h2>
            <p className="text-[11px] text-gray-500 font-light">
              {topCategory
                ? `Focusing on your top area: ${topCategory.name}`
                : 'Interactive advisor syncing with your profile metrics.'}
            </p>
          </div>
        </div>
        {topCategory && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
            <TrendingDown className="w-3 h-3" />
            Top impact: {topCategory.name}
          </div>
        )}

        <button
          onClick={resetChat}
          className="p-2.5 text-gray-500 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
          title="Reset chat session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-grow glass-panel rounded-2xl p-5 overflow-y-auto max-h-[calc(100vh-18rem)] space-y-5 mb-4">

        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 w-full animate-fade-in ${
                isAI ? '' : 'flex-row-reverse'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                isAI
                  ? 'bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 text-cyan-400 border border-cyan-500/20'
              }`}>
                {isAI ? <Sparkles className="w-4 h-4" /> : user.displayName[0].toUpperCase()}
              </div>

              <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[70%] border ${
                isAI
                  ? 'bg-slate-900/60 border-white/5 text-gray-200'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-white'
              }`}>
                <div className="space-y-1">
                  {renderMessageContent(msg.content)}
                </div>

                {isAI && msg.isMock && (
                  <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-gray-600 flex items-center gap-1 font-mono">
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>Local rule engine response.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start gap-3 w-full">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl border border-white/5 bg-slate-900/60 text-gray-500 flex items-center gap-2 text-xs font-light">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>EcoBot is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!sending && messages.length <= 2 && (
        <div className="mb-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2.5">Suggested Topics</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestClick(item)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-semibold bg-white/[0.03] hover:bg-white/10 text-gray-400 border border-white/5 hover:border-white/10 hover:text-white cursor-pointer transition-all duration-200"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 w-full"
      >
        <input
          type="text"
          placeholder="Ask EcoBot: &apos;How do I offset travel?&apos;..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          className="flex-grow px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="p-3.5 rounded-2xl gradient-green-btn text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-105 active:scale-100 disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
