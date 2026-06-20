'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dbAddLog } from '@/lib/db';
import { calculateCarbonFootprint, getEmissionRating } from '@/lib/calculator';
import {
  Car,
  Zap,
  Utensils,
  Trash2,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Award,
  CheckCircle,
  TrendingDown,
  Info
} from 'lucide-react';

export default function Calculator() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [dailyDistance, setDailyDistance] = useState(15);
  const [vehicleType, setVehicleType] = useState('hybrid');
  const [electricityUsage, setElectricityUsage] = useState(250);
  const [renewableShare, setRenewableShare] = useState(20);
  const [foodPreference, setFoodPreference] = useState('average_meat');
  const [wasteBags, setWasteBags] = useState(2);
  const [recycles, setRecycles] = useState(true);
  const [shoppingHabit, setShoppingHabit] = useState('average');

  const currentFootprint = useMemo(() => calculateCarbonFootprint({
    dailyDistance,
    vehicleType,
    electricityUsage,
    renewableShare,
    foodPreference,
    wasteBags,
    recycles,
    shoppingHabit
  }), [dailyDistance, vehicleType, electricityUsage, renewableShare, foodPreference, wasteBags, recycles, shoppingHabit]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const [saving, setSaving] = useState(false);
  const handleSaveResult = async () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ecotrack_temp_calculator_log', JSON.stringify(currentFootprint));
      }
      router.push('/login?mode=signup');
      return;
    }

    setSaving(true);
    try {
      await dbAddLog(user.uid, {
        inputs: {
          dailyDistance,
          vehicleType,
          electricityUsage,
          renewableShare,
          foodPreference,
          wasteBags,
          recycles,
          shoppingHabit
        },
        breakdown: currentFootprint.breakdown,
        total: currentFootprint.total,
        treesEquivalent: currentFootprint.treesEquivalent
      });
      router.push('/dashboard');
    } catch (e) {
      console.error("Error logging calculations:", e);
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (field, value) => field === value;
  const rating = getEmissionRating(currentFootprint.total);

  const stepLabels = ['Transport', 'Energy', 'Diet', 'Waste', 'Shopping', 'Summary'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 flex-grow flex flex-col justify-center">

      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
          <span>Step {step} of {totalSteps}</span>
          <span className="text-gradient-emerald-cyan font-bold">{stepLabels[step - 1]}</span>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            return (
              <div
                key={stepNum}
                className={`h-2 flex-grow rounded-full transition-all duration-500 ${
                  stepNum <= step ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/10' : 'bg-white/5'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-3xl min-h-[420px] flex flex-col justify-between shadow-xl">

        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-400/5 text-emerald-400 shadow-lg shadow-emerald-500/5">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Daily Transportation</h3>
                <p className="text-sm text-gray-500">Travel distance is often the largest contributor to personal emissions.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-gray-300">Daily Travel Distance</label>
                <span className="font-mono text-emerald-400 font-bold text-base">{dailyDistance} km</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={dailyDistance}
                onChange={(e) => setDailyDistance(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                aria-valuemin={0}
                aria-valuemax={150}
                aria-valuenow={dailyDistance}
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>0 km</span>
                <span>75 km</span>
                <span>150 km</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 block">Primary Transport</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'petrol', label: 'Petrol' },
                  { id: 'diesel', label: 'Diesel' },
                  { id: 'hybrid', label: 'Hybrid' },
                  { id: 'electric', label: 'Electric' },
                  { id: 'motorcycle', label: 'Motorcycle' },
                  { id: 'transit', label: 'Bus / Train' },
                  { id: 'walk_bike', label: 'Walk / Bike' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setVehicleType(item.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                      isSelected(vehicleType, item.id)
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10'
                        : 'border-white/5 bg-white/[0.03] text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 text-cyan-400 shadow-lg shadow-cyan-500/5">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Home Energy Usage</h3>
                <p className="text-sm text-gray-500">Electricity grids run on carbon-intensive fuels. Green shares offset emissions.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-gray-300">Monthly Consumption</label>
                <span className="font-mono text-cyan-400 font-bold text-base">{electricityUsage} kWh</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="20"
                value={electricityUsage}
                onChange={(e) => setElectricityUsage(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                aria-valuemin={0}
                aria-valuemax={1000}
                aria-valuenow={electricityUsage}
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>0 kWh</span>
                <span>500 kWh</span>
                <span>1,000 kWh</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-gray-300">Renewable Energy Share</label>
                <span className="font-mono text-emerald-400 font-bold text-base">{renewableShare}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={renewableShare}
                onChange={(e) => setRenewableShare(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={renewableShare}
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-indigo-400/5 text-indigo-400 shadow-lg shadow-indigo-500/5">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Diet & Food Choices</h3>
                <p className="text-sm text-gray-500">Animal agriculture is responsible for significant global greenhouse gases.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'heavy_meat',
                  title: 'Meat Lover',
                  desc: 'Beef, pork, or poultry with almost every dinner.',
                  tag: 'High Impact'
                },
                {
                  id: 'average_meat',
                  title: 'Average Diet',
                  desc: 'Moderate meat intake, mixed with vegetables and pasta.',
                  tag: 'Moderate'
                },
                {
                  id: 'vegetarian',
                  title: 'Vegetarian',
                  desc: 'No meat or fish. Incorporates dairy products and eggs.',
                  tag: 'Eco-Friendly'
                },
                {
                  id: 'vegan',
                  title: 'Vegan',
                  desc: '100% plant-based diet. Zero animal ingredients.',
                  tag: 'Lowest Impact'
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFoodPreference(item.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all card-hover-effect cursor-pointer ${
                    isSelected(foodPreference, item.id)
                      ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                      : 'border-white/5 bg-white/[0.03] hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-base font-bold ${
                      isSelected(foodPreference, item.id) ? 'text-emerald-300' : 'text-white'
                    }`}>
                      {item.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      item.id === 'vegan' ? 'bg-emerald-500/20 text-emerald-400' :
                      item.id === 'vegetarian' ? 'bg-green-500/20 text-green-400' :
                      item.id === 'average_meat' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed font-light">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-400/5 text-amber-400 shadow-lg shadow-amber-500/5">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Waste & Recycling</h3>
                <p className="text-sm text-gray-500">Landfills emit methane from decaying organic materials.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <label className="font-semibold text-gray-300">Trash Bags Per Week</label>
                <span className="font-mono text-amber-400 font-bold text-base">{wasteBags} Bags</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={wasteBags}
                onChange={(e) => setWasteBags(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
                aria-valuemin={0}
                aria-valuemax={8}
                aria-valuenow={wasteBags}
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono">
                <span>0 Bags</span>
                <span>4 Bags</span>
                <span>8 Bags</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between card-hover-effect">
              <div>
                <h4 className="text-sm font-semibold text-white">Do you recycle?</h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">Regularly separating plastic, glass, paper, and aluminum.</p>
              </div>
              <button
                type="button"
                onClick={() => setRecycles(!recycles)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  recycles
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                    : 'bg-white/[0.03] text-gray-400 border-white/5 hover:bg-white/5'
                }`}
              >
                {recycles ? 'Yes, I Recycle' : 'No Recycling'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-400/5 text-rose-400 shadow-lg shadow-rose-500/5">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Shopping & Consumption</h3>
                <p className="text-sm text-gray-500">Manufacturing and shipping products carry high carbon footprints.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'minimalist',
                  title: 'Minimalist',
                  desc: 'Rarely buy new items. Second-hand, repair, focus on necessities.'
                },
                {
                  id: 'average',
                  title: 'Average',
                  desc: 'Occasional clothes shopping, upgrade tech every couple years.'
                },
                {
                  id: 'heavy',
                  title: 'Heavy Consumer',
                  desc: 'Frequent purchases of new clothes, gadgets, and packaged goods.'
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setShoppingHabit(item.id)}
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all card-hover-effect cursor-pointer ${
                    isSelected(shoppingHabit, item.id)
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.03] hover:bg-white/5'
                  }`}
                >
                  <span className={`text-base font-bold ${
                    isSelected(shoppingHabit, item.id) ? 'text-emerald-300' : 'text-white'
                  }`}>
                    {item.title}
                  </span>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 sm:space-y-8 animate-slide-up text-center flex flex-col justify-center items-center py-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-400 animate-float shadow-lg shadow-emerald-500/5">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Your Carbon Footprint</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">Here is your approximated footprint based on the input factors.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-2">

              <div className="glass-panel p-6 rounded-2xl text-center card-hover-effect">
                <div className="text-3xl font-extrabold text-gradient-emerald-cyan font-mono">{currentFootprint.total}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1">kg CO₂ / month</div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white/[0.03] border-white/5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rating.color }} />
                  <span>Rating: {rating.grade}</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl text-center card-hover-effect">
                <div className="text-3xl font-extrabold text-amber-400 font-mono">{currentFootprint.treesEquivalent}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1">Trees Equivalent</div>
                <p className="text-[11px] text-gray-500 mt-2">Mature trees needed to absorb your monthly emissions.</p>
              </div>

            </div>

            <div className="w-full max-w-lg glass-panel px-6 py-5 rounded-2xl text-xs space-y-3 text-left">
              <div className="flex justify-between border-b border-white/5 pb-2 font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                <span>Category</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transport</span>
                <span className="font-mono font-medium text-white">{currentFootprint.breakdown.transport} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Energy</span>
                <span className="font-mono font-medium text-white">{currentFootprint.breakdown.electricity} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Food</span>
                <span className="font-mono font-medium text-white">{currentFootprint.breakdown.food} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waste</span>
                <span className="font-mono font-medium text-white">{currentFootprint.breakdown.waste} kg CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shopping</span>
                <span className="font-mono font-medium text-white">{currentFootprint.breakdown.shopping} kg CO₂</span>
              </div>
            </div>

            {!user && (
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 text-xs text-cyan-200/80 flex items-center gap-2.5 max-w-md">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>You are anonymous. Signing up will save this log to your profile.</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold glass-panel text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-semibold gradient-green-btn text-white transition-all ml-auto hover:shadow-lg hover:shadow-emerald-500/15 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSaveResult}
              disabled={saving}
              className="flex items-center gap-1.5 px-7 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 transition-all ml-auto hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : user ? 'Log to Dashboard' : 'Sign Up & Save'}
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {step < totalSteps && (
        <div className="mt-6 p-4 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-gray-500">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>Running Total:</span>
            <span className="font-mono text-white font-bold">{currentFootprint.total} kg CO₂</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Trees:</span>
            <span className="font-mono text-amber-400 font-bold">{currentFootprint.treesEquivalent}</span>
          </div>
        </div>
      )}

    </div>
  );
}
