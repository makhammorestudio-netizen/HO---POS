"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    Users,
    Calendar,
    TrendingUp,
    Scissors,
    UserPlus,
    Clock,
    Target,
    CalendarDays
} from 'lucide-react';

interface DashboardMetrics {
    monthlyRevenue: number;
    todayTransactions: number;
    totalStaff: number;
    totalCustomers: number;
    recentTransactions: any[];
}

export default function Home() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard metrics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    const monthlyTarget = 200000; // ฿200k target
    const progress = ((metrics?.monthlyRevenue || 0) / monthlyTarget) * 100;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here's your salon overview.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{metrics?.monthlyRevenue.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">
                            This month's total
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.todayTransactions || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Transactions today
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalStaff || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Team members
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered clients
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Financial Goal */}
                    <Card className="glass border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Financial Goal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-muted-foreground">Target</span>
                                    <span className="text-lg font-bold">฿{monthlyTarget.toLocaleString()}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-32 rounded-lg bg-gradient-to-t from-primary/20 to-primary/5 p-4">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 rounded-lg bg-gradient-to-t from-primary to-primary/50 transition-all duration-1000"
                                        style={{ height: `${Math.min(progress, 100)}%` }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold">{progress.toFixed(0)}%</div>
                                            <div className="text-xs text-muted-foreground">of monthly target</div>
                                        </div>
                                    </div>
                                    {/* Target Line */}
                                    <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-primary/50" />
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current</span>
                                    <span className="font-semibold text-primary">฿{(metrics?.monthlyRevenue || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
                        <div className="grid gap-4">
                            <Link href="/pos">
                                <Card className="glass-hover cursor-pointer border-0 transition-all hover:scale-105">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                            <Scissors className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">New Sale</h4>
                                            <p className="text-sm text-muted-foreground">Start POS terminal</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/customers">
                                <Card className="glass-hover cursor-pointer border-0 transition-all hover:scale-105">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Register Customer</h4>
                                            <p className="text-sm text-muted-foreground">Add new client</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/services">
                                <Card className="glass-hover cursor-pointer border-0 transition-all hover:scale-105">
                                    <CardContent className="flex items-center gap-4 p-6">
                                        <div className="rounded-lg bg-primary/10 p-3 text-primary">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Manage Services</h4>
                                            <p className="text-sm text-muted-foreground">View & edit catalog</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Today's Bookings */}
                    <Card className="glass border-0">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Today's Bookings
                            </CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </CardHeader>
                        <CardContent>
                            {metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                                <div className="space-y-3">
                                    {metrics.recentTransactions.slice(0, 6).map((transaction: any) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Clock className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">
                                                            {transaction.customer ? transaction.customer.name : 'Walk-in Customer'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {transaction.items.map((item: any) => item.service.name).join(', ')}
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-primary whitespace-nowrap">
                                                        ฿{Number(transaction.totalAmount).toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{new Date(transaction.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span>•</span>
                                                    <span>{transaction.items[0]?.primaryStaff?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                    <CalendarDays className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                    <p className="font-medium">No bookings yet</p>
                                    <p className="text-sm">Transactions will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="glass border-0">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.recentTransactions.slice(0, 5).map((transaction: any) => (
                                        <div key={transaction.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Scissors className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {transaction.items.map((item: any) => item.service.name).join(', ')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.customer ? transaction.customer.name : 'Walk-in'} • {transaction.items[0]?.primaryStaff?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">฿{Number(transaction.totalAmount).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(transaction.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p>No recent transactions</p>
                                    <p className="text-sm">Start a sale to see activity here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
