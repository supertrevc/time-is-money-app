import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { formatLifeTime } from './FreedomBar';
import { AlertTriangle, Tag } from 'lucide-react';

const LifePriceConverter = () => {
    const { userProfile, calculateLifeCost, addTransaction, transactions } = useUser();
    const [inputValue, setInputValue] = useState('');
    const [viewState, setViewState] = useState('idle'); // 'idle' | 'result' | 'gut-check' | 'declined' | 'labeling'
    const [calculatedTime, setCalculatedTime] = useState({ hours: 0, minutes: 0 });
    const [label, setLabel] = useState('');

    // Calculate available freedom hours
    const { financials, hiddenCosts } = userProfile;
    const awakeHours = 480;

    // Calculate committed hours from transactions
    const committedHours = transactions.reduce((sum, tx) => {
        return sum + tx.hours + (tx.minutes / 60);
    }, 0);

    // Fixed costs time
    const fixedCostsTime = userProfile.realWage > 0
        ? (hiddenCosts.monthlyFixedCosts / userProfile.realWage)
        : 0;

    // Base indentured hours
    const workHours = financials.monthlyContractHours || 0;
    const hiddenTime = (hiddenCosts.monthlyCommuteHours || 0) + (hiddenCosts.monthlyGroomingHours || 0);
    const baseIndenturedHours = workHours + hiddenTime + fixedCostsTime;

    // Available freedom = Awake - Base Indentured - Already Committed
    const availableFreedom = Math.max(0, awakeHours - baseIndenturedHours - committedHours);

    // Real-time subtitle update
    const liveEstimation = calculateLifeCost(Number(inputValue));

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue) {
            const finalCalc = calculateLifeCost(Number(inputValue));
            setCalculatedTime(finalCalc);
            setViewState('result');
        }
    };

    // Effect to trigger Gut Check or Declined after Result animation
    useEffect(() => {
        if (viewState === 'result') {
            const timer = setTimeout(() => {
                const transactionHours = calculatedTime.hours + (calculatedTime.minutes / 60);
                if (transactionHours > availableFreedom) {
                    setViewState('declined');
                } else {
                    setViewState('gut-check');
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [viewState, calculatedTime, availableFreedom]);

    const resetFlow = () => {
        setInputValue('');
        setLabel('');
        setViewState('idle');
    };

    const handleYesClick = () => {
        // Move to labeling state
        setViewState('labeling');
    };

    const handleCommit = (skipLabel = false) => {
        addTransaction(inputValue, calculatedTime, skipLabel ? '' : label);
        resetFlow();
    };

    const handleLabelKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCommit(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* TERMINAL CONTAINER */}
            <div className="relative bg-bg-surface border border-[#333333] rounded-lg p-6 min-h-[300px] flex flex-col justify-center items-center shadow-lg overflow-hidden">

                {/* DECORATIVE CORNERS */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-text-muted opacity-50 m-2"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-text-muted opacity-50 m-2"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-text-muted opacity-50 m-2"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-text-muted opacity-50 m-2"></div>

                <AnimatePresence mode="wait">

                    {/* STATE A: IDLE / INPUT */}
                    {viewState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full text-center"
                        >
                            <div className="relative mb-2">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted text-4xl font-mono opacity-50">$</span>
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="0"
                                    className="w-full bg-transparent text-center text-4xl sm:text-6xl text-text-primary font-mono outline-none border-b border-text-muted focus:border-accent-freedom transition-colors pb-2 placeholder:text-text-muted/20"
                                    autoFocus
                                />
                            </div>

                            {/* LIVE SUBTITLE */}
                            <motion.div
                                className="text-accent-time font-mono text-sm sm:text-base mt-4 h-6"
                                animate={{ opacity: inputValue ? 1 : 0 }}
                            >
                                ≈ {formatLifeTime(liveEstimation.hours, liveEstimation.minutes)}
                            </motion.div>

                            <p className="text-text-muted text-xs mt-8 uppercase tracking-widest">
                                Enter Purchase Price
                            </p>
                        </motion.div>
                    )}

                    {/* STATE B: RESULT DISPLAY */}
                    {(viewState === 'result' || viewState === 'gut-check' || viewState === 'declined') && (
                        <motion.div
                            key="result"
                            initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="text-center w-full"
                        >
                            <div className="text-text-secondary text-lg mb-2 line-through opacity-50">
                                ${inputValue}
                            </div>

                            <h1 className={`text-4xl sm:text-5xl font-bold font-mono tracking-tighter mb-2 ${viewState === 'declined'
                                ? 'text-accent-danger drop-shadow-[0_0_10px_rgba(255,85,85,0.6)]'
                                : 'text-accent-time drop-shadow-[0_0_10px_rgba(255,191,0,0.6)]'
                                }`}>
                                {formatLifeTime(calculatedTime.hours, calculatedTime.minutes)}
                            </h1>

                            <div className="text-xs text-text-muted uppercase tracking-widest mb-8">
                                BASED ON REAL WAGE: ${userProfile.realWage.toFixed(2)}/HR
                            </div>
                        </motion.div>
                    )}

                    {/* STATE E: LABELING (Full replacement, not overlay) */}
                    {viewState === 'labeling' && (
                        <motion.div
                            key="labeling"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full text-center"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4 text-accent-freedom">
                                <Tag size={18} />
                                <span className="font-mono text-lg uppercase">Label this expense</span>
                            </div>

                            <div className="text-text-muted text-sm mb-4">
                                <span className="text-accent-time font-mono">${inputValue}</span> → {formatLifeTime(calculatedTime.hours, calculatedTime.minutes)}
                            </div>

                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                onKeyDown={handleLabelKeyDown}
                                placeholder="e.g., New headphones, Coffee run..."
                                className="w-full bg-bg-deep border border-text-muted/30 rounded p-4 text-center text-text-primary font-mono focus:border-accent-freedom outline-none mb-6"
                                autoFocus
                            />

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => handleCommit(true)}
                                    className="px-6 py-2 border border-text-muted text-text-muted font-mono text-sm hover:bg-text-muted/10 transition-colors uppercase"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => handleCommit(false)}
                                    className="px-6 py-2 border border-accent-freedom text-accent-freedom font-mono text-sm bg-accent-freedom/10 hover:bg-accent-freedom/20 transition-colors uppercase shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* STATE C: GUT CHECK OVERLAY */}
                <AnimatePresence>
                    {viewState === 'gut-check' && (
                        <motion.div
                            key="gut-check"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-0 right-0 px-6 text-center"
                        >
                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-accent-danger font-mono text-sm mb-4"
                            >
                                IS THIS WORTH {formatLifeTime(calculatedTime.hours, calculatedTime.minutes)} OF FREEDOM?
                            </motion.p>

                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={resetFlow}
                                    className="px-6 py-2 border border-accent-danger text-accent-danger font-mono text-sm hover:bg-accent-danger/10 transition-colors uppercase"
                                >
                                    NO (Clear)
                                </button>
                                <button
                                    onClick={handleYesClick}
                                    className="px-6 py-2 border border-accent-freedom text-accent-freedom font-mono text-sm bg-accent-freedom/10 hover:bg-accent-freedom/20 transition-colors uppercase shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                                >
                                    YES (Commit)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* STATE D: DECLINED OVERLAY */}
                <AnimatePresence>
                    {viewState === 'declined' && (
                        <motion.div
                            key="declined"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute bottom-6 left-0 right-0 px-6 text-center"
                        >
                            <motion.div
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, -5, 5, -5, 0] }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center justify-center gap-2 mb-3"
                            >
                                <AlertTriangle className="text-accent-danger" size={20} />
                                <span className="text-accent-danger font-mono text-lg font-bold uppercase">
                                    DECLINED
                                </span>
                                <AlertTriangle className="text-accent-danger" size={20} />
                            </motion.div>

                            <p className="text-text-muted text-xs mb-4 font-mono">
                                EXCEEDS AVAILABLE FREEDOM ({Math.round(availableFreedom)}H REMAINING)
                            </p>

                            <button
                                onClick={resetFlow}
                                className="px-8 py-2 border border-accent-danger text-accent-danger font-mono text-sm hover:bg-accent-danger/10 transition-colors uppercase"
                            >
                                ACKNOWLEDGE
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>


            </div>
        </div>
    );
};

export default LifePriceConverter;
