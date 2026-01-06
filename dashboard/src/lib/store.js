// Persistent store using LocalStorage to mimic a database
// This ensures data survives page reloads and feels like a real backend integration

const DB_KEY = 'review_mind_db_v1';

// Initial seed data
const SEED_DATA = [
    {
        id: 1,
        rating: 5,
        text: "Absolutely loved the ambiance! The jazz music was perfect.",
        sentiment: "positive",
        date: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
        id: 2,
        rating: 2,
        text: "Service was extremely slow. Waited 40 mins for water.",
        sentiment: "negative",
        date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
        id: 3,
        rating: 4,
        text: "Great food, but a bit pricey for the portion size.",
        sentiment: "neutral",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    }
];

// Helper to get data
const getDb = () => {
    try {
        const item = localStorage.getItem(DB_KEY);
        return item ? JSON.parse(item) : SEED_DATA;
    } catch (e) {
        return SEED_DATA;
    }
};

// Validates and syncs memory with "DB"
export let submissions = getDb();

export const addSubmission = (review) => {
    const newSubmission = {
        id: Date.now(), // Unique ID based on timestamp
        ...review,
        date: new Date().toISOString(),
    };

    // Add to memory
    submissions.unshift(newSubmission);

    // Sync to "DB"
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(submissions));
    } catch (e) {
        console.error("Failed to save to local DB", e);
    }

    return newSubmission;
};

// Force refresh helper
export const refreshData = () => {
    submissions = getDb();
    return submissions;
};
