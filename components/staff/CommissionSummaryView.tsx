"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface StaffSummary {
    id: string;
    name: string;
    role: string;
    mainServices: number;
    assistServices: number;
    totalRevenue: number;
    totalCommission: number;
    items: {
        id: string;
        serviceName: string;
        category: string;
        price: number;
        commission: number;
        date: string;
        type?: 'main' | 'assist';
    }[];
}

export function CommissionSummaryView() {
    const [data, setData] = useState<StaffSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
    const [dateRange, setDateRange] = useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedStaff, setSelectedStaff] = useState<StaffSummary | null>(null);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.start,
                endDate: dateRange.end
            });
            const res = await fetch(`/api/staff/commissions?${params}`);
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error('Failed to fetch commissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [dateRange]);

    const setPresetDate = (preset: 'today' | 'week' | 'month') => {
        const end = new Date();
        const start = new Date();

        setSelectedPeriod(preset);

        if (preset === 'week') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
            start.setDate(diff);
        } else if (preset === 'month') {
            start.setDate(1);
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    // Handle custom date change
    const handleDateChange = (type: 'start' | 'end', value: string) => {
        setSelectedPeriod('custom');
        setDateRange(prev => ({ ...prev, [type]: value }));
    };

    // Aggregations
    const totalCommissionPaid = data.reduce((sum, staff) => sum + staff.totalCommission, 0);
    const totalRevenueGenerated = data.reduce((sum, staff) => sum + staff.totalRevenue, 0);
    const totalServicesCount = data.reduce((sum, staff) => sum + staff.mainServices + staff.assistServices, 0);

    // Chart Data Preparation
    const weeklyChartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartData = days.map(day => ({ name: day, commission: 0 }));

        data.forEach(staff => {
            staff.items.forEach(item => {
                const date = new Date(item.date);
                const dayIndex = date.getDay();
                chartData[dayIndex].commission += item.commission;
            });
        });
        return chartData;
    }, [data]);

    const monthlyChartData = useMemo(() => {
        // Group by date (day of month)
        const dailyMap: Record<string, number> = {};

        data.forEach(staff => {
            staff.items.forEach(item => {
                const date = new Date(item.date).getDate(); // 1-31
                if (!dailyMap[date]) dailyMap[date] = 0;
                dailyMap[date] += item.commission;
            });
        });

        // Create array for 1-31 (or max days in month, but simple 1-31 is fine for visual)
        // Better: just map the keys that exist to avoid sparse chart if range is small
        // But for "Monthly" view, 1-31 is expected.
        // Let's just show the days that have data if range is custom, or 1-31 if month.
        // For simplicity and robustness with custom ranges, let's sort the dates found.

        return Object.keys(dailyMap).sort((a, b) => Number(a) - Number(b)).map(day => ({
            name: day,
            commission: dailyMap[day]
        }));
    }, [data]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-friendly card-shadow">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Period:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('today')}
                            className={cn("text-xs h-7", selectedPeriod === 'today' && "bg-white shadow-sm font-bold text-primary")}
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('week')}
                            className={cn("text-xs h-7", selectedPeriod === 'week' && "bg-white shadow-sm font-bold text-primary")}
                        >
                            Week
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPresetDate('month')}
                            className={cn("text-xs h-7", selectedPeriod === 'month' && "bg-white shadow-sm font-bold text-primary")}
                        >
                            Month
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="w-36 h-9 bg-white border-slate-200"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="w-36 h-9 bg-white border-slate-200"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Commission</p>
                        <p className="text-3xl font-bold text-primary">฿{totalCommissionPaid.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-slate-700">฿{totalRevenueGenerated.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardContent className="p-6 text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Services Performed</p>
                        <p className="text-3xl font-bold text-slate-700">{totalServicesCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `฿${value}`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="commission" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-0 rounded-friendly card-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg">Daily Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `฿${value}`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="commission" fill="#f472b6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Report Table */}
            <Card className="bg-white border-0 rounded-friendly card-shadow">
                <CardHeader>
                    <CardTitle>Commission Report</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Revenue = value of services where this staff is main stylist or works solo. Assist work is shown under Assist Services and Commission.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Main Services</TableHead>
                                <TableHead className="text-center">Assist Services</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading data...
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No data found for this period.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((staff) => (
                                    <TableRow
                                        key={staff.id}
                                        className="cursor-pointer hover:bg-slate-50/50 transition-colors"
                                        onClick={() => setSelectedStaff(staff)}
                                    >
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {staff.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{staff.mainServices}</TableCell>
                                        <TableCell className="text-center">{staff.assistServices}</TableCell>
                                        <TableCell className="text-right">฿{staff.totalRevenue.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            ฿{staff.totalCommission.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            View Details
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Dialog open={!!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {selectedStaff?.name} - Commission Details
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl text-center">
                            <p className="text-xs text-muted-foreground mb-1">Services</p>
                            <p className="text-xl font-bold">{selectedStaff?.totalServices}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl text-center">
                            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                            <p className="text-xl font-bold text-primary">฿{selectedStaff?.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                            <p className="text-xs text-green-700 mb-1">Commission</p>
                            <p className="text-xl font-bold text-green-700">฿{selectedStaff?.totalCommission.toLocaleString()}</p>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Commission</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedStaff?.items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                        No services found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                selectedStaff?.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(item.date).toLocaleDateString()} <br />
                                            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.serviceName}</TableCell>
                                        <TableCell>
                                            <span className="text-[10px] uppercase bg-slate-100 px-2 py-1 rounded-full">
                                                {item.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">฿{item.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            ฿{item.commission.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </div>
    );
}
