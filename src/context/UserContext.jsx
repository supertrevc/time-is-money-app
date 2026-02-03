import { createContext, useState, useContext } from 'react';

export const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Preset subscription options with real 2025 pricing
export const SUBSCRIPTION_PRESETS = {
    streaming: [
        { id: 'netflix-ads', name: 'Netflix (with Ads)', price: 7.99, category: 'streaming' },
        { id: 'netflix-standard', name: 'Netflix Standard', price: 17.99, category: 'streaming' },
        { id: 'netflix-premium', name: 'Netflix Premium', price: 24.99, category: 'streaming' },
        { id: 'spotify', name: 'Spotify Premium', price: 11.99, category: 'streaming' },
        { id: 'spotify-duo', name: 'Spotify Duo', price: 16.99, category: 'streaming' },
        { id: 'hulu-ads', name: 'Hulu (with Ads)', price: 9.99, category: 'streaming' },
        { id: 'hulu', name: 'Hulu (No Ads)', price: 18.99, category: 'streaming' },
        { id: 'disney', name: 'Disney+ Basic', price: 9.99, category: 'streaming' },
        { id: 'hbo-max', name: 'Max (with Ads)', price: 9.99, category: 'streaming' },
        { id: 'hbo-max-ad-free', name: 'Max (Ad-Free)', price: 16.99, category: 'streaming' },
        { id: 'youtube-premium', name: 'YouTube Premium', price: 13.99, category: 'streaming' },
        { id: 'apple-tv', name: 'Apple TV+', price: 9.99, category: 'streaming' },
        { id: 'amazon-prime', name: 'Amazon Prime', price: 14.99, category: 'streaming' },
    ],
    fitness: [
        { id: 'planet-fitness', name: 'Planet Fitness', price: 15.00, category: 'fitness' },
        { id: 'planet-fitness-black', name: 'Planet Fitness Black Card', price: 24.99, category: 'fitness' },
        { id: 'la-fitness', name: 'LA Fitness', price: 34.99, category: 'fitness' },
        { id: 'equinox', name: 'Equinox', price: 260.00, category: 'fitness' },
        { id: 'peloton-app', name: 'Peloton App', price: 12.99, category: 'fitness' },
        { id: 'peloton-all', name: 'Peloton All-Access', price: 44.00, category: 'fitness' },
    ],
    utilities: [
        { id: 'phone-basic', name: 'Phone Plan (Basic)', price: 35.00, category: 'utilities' },
        { id: 'phone-unlimited', name: 'Phone Plan (Unlimited)', price: 75.00, category: 'utilities' },
        { id: 'internet', name: 'Home Internet', price: 60.00, category: 'utilities' },
        { id: 'cloud-storage', name: 'iCloud+ / Google One', price: 2.99, category: 'utilities' },
        { id: 'cloud-storage-200', name: 'Cloud Storage (200GB)', price: 9.99, category: 'utilities' },
    ],
    other: [
        { id: 'xbox-gamepass', name: 'Xbox Game Pass', price: 16.99, category: 'other' },
        { id: 'playstation-plus', name: 'PlayStation Plus', price: 9.99, category: 'other' },
        { id: 'audible', name: 'Audible Premium', price: 14.95, category: 'other' },
        { id: 'nytimes', name: 'NY Times Digital', price: 25.00, category: 'other' },
        { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: 20.00, category: 'other' },
    ]
};

export const UserProvider = ({ children }) => {
    // Initial State: "Incomplete" profile
    const [userProfile, setUserProfile] = useState({
        financials: {
            netMonthlyIncome: 0,
            monthlyContractHours: 160,
        },
        hiddenCosts: {
            dailyRoundTripMiles: 0,
            monthlyCommuteHours: 0,
            monthlyGroomingHours: 0,
            dailyLunchCost: 0,
            wardrobeCost: 0,
            monthlyFixedCosts: 0
        },
        realWage: 0,
        isOnboardingComplete: false
    });

    // Transaction list for tracking committed purchases
    const [transactions, setTransactions] = useState([]);

    // Active subscriptions list
    const [subscriptions, setSubscriptions] = useState([]);

    const calculateRealWage = (data) => {
        const totalMoneyIn = Number(data.financials.netMonthlyIncome) || 0;

        const monthlyLunchCost = (Number(data.hiddenCosts.dailyLunchCost) || 0) * 21.67;

        const totalMoneyOut =
            monthlyLunchCost +
            (Number(data.hiddenCosts.wardrobeCost) || 0) +
            (Number(data.hiddenCosts.monthlyFixedCosts) || 0) +
            ((Number(data.hiddenCosts.dailyRoundTripMiles) || 0) * 21.67 * 0.67);

        const totalHoursInvested =
            (Number(data.financials.monthlyContractHours) || 0) +
            (Number(data.hiddenCosts.monthlyCommuteHours) || 0) +
            (Number(data.hiddenCosts.monthlyGroomingHours) || 0);

        if (totalHoursInvested === 0) return 0;

        const wage = (totalMoneyIn - totalMoneyOut) / totalHoursInvested;
        return wage > 0 ? wage : 0;
    };

    const updateUserProfile = (newData) => {
        setUserProfile(prev => {
            const updated = {
                ...prev,
                financials: { ...prev.financials, ...(newData.financials || {}) },
                hiddenCosts: { ...prev.hiddenCosts, ...(newData.hiddenCosts || {}) }
            };

            const newWage = calculateRealWage(updated);
            return { ...updated, realWage: newWage };
        });
    };

    const completeOnboarding = () => {
        setUserProfile(prev => ({ ...prev, isOnboardingComplete: true }));
    };

    const calculateLifeCost = (price) => {
        const hourlyWage = userProfile.realWage;

        if (!hourlyWage || hourlyWage === 0) {
            return { hours: 0, minutes: 0 };
        }

        const totalHours = price / hourlyWage;
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        return { hours, minutes };
    };

    // Add a transaction to the list
    const addTransaction = (amount, lifeCost, label = '') => {
        const newTransaction = {
            id: Date.now(),
            amount: Number(amount),
            hours: lifeCost.hours,
            minutes: lifeCost.minutes,
            label: label,
            timestamp: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    // Remove a transaction by ID
    const removeTransaction = (id) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id));
    };

    // Add a subscription
    const addSubscription = (subscription) => {
        const lifeCost = calculateLifeCost(subscription.price);
        const newSub = {
            ...subscription,
            addedAt: new Date().toISOString(),
            hours: lifeCost.hours,
            minutes: lifeCost.minutes
        };
        setSubscriptions(prev => [...prev, newSub]);
    };

    // Remove a subscription by ID
    const removeSubscription = (id) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    };

    // Calculate total monthly subscription cost
    const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

    return (
        <UserContext.Provider value={{
            userProfile,
            updateUserProfile,
            completeOnboarding,
            calculateLifeCost,
            transactions,
            addTransaction,
            removeTransaction,
            subscriptions,
            addSubscription,
            removeSubscription,
            totalSubscriptionCost
        }}>
            {children}
        </UserContext.Provider>
    );
};
