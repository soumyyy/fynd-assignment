import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeReview } from '@/lib/api'; // Mock Engine
import { saveReview } from '@/lib/db';     // Supabase
import { Loader2, Send, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewAnalyzer = () => {
    const [review, setReview] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (userRating === 0) {
            alert("Please select a star rating to continue.");
            return;
        }

        setLoading(true);

        try {
            // Get AI Response (Owner Persona)
            const data = await analyzeReview(review, userRating);
            setResult(data);

            // Save to Backend
            await saveReview({
                user_rating: userRating,
                text: review || "", // Save empty string if optional

                // Analytics
                rating: data.stars,
                sentiment: data.sentiment,
                explanation: data.explanation,
                dimensions: data.dimensions,
                ai_response: data.ai_response,
                ai_summary: data.ai_summary,
                ai_action: data.ai_action
            });

            setSubmitted(true);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setReview('');
        setUserRating(0);
        setResult(null);
        setSubmitted(false);
    };

    if (submitted && result) {
        return (
            <div className="max-w-xl mx-auto pt-20 pb-20 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center"
                >
                    <div className="flex justify-center text-green-600 mb-6">
                        <CheckCircle2 className="w-20 h-20" />
                    </div>

                    <h2 className="text-3xl font-bold text-primary font-display">Thank You!</h2>

                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md overflow-hidden ring-1 ring-black/5">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-8 pt-6">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                Manager Response
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <p className="text-xl font-medium text-foreground/80 leading-relaxed font-serif italic">
                                "{result.ai_response}"
                            </p>
                        </CardContent>
                        <CardFooter className="justify-center bg-gray-50/50 p-6">
                            <Button onClick={handleReset} variant="outline">Submit Another Review</Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pt-12 pb-20 px-4 space-y-8">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-primary font-display">How was your experience?</h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    We value your feedback. Please rate your visit and let us know how we did.
                </p>
            </div>

            <Card className="border-0 shadow-2xl bg-white/70 backdrop-blur-xl ring-1 ring-black/5 overflow-hidden">
                <CardContent className="p-8 md:p-12 space-y-10">

                    {/* Star Rating Section */}
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center gap-2 md:gap-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    key={star}
                                    onClick={() => setUserRating(star)}
                                    className={cn(
                                        "text-4xl md:text-5xl transition-colors duration-200 focus:outline-none",
                                        userRating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 hover:text-gray-300'
                                    )}
                                >
                                    <Star className={cn("w-10 h-10 md:w-12 md:h-12 fill-current")} />
                                </motion.button>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground h-6">
                            {userRating === 5 ? "Excellent!" : userRating === 4 ? "Good" : userRating === 3 ? "Average" : userRating === 2 ? "Poor" : userRating === 1 ? "Terrible" : "Tap a star to rate"}
                        </p>
                    </div>

                    {/* Optional Text Review */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline px-1">
                            <label className="text-sm font-semibold text-foreground/70">Review (Optional)</label>
                            <span className="text-xs text-muted-foreground italic">Tell us more</span>
                        </div>
                        <Textarea
                            placeholder="What did you like? What can we improve?"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="min-h-[140px] text-lg p-4 resize-none bg-white/50 border-gray-200 focus:border-primary/30 focus:ring-primary/20 transition-all rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || userRating === 0}
                        size="lg"
                        className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Send Feedback <Send className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground/40">
                Powered by Customer Experience Engine
            </p>
        </div>
    );
};

export default ReviewAnalyzer;
