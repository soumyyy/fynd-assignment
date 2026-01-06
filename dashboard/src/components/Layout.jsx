import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, BarChart3, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Layout = ({ children }) => {
    const location = useLocation();
    const isAnalyzer = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Sparkles className="h-6 w-6" />
                        <span>Fynd-Review</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant={isAnalyzer ? "default" : "ghost"} size="sm">
                                Analyzer
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
        </div>
    )
}

export default Layout
