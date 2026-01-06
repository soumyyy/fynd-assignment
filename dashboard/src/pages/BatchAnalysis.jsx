
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RatingChart from '@/components/dashboard/RatingChart';
import SentimentChart from '@/components/dashboard/SentimentChart';
import { getReviews } from '@/lib/db';
import { Upload, FileText, CheckCircle, RefreshCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const mockRatingData = [
    { name: '1 ★', value: 15 },
    { name: '2 ★', value: 25 },
    { name: '3 ★', value: 30 },
    { name: '4 ★', value: 80 },
    { name: '5 ★', value: 50 },
];

const mockSentimentData = [
    { name: 'Positive', value: 130 },
    { name: 'Neutral', value: 30 },
    { name: 'Negative', value: 40 },
];

const BatchAnalysis = () => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [localSubmissions, setLocalSubmissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch from Supabase
    const fetchData = async () => {
        const reviews = await getReviews();
        setLocalSubmissions(reviews);
    };

    useEffect(() => {
        fetchData();

        // Real-time polling
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLoadSample = () => {
        setTimeout(() => setDataLoaded(true), 800);
    };

    const filteredSubmissions = localSubmissions.filter(sub =>
        sub.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Live overview of incoming feedback and analytics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleLoadSample} className={dataLoaded ? "hidden" : ""}>
                        <FileText className="mr-2 h-4 w-4" /> Load Demo Data
                    </Button>
                    <Button variant="secondary">
                        <RefreshCcw className="mr-2 h-4 w-4" /> Auto-Live
                    </Button>
                </div>
            </div>

            {/* Live Table Section (Always Visible) */}
            <Card className="border-none shadow-md bg-white/60 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>Real-time feed from the analyzer.</CardDescription>
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
                            <div className="col-span-8">Review Summary</div>
                            <div className="col-span-2">Sentiment</div>
                            <div className="col-span-1 text-right">Time</div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {filteredSubmissions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No submissions found. Try submitting a review in the Analyzer.
                                </div>
                            ) : (
                                filteredSubmissions.map((sub) => (
                                    <div key={sub.id} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 hover:bg-muted/10 transition-colors items-center text-sm">
                                        <div className="col-span-1 font-bold text-lg flex items-center">
                                            <span className={sub.rating >= 4 ? "text-green-600" : sub.rating <= 2 ? "text-red-500" : "text-yellow-600"}>
                                                {sub.rating} ★
                                            </span>
                                        </div>
                                        <div className="col-span-8 truncate pr-4 text-foreground/80">
                                            {sub.text}
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant={sub.sentiment === 'positive' ? 'success' : sub.sentiment === 'negative' ? 'destructive' : 'secondary'} className="capitalize">
                                                {sub.sentiment}
                                            </Badge>
                                        </div>
                                        <div className="col-span-1 text-right text-xs text-muted-foreground">
                                            {new Date(sub.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!dataLoaded ? (
                <Card className="border-dashed h-[300px] flex items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-muted/20 transition-colors" onClick={handleLoadSample}>
                    <div className="text-center space-y-4 text-muted-foreground">
                        <Upload className="h-12 w-12 mx-auto opacity-20" />
                        <p>Load full dataset to view aggregate analytics charts.</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Key Metrics Cards */}
                    <Card className="md:col-span-2 bg-gradient-to-r from-primary/5 to-secondary/30 border-none shadow-sm">
                        <CardContent className="p-6 flex flex-wrap gap-8 justify-around items-center text-center">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Reviews</div>
                                <div className="text-4xl font-bold text-primary">200</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Average Rating</div>
                                <div className="text-4xl font-bold text-primary">3.8</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">AI Accuracy</div>
                                <div className="text-4xl font-bold text-green-600 flex items-center gap-2">
                                    94% <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Charts */}
                    <div className="h-[400px]">
                        <RatingChart data={mockRatingData} />
                    </div>
                    <div className="h-[400px]">
                        <SentimentChart data={mockSentimentData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchAnalysis;
