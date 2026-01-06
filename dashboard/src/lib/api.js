// Simulated AI Engine for Review Analytics
// Mimics Chain-of-Thought reasoning with a robust heuristic model

export const analyzeReview = async (text) => {
    // Simulate "thinking" time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const lowerText = text.toLowerCase().trim();

    // 1. DIMENSION EXTRACTION
    const dimensions = {
        food: checkDimension(lowerText, ['food', 'pizza', 'burger', 'steak', 'meal', 'dish', 'flavor', 'taste', 'menu', 'chicken', 'sushi', 'drink']),
        service: checkDimension(lowerText, ['service', 'staff', 'waiter', 'host', 'manager', 'slow', 'fast', 'rude', 'friendly', 'attentive', 'server']),
        ambiance: checkDimension(lowerText, ['ambiance', 'atmosphere', 'vibe', 'decor', 'noise', 'music', 'lighting', 'seat', 'clean', 'dirty']),
        value: checkDimension(lowerText, ['value', 'price', 'expensive', 'cheap', 'worth', 'cost', 'bill', 'overpriced'])
    };

    // 2. SENTIMENT & SIGNAL DETECTION
    const { score, signals, tone } = analyzeSentiment(lowerText);

    // 3. RATING PREDICTION
    let stars = calculateStars(score);

    // Edge case: Short enthusiastic texts (e.g., "Phenomenal!") should always be 5
    if (lowerText.length < 50 && score > 2) stars = 5;

    // 4. GENERATE REASONING
    const explanation = generateExplanation(dimensions, signals, tone, stars, lowerText);

    return {
        stars,
        sentiment: tone,
        explanation,
        confidence: min(0.85 + (Math.abs(score) * 0.05), 0.99), // Higher confidence for stronger sentiments
        dimensions
    };
};

function checkDimension(text, keywords) {
    const found = keywords.find(k => text.includes(k));
    return found ? `Detected (${found})` : 'Not mentioned';
}

function analyzeSentiment(text) {
    // Expanded Dictionary
    const superlatives = ['phenomenal', 'outstanding', 'incredible', 'amazing', 'perfect', 'world-class', 'exquisite', 'heavenly', 'superb', 'fantastic', 'mind-blowing', 'best', 'loved', 'excellent'];
    const positives = ['good', 'great', 'nice', 'tasty', 'delicious', 'fresh', 'friendly', 'clean', 'liked', 'enjoyed', 'decent', 'cool', 'happy'];
    const negatives = ['bad', 'poor', 'mediocre', 'bland', 'dry', 'slow', 'expensive', 'noisy', 'dirty', 'small', 'cold', 'salty'];
    const disasters = ['terrible', 'horrible', 'awful', 'gross', 'worst', 'disgusting', 'rude', 'inedible', 'hated', 'avoid', 'never again', 'poison'];

    let score = 0;
    const signals = [];

    // Superlatives (+3)
    superlatives.forEach(w => {
        if (text.includes(w)) { score += 3; signals.push(`Superlative: "${w}"`); }
    });

    // Positives (+1)
    positives.forEach(w => {
        if (text.includes(w)) { score += 1; signals.push(`Positive: "${w}"`); }
    });

    // Negatives (-1.5)
    negatives.forEach(w => {
        if (text.includes(w)) { score -= 1.5; signals.push(`Negative: "${w}"`); }
    });

    // Disasters (-4)
    disasters.forEach(w => {
        if (text.includes(w)) { score -= 4; signals.push(`Critical: "${w}"`); }
    });

    // Context checks
    if (text.includes("not good") || text.includes("not great")) { score -= 1.5; signals.push('Negation detected'); }
    if (text.includes("wait") && (text.includes("long") || text.includes("minute") || text.includes("hour"))) { score -= 1; signals.push('Wait time issue'); }

    let tone = 'neutral';
    if (score >= 2) tone = 'positive';
    else if (score <= -1) tone = 'negative';

    return { score, signals, tone };
}

function calculateStars(score) {
    if (score >= 2.5) return 5;
    if (score >= 1) return 4;
    if (score >= -0.5) return 3;
    if (score >= -3) return 2;
    return 1;
}

function generateExplanation(dimensions, signals, tone, stars, text) {
    const lines = [];

    // Step 1
    const activeDims = Object.keys(dimensions).filter(k => dimensions[k] !== 'Not mentioned');
    const dimStr = activeDims.length > 0
        ? `Focused on ${activeDims.join(', ')}.`
        : "General experience assessment.";
    lines.push(`1. Analyzed key dimensions: ${dimStr}`);

    // Step 2
    if (signals.length > 0) {
        const topSignals = signals.slice(0, 3).join(", ");
        lines.push(`2. Signals identified: ${topSignals}.`);
    } else {
        lines.push("2. No strong sentiment keywords detected (neutral phrasing).");
    }

    // Step 3
    const starDesc = stars === 5 ? "Exceptional" : stars === 1 ? "Very Poor" : stars === 3 ? "Average" : stars === 4 ? "Good" : "Below Average";
    lines.push(`3. Conclusion: Tone is ${tone}. Assigning ${stars} stars (${starDesc}).`);

    return lines.join("\n");
}

function min(a, b) { return a < b ? a : b; }
