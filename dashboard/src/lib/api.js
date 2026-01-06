// Simulated AI Engine for Review Analytics
// Mimics a Professional Business Owner Persona

export const analyzeReview = async (text, userRating) => {
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Handle "Rating Only" Submission
    if (!text || text.trim() === "") {
        return {
            stars: userRating,
            sentiment: userRating >= 4 ? 'positive' : userRating <= 2 ? 'negative' : 'neutral',
            explanation: `User provided ${userRating} star rating without text.`,
            ai_response: generateRatingOnlyResponse(userRating),
            ai_summary: `Rated ${userRating} stars (No text).`,
            ai_action: userRating <= 2 ? "Action: Monitor for future low ratings." : "Action: No action needed.",
            confidence: 1.0,
            dimensions: {}
        };
    }

    const lowerText = text.toLowerCase().trim();

    // 1. DIMENSION EXTRACTION (Standard Logic)
    const dimensions = {
        food: checkDimension(lowerText, ['food', 'pizza', 'burger', 'steak', 'meal', 'dish', 'flavor', 'taste', 'menu', 'chicken', 'sushi', 'drink']),
        service: checkDimension(lowerText, ['service', 'staff', 'waiter', 'host', 'manager', 'slow', 'fast', 'rude', 'friendly', 'attentive', 'server']),
        ambiance: checkDimension(lowerText, ['ambiance', 'atmosphere', 'vibe', 'decor', 'noise', 'music', 'lighting', 'seat', 'clean', 'dirty']),
        value: checkDimension(lowerText, ['value', 'price', 'expensive', 'cheap', 'worth', 'cost', 'bill', 'overpriced'])
    };

    // 2. SENTIMENT CHECK
    const { score, signals, tone } = analyzeSentiment(lowerText);

    // 3. OWNER RESPONSE GENERATION
    const ai_response = generateOwnerResponse(tone, dimensions, userRating, lowerText);
    const ai_summary = generateSummary(dimensions, tone);
    const ai_action = generateAction(tone, dimensions, userRating);

    return {
        stars: userRating, // Trust user rating for final star count
        predicted_stars: calculateStars(score), // Internal check
        sentiment: tone,
        explanation: `User rated ${userRating}. Text sentiment analysis score: ${score}.`,
        ai_response,
        ai_summary,
        ai_action,
        confidence: 0.95,
        dimensions
    };
};

function generateRatingOnlyResponse(stars) {
    if (stars === 5) return "Wow! Thank you for the perfect rating! We're thrilled you enjoyed your visit.";
    if (stars === 4) return "Thank you for the great rating! We hope to see you again soon.";
    if (stars === 3) return "Thanks for visiting. We hope to impress you more next time!";
    return "Thank you for your feedback. We're sorry if we didn't meet your expectations.";
}

function generateOwnerResponse(tone, dimensions, stars, text) {
    // High Rating Response
    if (stars >= 4) {
        if (text.length < 20) return "Thank you so much! We're happy to hear you had a great time.";
        return "Thank you for the wonderful review! We're absolutely delighted that you enjoyed your experience. We can't wait to welcome you back!";
    }

    // Low Rating / Complaint Response
    if (stars <= 2 || tone === 'negative') {
        return "We represent the management team, and we want to sincerely apologize. This is not the standard we strive for. We'd love the chance to make this right—please reach out to us directly.";
    }

    // Mixed / Neutral
    return "Thank you for your feedback. We appreciate you visiting us and will use your comments to improve.";
}

function generateSummary(dimensions, tone) {
    const feats = Object.entries(dimensions)
        .filter(([k, v]) => v.includes('Detected'))
        .map(([k]) => k)
        .join(', ');
    return feats ? `Discussed: ${feats}. Sentiment: ${tone}` : `Sentiment: ${tone}`;
}

function generateAction(tone, dimensions, stars) {
    if (stars <= 2) return "Action: IMMEDIATE: Contact customer & investigate.";
    if (tone === 'negative') return "Action: Review specific complaints with team.";
    if (stars === 5) return "Action: Share positive feedback with staff.";
    return "Action: No immediate action required.";
}

// ... Keep Helpers (checkDimension, analyzeSentiment, calculateStars) ...
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
