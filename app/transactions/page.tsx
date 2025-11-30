"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Banknote,
    CreditCard,
    Smartphone,
    QrCode,
    Calendar,
    Filter,
    Download,
    Scissors,
    Sparkles,
    Eye,
    Package,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Transaction {
    id: string;
    totalAmount: number;
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'TRANSFER' | 'GOWABI';
    createdAt: string;
    customer?: {
        name: string;
    };
    items: {
        service: {
            name: string;
            category: string;
        };
        price: number;
    }[];
}

interface DashboardData {
    transactions: Transaction[];
    summary: {
        totalRevenue: number;
        todayRevenue: number;
        revenueByMethod: {
            CASH: number;
            CREDIT_CARD: number;
            TRANSFER: number;
            GOWABI: number;
        };
        revenueByCategory: {
            HAIR: number;
            NAIL: number;
            LASH: number;
            PRODUCT: number;
        };
    };
}

export default function TransactionsPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0], // Default to today
        end: new Date().toISOString().split('T')[0]
    });
    const [filterMethod, setFilterMethod] = useState('ALL');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.start,
                endDate: dateRange.end,
                paymentMethod: filterMethod
            });
            const res = await fetch(`/api/transactions/list?${params}`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [dateRange, filterMethod]);

    const setPresetDate = (preset: 'TODAY' | 'WEEK' | 'MONTH') => {
        const end = new Date();
        const start = new Date();

        if (preset === 'WEEK') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            start.setDate(diff);
        } else if (preset === 'MONTH') {
            start.setDate(1);
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return <Banknote className="h-4 w-4" />;
            case 'CREDIT_CARD': return <CreditCard className="h-4 w-4" />;
            case 'TRANSFER': return <Smartphone className="h-4 w-4" />;
            case 'GOWABI': return <QrCode className="h-4 w-4" />;
            default: return <Banknote className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'HAIR': return 'bg-pastel-lavender text-primary';
            case 'NAIL': return 'bg-pastel-peach text-orange-800';
            case 'LASH': return 'bg-pastel-coral text-red-800';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                    <p className="text-muted-foreground">Revenue overview and sales history</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('TODAY')}
                            className={cn("text-xs", dateRange.start === new Date().toISOString().split('T')[0] && "bg-slate-100 font-bold")}
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('WEEK')}
                            className="text-xs"
                        >
                            This Week
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('MONTH')}
                            className="text-xs"
                        >
                            This Month
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-36 h-9 bg-white"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-36 h-9 bg-white"
                        />
                    </div>
                    <select
                        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                    >
                        <option value="ALL">All Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="CREDIT_CARD">Card</option>
                        <option value="TRANSFER">Transfer</option>
                        <option value="GOWABI">Gowabi</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="metric-number text-primary">฿{data?.summary.totalRevenue.toLocaleString() || '0'}</p>
                                <p className="text-xs text-muted-foreground">Selected period</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-lavender">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                                <p className="metric-number text-green-600">฿{data?.summary.todayRevenue.toLocaleString() || '0'}</p>
                                <p className="text-xs text-muted-foreground">All channels</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pastel-peach">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow md:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-muted-foreground">Revenue by Method</p>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {Object.entries(data?.summary.revenueByMethod || {}).map(([method, amount]) => (
                                <div key={method} className="text-center">
                                    <div className="text-xs font-medium text-muted-foreground mb-1">{method.replace('_', ' ')}</div>
                                    <div className="font-bold text-lg">฿{amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Breakdown & Table */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Category Breakdown */}
                <div className="space-y-6">
                    <Card className="bg-white border-0 rounded-friendly card-shadow h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Category Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(data?.summary.revenueByCategory || {}).map(([category, amount]) => (
                                <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-lg", getCategoryColor(category))}>
                                            {category === 'HAIR' && <Scissors className="h-4 w-4" />}
                                            {category === 'NAIL' && <Sparkles className="h-4 w-4" />}
                                            {category === 'LASH' && <Eye className="h-4 w-4" />}
                                            {category === 'PRODUCT' && <Package className="h-4 w-4" />}
                                        </div>
                                        <span className="font-medium capitalize">{category.toLowerCase()}</span>
                                    </div>
                                    <span className="font-bold">฿{amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Transactions Table */}
                <div className="lg:col-span-2">
                    <Card className="bg-white border-0 rounded-friendly card-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50">
                                        <tr>
                                            <th className="px-6 py-3">Time</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Services</th>
                                            <th className="px-6 py-3">Method</th>
                                            <th className="px-6 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                    Loading transactions...
                                                </td>
                                            </tr>
                                        ) : data?.transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                    No transactions found for this period.
                                                </td>
                                            </tr>
                                        ) : (
                                            data?.transactions.map((t) => (
                                                <tr key={t.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-muted-foreground">
                                                        {new Date(t.createdAt).toLocaleDateString()} <br />
                                                        <span className="text-xs opacity-70">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {t.customer?.name || 'Walk-in'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {t.items.map((item, i) => (
                                                                <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                                                                    {item.service.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-slate-100 px-2 py-1 rounded-lg w-fit">
                                                            {getMethodIcon(t.paymentMethod)}
                                                            {t.paymentMethod.replace('_', ' ')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-primary">
                                                        ฿{Number(t.totalAmount).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
