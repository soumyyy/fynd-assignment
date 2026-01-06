import { supabase } from './supabase';

export const saveReview = async (review) => {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    rating: review.rating,
                    text: review.text,
                    sentiment: review.sentiment,
                    explanation: review.explanation,
                    dimensions: review.dimensions
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
