import { supabase } from './supabase';

export const saveReview = async (review) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    user_rating: review.user_rating, // Manual Input
                    text: review.text,

                    // AI Outputs
                    rating: review.rating, // AI Predicted
                    sentiment: review.sentiment,
                    explanation: review.explanation,
                    dimensions: review.dimensions,
                    ai_response: review.ai_response,
                    ai_summary: review.ai_summary,
                    ai_action: review.ai_action
                }
            ])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error saving review:', error);
        return null;
    }
};

export const getReviews = async () => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};
