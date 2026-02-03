import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

// Utility function to format life time with days for large values
export const formatLifeTime = (hours, minutes) => {
    const totalHours = hours + (minutes / 60);

    if (totalHours >= 48) {
        // Convert to days + hours (using 16 awake hours per day)
        const days = Math.floor(totalHours / 16);
        const remainingHours = Math.round(totalHours % 16);
        return `${days}d ${remainingHours}h`;
    }

    return `${hours}h ${minutes}m`;
};

const FreedomBar = () => {
    const { userProfile, transactions, subscriptions, totalSubscriptionCost } = useUser();
    const { financials, hiddenCosts } = userProfile;

    // Base capacity: 480 awake hours per month
    const awakeHours = 480;

    // Calculate committed hours from transactions
    const committedHours = transactions.reduce((sum, tx) => {
        return sum + tx.hours + (tx.minutes / 60);
    }, 0);

    // Calculate subscription hours
    const subscriptionHours = userProfile.realWage > 0
        ? totalSubscriptionCost / userProfile.realWage
        : 0;

    // Convert Fixed Costs to time
    const fixedCostsTime = userProfile.realWage > 0
        ? (hiddenCosts.monthlyFixedCosts / userProfile.realWage)
        : 0;

    // Base indentured time (work + hidden time + fixed costs + subscriptions)
    const workHours = financials.monthlyContractHours || 0;
    const hiddenTime = (hiddenCosts.monthlyCommuteHours || 0) + (hiddenCosts.monthlyGroomingHours || 0);
    const baseIndenturedHours = workHours + hiddenTime + fixedCostsTime + subscriptionHours;

    // Total indentured = base + committed expenses
    const totalIndenturedHours = baseIndenturedHours + committedHours;

    // Freedom = Awake - Total Indentured
    const freedomHours = Math.max(0, awakeHours - totalIndenturedHours);

    // Percentages for the bar segments
    const baseIndenturedPercent = Math.min(100, (baseIndenturedHours / awakeHours) * 100);
    const committedPercent = Math.min(100 - baseIndenturedPercent, (committedHours / awakeHours) * 100);
    const freedomPercent = Math.max(0, 100 - baseIndenturedPercent - committedPercent);

    return (
        <div className="bg-bg-surface border border-[#333333] rounded-lg p-6 relative overflow-hidden group">
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-4 flex justify-between">
                <span>Freedom Bar</span>
                <span className="text-xs text-text-muted">CAPACITY: 480 AWAKE HOURS</span>
            </h2>

            {/* THE BAR TRACK */}
            <div className="h-8 w-full bg-bg-deep border border-text-muted/30 rounded flex overflow-hidden relative">

                {/* BASE INDENTURED SEGMENT (Work, Fixed Costs) */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${baseIndenturedPercent}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-text-muted/20 relative"
                >
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)' }}></div>
                </motion.div>

                {/* COMMITTED EXPENSES SEGMENT (New - Red/Orange) */}
                {committedPercent > 0 && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${committedPercent}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="h-full bg-accent-danger/60 relative"
                    >
                        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, #000 3px, #000 6px)' }}></div>
                    </motion.div>
                )}

                {/* FREEDOM SEGMENT */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freedomPercent}%` }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "circOut" }}
                    className="h-full bg-accent-freedom shadow-[0_0_15px_rgba(0,229,255,0.4)] relative"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>

                {/* Vertical Divider Line (50%) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 border-l border-dashed border-white/20"></div>
            </div>

            {/* LEGEND / DATA */}
            <div className="flex justify-between mt-4 text-xs font-mono">
                <div className="text-text-muted">
                    <span className="inline-block w-2 h-2 bg-text-muted/50 mr-2 rounded-sm"></span>
                    INDENTURED: <span className="text-white">{Math.round(baseIndenturedHours)}H</span>
                    {committedHours > 0 && (
                        <span className="text-accent-danger ml-2">
                            +{Math.round(committedHours)}H spent
                        </span>
                    )}
                </div>
                <div className="text-accent-freedom text-right">
                    <div>
                        FREEDOM: <span className="font-bold text-lg">{formatLifeTime(Math.floor(freedomHours), Math.round((freedomHours % 1) * 60))}</span>
                        <span className="inline-block w-2 h-2 bg-accent-freedom ml-2 rounded-sm shadow-[0_0_5px_cyan]"></span>
                    </div>
                    <div className="text-text-muted text-[10px] mt-1">
                        ≈ {(freedomHours / 30).toFixed(1)}h/day
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="mt-4 pt-4 border-t border-text-muted/10 text-xs text-text-muted space-y-1">
                <div>You spend <strong>{Math.round(fixedCostsTime)} hours</strong> just paying bills.</div>
                {committedHours > 0 && (
                    <div className="text-accent-danger">
                        You've committed <strong>{formatLifeTime(Math.floor(committedHours), Math.round((committedHours % 1) * 60))}</strong> to purchases this session.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreedomBar;
