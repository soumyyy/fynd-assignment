import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, BrainCircuit, Search, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

const steps = [
    {
        id: 1,
        title: "Analyze Dimensions",
        description: "Scanning for Food, Service, Ambiance, and Value signals...",
        icon: Search,
        color: "text-blue-500",
        bg: "bg-blue-100"
    },
    {
        id: 2,
        title: "Detect Sentiment",
        description: "Identifying superlatives (5★) vs complaints (1-2★)...",
        icon: BrainCircuit,
        color: "text-purple-500",
        bg: "bg-purple-100"
    },
    {
        id: 3,
        title: "Final Prediction",
        description: "Synthesizing evidence into a star rating.",
        icon: Star,
        color: "text-yellow-500",
        bg: "bg-yellow-100"
    }
];

const ChainOfThought = ({ isThinking, result }) => {
    if (!isThinking && !result) return null;

    return (
        <div className="w-full max-w-3xl mx-auto my-8">
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[28px] top-8 bottom-8 w-1 bg-border/50 -z-10" />

                {steps.map((step, index) => {
                    const isActive = isThinking || result;
                    const isCompleted = result && !isThinking;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
                            transition={{ delay: index * 0.3 }}
                            className="flex gap-6 mb-8 last:mb-0"
                        >
                            <div className={`relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-background shadow-sm ${isCompleted ? 'bg-green-100 text-green-600' : step.bg + ' ' + step.color}`}>
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}

                                {isThinking && index === 1 && (
                                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                                    </span>
                                )}
                            </div>

                            <Card className="flex-1 p-4 hover:shadow-md transition-shadow cursor-default">
                                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                    {step.title}
                                    {isCompleted && <span className="text-xs font-normal text-muted-foreground ml-auto">Completed</span>}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    {isCompleted && step.id === 3 && result
                                        ? `Predicted: ${result.stars} Stars (${result.sentiment})`
                                        : step.description}
                                </p>

                                {isCompleted && step.id === 3 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-4 p-3 bg-muted/50 rounded text-sm italic border-l-4 border-primary"
                                    >
                                        "{result.explanation}"
                                    </motion.div>
                                )}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChainOfThought;
