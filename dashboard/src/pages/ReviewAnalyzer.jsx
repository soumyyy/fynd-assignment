import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeReview } from '@/lib/api';
import { saveReview } from '@/lib/db';
import { Loader2, Sparkles, Check } from 'lucide-react';
import ChainOfThought from '@/components/dashboard/ChainOfThought';
import { cn } from '@/lib/utils';

const ReviewAnalyzer = () => {
    const [review, setReview] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleAnalyze = async () => {
        if (!review.trim()) return;

        setLoading(true);
        setResult(null);
        setSaved(false);

        // Simulate complex thinking time
        setTimeout(async () => {
            try {
                const data = await analyzeReview(review);
                setResult(data);

                // Save to Supabase
                const savedRecord = await saveReview({
                    rating: data.stars,
                    text: review,
                    sentiment: data.sentiment,
                    explanation: data.explanation,
                    dimensions: data.dimensions
                });

                if (savedRecord) {
                    setSaved(true);
                } else {
                    console.error("Save failed - check console for details");
                    alert("Failed to save to database! Check your .env configuration and Supabase RLS policies.");
                }
            } catch (error) {
                console.error("Analysis failed:", error);
            } finally {
                setLoading(false);
            }
        }, 2500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* Input Section */}
            <div className="grid gap-8 md:grid-cols-5 items-start">
                <div className="md:col-span-2 space-y-4 sticky top-24">
                    <h2 className="text-4xl font-bold tracking-tight text-primary font-display">
                        Analyze Feedback
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Paste a customer review to reveal hidden sentiments and predict ratings with our enterprise AI engine.
                    </p>

                    <div className="p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground">
                        <p className="font-semibold mb-2">Try this example:</p>
                        <p className="italic">"The ambiance was incredible and the staff were so kind, but the food took way too long to arrive. A bit overpriced for what we got."</p>
                    </div>
                </div>

                <Card className="md:col-span-3 border-2 border-muted/30 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-muted/10 border-b border-muted/20">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Input Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Textarea
                            placeholder="Paste review content here..."
                            value={review}
                            onChange={(e) => {
                                setReview(e.target.value);
                                setResult(null); // Reset on change
                                setSaved(false);
                            }}
                            className="min-h-[200px] text-lg p-6 border-0 focus-visible:ring-0 resize-none bg-transparent"
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-muted/5 border-t border-muted/20 p-4">
                        <span className="text-xs text-muted-foreground">
                            {review.length} characters
                        </span>
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || !review.trim()}
                            size="lg"
                            className={cn(
                                "transition-all duration-300 font-semibold shadow-lg",
                                saved ? "bg-green-600 hover:bg-green-700 shadow-green-200" : "shadow-primary/20"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : saved ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Analyzed & Saved
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Analyze Review
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* AI Reasoning Section (Walking Route) */}
            {(loading || result) && (
                <div className="border-t border-dashed border-primary/20 pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px bg-border flex-1 max-w-[100px]" />
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Live AI Reasoning
                        </h3>
                        <div className="h-px bg-border flex-1 max-w-[100px]" />
                    </div>

                    <ChainOfThought isThinking={loading} result={result} />
                </div>
            )}
        </div>
    );
};

export default ReviewAnalyzer;
