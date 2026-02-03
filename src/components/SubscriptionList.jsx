import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { Repeat, X } from 'lucide-react';
import { formatLifeTime } from './FreedomBar';

const SubscriptionList = () => {
    const { subscriptions, removeSubscription, totalSubscriptionCost, calculateLifeCost } = useUser();

    // Calculate total life cost of all subscriptions
    const totalLifeCost = calculateLifeCost(totalSubscriptionCost);

    if (subscriptions.length === 0) {
        return (
            <div className="bg-bg-surface border border-[#333333] rounded-lg p-6 text-center">
                <p className="text-text-muted text-sm font-mono">No subscriptions tracked.</p>
                <p className="text-text-muted text-xs mt-2">Add subscriptions during onboarding or from settings.</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-surface border border-[#333333] rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase text-text-muted tracking-widest flex items-center gap-2">
                    <Repeat size={14} /> Monthly Subscriptions
                </h3>
                <div className="text-xs text-accent-danger font-mono">
                    ${totalSubscriptionCost.toFixed(2)}/MO → {formatLifeTime(totalLifeCost.hours, totalLifeCost.minutes)}
                </div>
            </div>
            <AnimatePresence>
                {subscriptions.map((sub, index) => (
                    <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center py-3 border-b border-text-muted/10 last:border-0 group"
                    >
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => removeSubscription(sub.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent-danger/20 rounded"
                                title="Remove subscription"
                            >
                                <X size={14} className="text-accent-danger" />
                            </button>
                            <div>
                                <span className="text-text-primary font-mono text-sm">{sub.name}</span>
                                <span className="text-text-muted text-xs ml-2">${sub.price}/mo</span>
                            </div>
                        </div>
                        <div className="text-accent-time font-mono text-sm">
                            {formatLifeTime(sub.hours, sub.minutes)}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionList;
