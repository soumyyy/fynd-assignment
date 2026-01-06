import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RatingChart from '@/components/dashboard/RatingChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import { getReviews } from '@/lib/db';
import { Upload, FileText, CheckCircle, RefreshCcw, Search, Filter, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const BatchAnalysis = () => {
    const [localSubmissions, setLocalSubmissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Filters
    const [ratingFilter, setRatingFilter] = useState('all');
    const [sentimentFilter, setSentimentFilter] = useState('all');

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

    // Derived Metrics & Filtering
    const { filteredData, metrics, trendData } = useMemo(() => {
        // 1. Filter Data
        let filtered = localSubmissions.filter(sub => {
            const matchesSearch = (sub.text || "").toLowerCase().includes(searchTerm.toLowerCase());

            const rating = sub.user_rating || sub.rating || 0;
            const matchesRating = ratingFilter === 'all' ? true : rating.toString() === ratingFilter;

            const sentiment = (sub.sentiment || 'neutral').toLowerCase();
            const matchesSentiment = sentimentFilter === 'all' ? true : sentiment === sentimentFilter;

            return matchesSearch && matchesRating && matchesSentiment;
        });

        // 2. Metrics (on filtered data)
        const total = filtered.length;
        const sum = filtered.reduce((acc, curr) => acc + (curr.user_rating || curr.rating || 0), 0);
        const avgRating = total > 0 ? (sum / total).toFixed(1) : 0;

        // Rating Dist
        const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        filtered.forEach(sub => {
            const r = sub.user_rating || sub.rating || 0;
            if (ratings[r] !== undefined) ratings[r]++;
        });
        const ratingDist = Object.entries(ratings).map(([name, value]) => ({ name: `${name} ★`, value }));

        // Sentiment Dist
        const sentiments = { positive: 0, neutral: 0, negative: 0 };
        filtered.forEach(sub => {
            const s = sub.sentiment ? sub.sentiment.toLowerCase() : 'neutral';
            if (sentiments[s] !== undefined) sentiments[s]++;
            else sentiments.neutral++;
        });
        const sentimentDist = [
            { name: 'Positive', value: sentiments.positive },
            { name: 'Neutral', value: sentiments.neutral },
            { name: 'Negative', value: sentiments.negative },
        ];

        // 3. Trend Data (Reverse chronological for chart)
        const sortedForTrend = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        // Take last 20 for readability
        const recentTrend = sortedForTrend.slice(-20);
        const trend = recentTrend.map((sub, i) => ({
            id: i + 1,
            rating: sub.user_rating || sub.rating || 0,
            date: new Date(sub.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return { filteredData: filtered, metrics: { avgRating, ratingDist, sentimentDist }, trendData: trend };
    }, [localSubmissions, searchTerm, ratingFilter, sentimentFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold tracking-tight text-primary">Admin Panel</h2>
                    {/* <p className="text-muted-foreground mt-1">Real-time intelligence and feedback analytics.</p> */}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary" onClick={fetchData}>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Metrics Overview Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel border-l-4 border-l-primary/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Reviews</p>
                            <h3 className="text-4xl font-bold text-foreground mt-2">{filteredData.length}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-secondary">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Average Rating</p>
                            <h3 className="text-4xl font-bold text-foreground mt-2">{metrics.avgRating}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-panel border-l-4 border-l-primary/50">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Trend</p>
                            <h3 className="text-4xl font-bold text-foreground mt-2">Live</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Live Feed with Filters */}
                <Card className="lg:col-span-2 glass-panel">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6">
                        <div className="mb-4 md:mb-0">
                            <CardTitle className="text-xl text-primary font-display">Feedback Feed</CardTitle>
                            <CardDescription className="text-muted-foreground">Monitor incoming reviews in real-time.</CardDescription>
                        </div>

                        {/* Advanced Filters Toolbar */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-40">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-9 glass-input h-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Rating Dropdown */}
                            <select
                                className="h-10 px-3 rounded-md border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                            >
                                <option value="all">All Stars</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>

                            {/* Sentiment Dropdown */}
                            <select
                                className="h-10 px-3 rounded-md border border-gray-200 bg-white/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                value={sentimentFilter}
                                onChange={(e) => setSentimentFilter(e.target.value)}
                            >
                                <option value="all">All Moods</option>
                                <option value="positive">Positive</option>
                                <option value="neutral">Neutral</option>
                                <option value="negative">Negative</option>
                            </select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            {filteredData.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground/50 flex flex-col items-center">
                                    <Filter className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No matching reviews found.</p>
                                </div>
                            ) : (
                                filteredData.map((sub) => (
                                    <div key={sub.id} className="p-6 m-4 rounded-xl bg-white/60 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
                                        {/* Card Header: Rating & Time */}
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center px-2.5 py-1 rounded-md font-bold text-sm ${(sub.user_rating || sub.rating) >= 4 ? "bg-green-100 text-green-700" :
                                                        (sub.user_rating || sub.rating) <= 2 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {sub.user_rating || sub.rating} ★
                                                </div>
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                                    {new Date(sub.created_at || sub.date).toLocaleDateString()} • {new Date(sub.created_at || sub.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {sub.ai_action && (
                                                <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                                                    {sub.ai_action.replace('Action: ', '')}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Card Body: Review Text */}
                                        <div className="mb-5">
                                            <p className="text-foreground text-base leading-relaxed font-serif">
                                                "{sub.text || <span className="italic text-muted-foreground opacity-60">No written feedback provided.</span>}"
                                            </p>
                                        </div>

                                        {/* Card Footer: AI Summary */}
                                        {sub.ai_summary && (
                                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex items-start gap-3">
                                                <div className="mt-0.5 min-w-[20px]">
                                                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">AI Analysis</span>
                                                    <p className="text-sm text-foreground/80">{sub.ai_summary}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Col: Charts V2 */}
                <div className="space-y-6">
                    {/* Rating Distribution */}
                    <div className="h-[300px]">
                        <RatingChart data={metrics.ratingDist} />
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="h-[300px]">
                        <SentimentChart data={metrics.sentimentDist} />
                    </div>

                    {/* Quality Trend Line Chart */}
                    <Card className="glass-panel">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Quality Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                <LineChart data={trendData}>
                                    <Line
                                        type="monotone"
                                        dataKey="rating"
                                        stroke="#BB6830"
                                        strokeWidth={3}
                                        dot={{ fill: '#BB6830', strokeWidth: 0 }}
                                    />
                                    <XAxis hide />
                                    <YAxis domain={[0, 5]} hide />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', color: '#333' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BatchAnalysis;
