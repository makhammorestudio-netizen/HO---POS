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
import { DaySchedule } from '@/components/dashboard/DaySchedule';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';

interface DashboardMetrics {
    monthlyRevenue: number;
    todayTransactions: number;
    totalStaff: number;
    totalCustomers: number;
    recentTransactions: any[];
    todayAppointments: any[];
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                                <p className="metric-number">฿{metrics?.monthlyRevenue.toFixed(2) || '0.00'}</p>
                                <p className="text-xs text-muted-foreground">This month's total</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-coral">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                                <p className="metric-number">{metrics?.todayTransactions || 0}</p>
                                <p className="text-xs text-muted-foreground">Transactions today</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-peach">
                                <Calendar className="h-6 w-6 text-secondary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                                <p className="metric-number">{metrics?.totalStaff || 0}</p>
                                <p className="text-xs text-muted-foreground">Team members</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-lavender">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                                <p className="metric-number">{metrics?.totalCustomers || 0}</p>
                                <p className="text-xs text-muted-foreground">Registered clients</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-coral">
                                <TrendingUp className="h-6 w-6 text-accent" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Financial Goal */}
                    {/* Financial Goal */}
                    <Card className="bg-white border-0 rounded-friendly card-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                Financial Goal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Monthly Target</span>
                                    <span className="text-2xl font-bold text-primary">฿{monthlyTarget.toLocaleString()}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-40 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-100 p-6 shadow-inner">
                                    {/* Chart Line (Simulated) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden rounded-2xl">
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/20 to-primary/5 transition-all duration-1000"
                                            style={{ height: `${Math.min(progress, 100)}%` }}
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(31,60,136,0.5)]" />
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="text-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/50">
                                            <div className="text-3xl font-bold text-primary">{progress.toFixed(0)}%</div>
                                            <div className="text-xs font-medium text-muted-foreground">ACHIEVED</div>
                                        </div>
                                    </div>

                                    {/* Target Line */}
                                    <div className="absolute left-0 right-0 top-0 border-t-2 border-dashed border-primary/30" />
                                </div>

                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                                    <span className="text-sm font-medium text-muted-foreground">Current Revenue</span>
                                    <span className="text-lg font-bold text-primary">฿{(metrics?.monthlyRevenue || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div>
                        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
                        <div className="grid gap-4">
                            <Link href="/pos">
                                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer group">
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className="rounded-xl bg-pastel-peach p-3 text-secondary group-hover:scale-110 transition-transform">
                                            <Scissors className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">New Sale</h4>
                                            <p className="text-sm text-muted-foreground">Start POS terminal</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/customers">
                                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer group">
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className="rounded-xl bg-pastel-lavender p-3 text-primary group-hover:scale-110 transition-transform">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Register Customer</h4>
                                            <p className="text-sm text-muted-foreground">Add new client</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/services">
                                <Card className="bg-white border-0 rounded-friendly card-shadow hover:card-shadow-hover transition-all hover:scale-[1.02] cursor-pointer group">
                                    <CardContent className="flex items-center gap-4 p-5">
                                        <div className="rounded-xl bg-pastel-coral p-3 text-accent-foreground group-hover:scale-110 transition-transform">
                                            <CalendarDays className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Manage Services</h4>
                                            <p className="text-sm text-muted-foreground">View & edit catalog</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    {/* Day Schedule */}
                    <DaySchedule />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Upcoming Appointments */}
                    <UpcomingAppointments />

                    {/* Recent Activity */}
                    {/* Recent Activity */}
                    <Card className="bg-white border-0 rounded-friendly card-shadow">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                                <div className="space-y-4">
                                    {metrics.recentTransactions.slice(0, 5).map((transaction: any) => (
                                        <div key={transaction.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0 hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-xl bg-pastel-lavender p-2">
                                                    <Scissors className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">
                                                        {transaction.items.map((item: any) => item.service.name).join(', ')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {transaction.customer ? transaction.customer.fullName : 'Walk-in'} • {transaction.items[0]?.primaryStaff?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm text-primary">฿{Number(transaction.totalAmount).toFixed(2)}</p>
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
