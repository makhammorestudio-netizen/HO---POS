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
    Clock
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

            {/* Quick Actions */}
            <div>
                <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                    <Calendar className="h-6 w-6" />
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

            {/* Recent Activity */}
            <div>
                <h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
                <Card className="glass border-0">
                    <CardContent className="p-6">
                        {metrics?.recentTransactions && metrics.recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {metrics.recentTransactions.map((transaction: any) => (
                                    <div key={transaction.id} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <Clock className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {transaction.items.map((item: any) => item.service.name).join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.customer ? transaction.customer.name : 'Walk-in'} • {transaction.items[0]?.primaryStaff?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">฿{Number(transaction.totalAmount).toFixed(2)}</p>
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
    );
}
