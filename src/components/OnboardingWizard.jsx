import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SUBSCRIPTION_PRESETS } from '../context/UserContext';
import { ArrowLeft, ArrowRight, DollarSign, Clock, Briefcase, Home, Tv, Check } from 'lucide-react';

const OnboardingWizard = () => {
    const { userProfile, updateUserProfile, completeOnboarding, addSubscription, removeSubscription, subscriptions, calculateLifeCost } = useUser();
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Track which subscription category is expanded
    const [expandedCategory, setExpandedCategory] = useState('streaming');

    // Helper handlers
    const handleFinancialChange = (key, value) => {
        updateUserProfile({
            financials: { [key]: Number(value) }
        });
    };

    const handleCostChange = (key, value) => {
        updateUserProfile({
            hiddenCosts: { [key]: Number(value) }
        });
    };

    const { financials, hiddenCosts } = userProfile;

    const isSubscriptionActive = (id) => {
        return subscriptions.some(sub => sub.id === id);
    };

    const toggleSubscription = (preset) => {
        if (isSubscriptionActive(preset.id)) {
            removeSubscription(preset.id);
        } else {
            addSubscription(preset);
        }
    };

    const nextStep = () => {
        if (step === totalSteps) {
            completeOnboarding();
        } else {
            setStep(prev => prev + 1);
        }
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const categoryLabels = {
        streaming: '📺 Streaming',
        fitness: '💪 Fitness',
        utilities: '📱 Utilities',
        other: '🎮 Other'
    };

    return (
        <div className="max-w-2xl mx-auto bg-bg-surface border border-[#333333] rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* PROGRESS BAR */}
            <div className="absolute top-0 left-0 h-1 bg-bg-overlay w-full">
                <motion.div
                    className="h-full bg-accent-freedom shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 mt-2">
                <h2 className="text-xl font-mono text-text-primary uppercase tracking-widest">
                    System Initialization <span className="text-accent-time">// Step 0{step}</span>
                </h2>
                <div className="text-xs text-text-muted font-mono">
                    EST. WAGE: <span className="text-accent-success text-base">${userProfile.realWage.toFixed(2)}/hr</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[300px]"
                >
                    {/* STEP 1: INCOME */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl text-text-primary font-bold">The Hard Numbers</h3>
                            <p className="text-text-secondary">First, establish the baseline. Check your bank deposit, not your offer letter.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Net Monthly Pay (Take-home)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 pl-12 text-2xl text-text-primary focus:border-accent-freedom outline-none font-mono"
                                            placeholder="4000"
                                            value={financials.netMonthlyIncome || ''}
                                            onChange={(e) => handleFinancialChange('netMonthlyIncome', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs uppercase text-text-muted mb-2">Contracted Hours / Mo</label>
                                        <input
                                            type="number"
                                            className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 text-lg text-text-primary focus:border-accent-freedom outline-none font-mono"
                                            placeholder="160"
                                            value={financials.monthlyContractHours || ''}
                                            onChange={(e) => handleFinancialChange('monthlyContractHours', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: TIME TAX */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl text-text-primary font-bold">The Time Tax</h3>
                            <p className="text-text-secondary">Calculate the hidden hours you spend fulfilling your contract.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Daily Commute (Round Trip Miles)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 pl-12 text-lg text-text-primary focus:border-accent-freedom outline-none font-mono"
                                            placeholder="20"
                                            value={hiddenCosts.dailyRoundTripMiles || ''}
                                            onChange={(e) => {
                                                const miles = Number(e.target.value);
                                                handleCostChange('dailyRoundTripMiles', miles);
                                                const hours = ((miles * 2) / 60) * 21.67;
                                                handleCostChange('monthlyCommuteHours', hours.toFixed(1));
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">
                                        ≈ {hiddenCosts.monthlyCommuteHours || 0} Unpaid Hours / Month
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Grooming (Minutes per day)</label>
                                    <input
                                        type="range"
                                        min="0" max="90" step="5"
                                        className="w-full accent-accent-time"
                                        onChange={(e) => {
                                            const mins = Number(e.target.value);
                                            const hours = (mins / 60) * 21.67;
                                            handleCostChange('monthlyGroomingHours', hours.toFixed(1));
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-text-muted font-mono mt-2">
                                        <span>0m (Bed Head)</span>
                                        <span>{((hiddenCosts.monthlyGroomingHours / 21.67) * 60).toFixed(0)}m</span>
                                        <span>90m (Runway)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: WORK OVERHEAD */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl text-text-primary font-bold">Work Overhead</h3>
                            <p className="text-text-secondary">Money lost to the job (Lunch, Clothes, Coffee).</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Daily Lunch Cost</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 pl-12 text-lg text-text-primary focus:border-accent-freedom outline-none font-mono"
                                            placeholder="10"
                                            value={hiddenCosts.dailyLunchCost || ''}
                                            onChange={(e) => handleCostChange('dailyLunchCost', e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">
                                        ≈ ${((hiddenCosts.dailyLunchCost || 0) * 21.67).toFixed(0)}/month
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Monthly Wardrobe/Maint.</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        {[
                                            { label: 'Hoodie ($15)', val: 15 },
                                            { label: 'Casual ($50)', val: 50 },
                                            { label: 'Suits ($120)', val: 120 }
                                        ].map((opt) => (
                                            <button
                                                key={opt.val}
                                                onClick={() => handleCostChange('wardrobeCost', opt.val)}
                                                className={`p-3 border rounded text-xs font-mono transition-colors ${hiddenCosts.wardrobeCost === opt.val ? 'border-accent-time text-accent-time bg-accent-time/10' : 'border-text-muted/30 text-text-muted hover:border-text-secondary'}`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ESSENTIALS */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl text-text-primary font-bold">The Essentials</h3>
                            <p className="text-text-secondary">What keeps the lights on? These costs are non-negotiable.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-text-muted mb-2">Total Fixed Costs (Rent + Bills)</label>
                                    <div className="relative">
                                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                                        <input
                                            type="number"
                                            className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 pl-12 text-lg text-text-primary focus:border-accent-freedom outline-none font-mono"
                                            placeholder="1500"
                                            value={hiddenCosts.monthlyFixedCosts || ''}
                                            onChange={(e) => handleCostChange('monthlyFixedCosts', e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">
                                        This determines your "Indentured Time."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: SUBSCRIPTIONS */}
                    {step === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl text-text-primary font-bold">Monthly Subscriptions</h3>
                            <p className="text-text-secondary">The silent drainers. Check what you pay for each month.</p>

                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.keys(SUBSCRIPTION_PRESETS).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setExpandedCategory(cat)}
                                        className={`px-3 py-1 text-xs font-mono rounded transition-colors ${expandedCategory === cat
                                            ? 'bg-accent-freedom/20 text-accent-freedom border border-accent-freedom/50'
                                            : 'bg-bg-deep text-text-muted border border-text-muted/30 hover:border-text-secondary'
                                            }`}
                                    >
                                        {categoryLabels[cat]}
                                    </button>
                                ))}
                            </div>

                            {/* Subscription Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                                {SUBSCRIPTION_PRESETS[expandedCategory].map((preset) => {
                                    const isActive = isSubscriptionActive(preset.id);
                                    const lifeCost = calculateLifeCost(preset.price);
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => toggleSubscription(preset)}
                                            className={`flex items-center justify-between p-3 border rounded text-left transition-all ${isActive
                                                ? 'border-accent-success/50 bg-accent-success/10 text-accent-success'
                                                : 'border-text-muted/30 text-text-secondary hover:border-accent-freedom/50 hover:bg-accent-freedom/5'
                                                }`}
                                        >
                                            <div>
                                                <div className="text-sm font-mono">{preset.name}</div>
                                                <div className="text-xs text-text-muted">
                                                    ${preset.price}/mo → {lifeCost.hours}h {lifeCost.minutes}m
                                                </div>
                                            </div>
                                            {isActive && <Check size={16} className="text-accent-success" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Summary */}
                            {subscriptions.length > 0 && (
                                <div className="mt-4 p-3 bg-bg-deep rounded border border-text-muted/20">
                                    <div className="text-xs text-text-muted uppercase mb-2">Selected Subscriptions</div>
                                    <div className="flex flex-wrap gap-2">
                                        {subscriptions.map(sub => (
                                            <span key={sub.id} className="text-xs px-2 py-1 bg-accent-freedom/10 text-accent-freedom rounded font-mono">
                                                {sub.name} (${sub.price})
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-sm text-accent-time font-mono">
                                        Total: ${subscriptions.reduce((sum, s) => sum + s.price, 0).toFixed(2)}/mo
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* CONTROLS */}
            <div className="flex justify-between mt-8 pt-6 border-t border-text-muted/20">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-accent-freedom/10 text-accent-freedom border border-accent-freedom/50 hover:bg-accent-freedom/20 transition-all rounded uppercase font-mono text-sm tracking-widest"
                >
                    {step === totalSteps ? 'Complete Setup' : 'Next Step'} <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default OnboardingWizard;
