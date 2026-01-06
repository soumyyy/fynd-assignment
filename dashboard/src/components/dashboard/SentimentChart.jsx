import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#284139', '#F8D794', '#BB6830']; // Emerald, Khaki, Earth

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-lg">
                <span className="font-semibold text-primary">{payload[0].name}:</span>
                <span className="ml-2 font-mono text-foreground">{payload[0].value}</span>
            </div>
        );
    }
    return null;
};

const SentimentChart = ({ data }) => {
    return (
        <Card className="w-full h-full min-h-[350px] glass-panel border-0 shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="font-display text-2xl text-primary">Sentiment Breakdown</CardTitle>
                <CardDescription>Emotional analysis of feedback.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry, index) => (
                                <span className="text-sm font-medium text-muted-foreground ml-1">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SentimentChart;
