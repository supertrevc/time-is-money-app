import React from 'react';
import LifePriceConverter from './LifePriceConverter';
import OnboardingWizard from './OnboardingWizard';
import FreedomBar from './FreedomBar';
import TransactionList from './TransactionList';
import SubscriptionList from './SubscriptionList';
import { useUser } from '../context/UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import logoImage from '/favicon.png?url';

const Dashboard = () => {
    const { userProfile } = useUser();
    const needsOnboarding = !userProfile.isOnboardingComplete;

    return (
        <div className="min-h-screen bg-bg-deep text-text-primary p-4 sm:p-8 pb-20 font-mono relative overflow-hidden">
            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* HEADER */}
                <header className="mb-10 sm:mb-16 text-center sm:text-left border-b border-text-muted/20 pb-6">
                    <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-text-primary mb-2">
                        Anti-Budget Terminal <span className="text-accent-time text-sm ml-2">v2.0</span>
                    </h1>
                    <p className="text-text-muted text-xs sm:text-sm uppercase tracking-widest">
                        System Status: <span className="text-accent-success">ONLINE</span>
                    </p>
                </header>

                {/* ANIMATED LAYOUT SWITCHER */}
                <AnimatePresence mode="wait">
                    {needsOnboarding ? (
                        <motion.div
                            key="onboarding"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                        >
                            <OnboardingWizard />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                        >
                            {/* LEFT COLUMN: PRIMARY INPUT */}
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-accent-freedom rounded-full animate-pulse"></div>
                                        Life-Price Converter
                                    </h2>
                                    <LifePriceConverter />
                                </section>

                                {/* FREEDOM BAR */}
                                <section>
                                    <FreedomBar />
                                </section>
                            </div>

                            {/* RIGHT COLUMN: EXPENSES */}
                            <div className="space-y-8">
                                {/* ONE-TIME TRANSACTIONS */}
                                <section>
                                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-6">
                                        Committed Expenses
                                    </h2>
                                    <TransactionList />
                                </section>

                                {/* MONTHLY SUBSCRIPTIONS */}
                                <section>
                                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-6">
                                        Monthly Subscriptions
                                    </h2>
                                    <SubscriptionList />
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FOOTER BAR */}
            <footer className="fixed bottom-0 left-0 right-0 bg-bg-card/90 backdrop-blur-sm border-t border-text-muted/20 py-3 px-4 sm:px-8 z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={logoImage}
                            alt="Anti-Budget Terminal Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-xs text-text-muted uppercase tracking-widest hidden sm:inline">
                            Time {">"} Money
                        </span>
                    </div>
                    <span className="text-xs text-text-muted">
                        © {new Date().getFullYear()} Anti-Budget Terminal
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
