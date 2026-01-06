import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RatingChart from '@/components/dashboard/RatingChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import { getReviews } from '@/lib/db';
import { Upload, FileText, CheckCircle, RefreshCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BatchAnalysis = () => {
    const [localSubmissions, setLocalSubmissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch from Supabase
    const fetchData = async () => {
        const reviews = await getReviews();
        setLocalSubmissions(reviews);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Derived Metrics from Real Data
    const metrics = useMemo(() => {
        const total = localSubmissions.length;
        if (total === 0) return {
            avgRating: 0,
            ratingDist: [],
            sentimentDist: []
        };

        // Average Rating
        const sum = localSubmissions.reduce((acc, curr) => acc + (curr.user_rating || curr.rating || 0), 0);
        const avgRating = (sum / total).toFixed(1);

        // Rating Distribution
        const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        localSubmissions.forEach(sub => {
            const r = sub.user_rating || sub.rating || 0;
            if (ratings[r] !== undefined) ratings[r]++;
        });
        const ratingDist = Object.entries(ratings).map(([name, value]) => ({ name: `${name} ★`, value }));

        // Sentiment Distribution
        const sentiments = { positive: 0, neutral: 0, negative: 0 };
        localSubmissions.forEach(sub => {
            const s = sub.sentiment ? sub.sentiment.toLowerCase() : 'neutral';
            if (sentiments[s] !== undefined) sentiments[s]++;
            else sentiments.neutral++;
        });
        const sentimentDist = [
            { name: 'Positive', value: sentiments.positive },
            { name: 'Neutral', value: sentiments.neutral },
            { name: 'Negative', value: sentiments.negative },
        ];

        return { avgRating, ratingDist, sentimentDist };
    }, [localSubmissions]);

    const filteredSubmissions = localSubmissions.filter(sub =>
        (sub.text || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Live overview of customer sentiment and performance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchData}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
                    </Button>
                </div>
            </div>

            {/* Live Table Section */}
            <Card className="border-none shadow-md bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Feedback</CardTitle>
                        <CardDescription>Real-time feed from user submissions.</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search reviews..."
                            className="pl-8 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-white">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/40 font-medium text-sm text-muted-foreground">
                            <div className="col-span-1">Rating</div>
                            <div className="col-span-4">Review</div>
                            <div className="col-span-3">Summary</div>
                            <div className="col-span-3">Action</div>
                            <div className="col-span-1 text-right">Time</div>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {filteredSubmissions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No reviews yet. Share the portal link to get feedback!
                                </div>
                            ) : (
                                filteredSubmissions.map((sub) => (
                                    <div key={sub.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-muted/10 transition-colors items-start text-sm">
                                        <div className="col-span-1 font-bold text-lg flex items-center">
                                            <span className={(sub.user_rating || sub.rating) >= 4 ? "text-green-600" : (sub.user_rating || sub.rating) <= 2 ? "text-red-500" : "text-yellow-600"}>
                                                {sub.user_rating || sub.rating} ★
                                            </span>
                                        </div>
                                        <div className="col-span-4 text-foreground/80 break-words pr-2">
                                            {sub.text || <span className="italic text-muted-foreground">No text provided</span>}
                                        </div>
                                        <div className="col-span-3 text-muted-foreground italic bg-muted/20 p-2 rounded text-xs">
                                            {sub.ai_summary || "Processing..."}
                                        </div>
                                        <div className="col-span-3">
                                            {sub.ai_action ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {sub.ai_action.replace('Action: ', '')}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </div>
                                        <div className="col-span-1 text-right text-xs text-muted-foreground">
                                            {new Date(sub.created_at || sub.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics & Analytics (Now powered by Real Data) */}
            {localSubmissions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Card className="md:col-span-2 bg-gradient-to-r from-primary/5 to-secondary/30 border-none shadow-sm">
                        <CardContent className="p-6 flex flex-wrap gap-8 justify-around items-center text-center">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Reviews</div>
                                <div className="text-4xl font-bold text-primary">{localSubmissions.length}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Average Rating</div>
                                <div className="text-4xl font-bold text-primary">{metrics.avgRating}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Responses Generated</div>
                                <div className="text-4xl font-bold text-green-600 flex items-center gap-2">
                                    {localSubmissions.length} <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="h-[400px]">
                        <RatingChart data={metrics.ratingDist} />
                    </div>
                    <div className="h-[400px]">
                        <SentimentChart data={metrics.sentimentDist} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchAnalysis;
