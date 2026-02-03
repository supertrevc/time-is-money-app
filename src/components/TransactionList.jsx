import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { Clock, X } from 'lucide-react';
import { formatLifeTime } from './FreedomBar';

const TransactionList = () => {
    const { transactions, removeTransaction } = useUser();

    // Calculate total committed time
    const totalHours = transactions.reduce((sum, tx) => sum + tx.hours, 0);
    const totalMinutes = transactions.reduce((sum, tx) => sum + tx.minutes, 0);
    const normalizedHours = totalHours + Math.floor(totalMinutes / 60);
    const normalizedMinutes = totalMinutes % 60;

    if (transactions.length === 0) {
        return (
            <div className="bg-bg-surface border border-[#333333] rounded-lg p-6 text-center">
                <p className="text-text-muted text-sm font-mono">No transactions yet.</p>
                <p className="text-text-muted text-xs mt-2">Commit a purchase to track your life hours spent.</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-surface border border-[#333333] rounded-lg p-4 max-h-[300px] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase text-text-muted tracking-widest flex items-center gap-2">
                    <Clock size={14} /> Recent Transactions
                </h3>
                <div className="text-xs text-accent-danger font-mono">
                    TOTAL: {formatLifeTime(normalizedHours, normalizedMinutes)}
                </div>
            </div>
            <AnimatePresence>
                {transactions.map((tx, index) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center py-3 border-b border-text-muted/10 last:border-0 group"
                    >
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => removeTransaction(tx.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent-danger/20 rounded"
                                title="Remove transaction"
                            >
                                <X size={14} className="text-accent-danger" />
                            </button>
                            <div>
                                <span className="text-text-primary font-mono">${tx.amount.toFixed(2)}</span>
                                {tx.label ? (
                                    <span className="text-accent-freedom text-xs ml-2">{tx.label}</span>
                                ) : (
                                    <span className="text-text-muted text-xs ml-2">
                                        {new Date(tx.timestamp).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-accent-time font-mono text-sm">
                            {formatLifeTime(tx.hours, tx.minutes)}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default TransactionList;
