import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl ring-1 ring-black/5">
                <p className="font-display font-bold text-lg text-primary mb-1">{label}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span>Count: <span className="font-semibold text-foreground">{payload[0].value}</span></span>
                </div>
            </div>
        );
    }
    return null;
};

const RatingChart = ({ data }) => {
    return (
        <Card className="w-full h-full min-h-[350px] glass-panel border-0 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="font-display text-2xl text-primary">Rating Distribution</CardTitle>
                <CardDescription>Visual breakdown of customer satisfaction.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={data} barSize={40}>
                        <defs>
                            {data.map((entry, index) => (
                                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1" key={index}>
                                    <stop offset="0%" stopColor={COLORS[index]} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={COLORS[index]} stopOpacity={0.3} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000000" opacity={0.05} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#809076', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#809076', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="value" radius={[8, 8, 8, 8]} animationDuration={1500}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke={COLORS[index]} strokeWidth={1} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default RatingChart;
