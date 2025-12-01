"use client";

import { useState, useEffect } from 'react';
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
import { Calendar, Filter, Download, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StaffSummary {
    id: string;
    name: string;
    role: string;
    totalServices: number;
    totalRevenue: number;
    totalCommission: number;
    items: {
        id: string;
        serviceName: string;
        category: string;
        price: number;
        commission: number;
        date: string;
    }[];
}

export default function CommissionSummaryPage() {
    const [data, setData] = useState<StaffSummary[]>([]);
    const [loading, setLoading] = useState(true);
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

    const setPresetDate = (preset: 'TODAY' | 'WEEK' | 'MONTH') => {
        const end = new Date();
        const start = new Date();

        if (preset === 'WEEK') {
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
        } else if (preset === 'MONTH') {
            start.setDate(1);
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const totalCommissionPaid = data.reduce((sum, staff) => sum + staff.totalCommission, 0);

    return (
        <div className="container mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/staff">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Commission Summary</h1>
                        <p className="text-muted-foreground">Track staff performance and earnings</p>
                    </div>
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
                </div>
            </div>

            {/* Total Card */}
            <Card className="bg-white border-0 rounded-friendly card-shadow w-full md:w-1/3">
                <CardContent className="p-6">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Commission Payout</p>
                        <p className="text-3xl font-bold text-primary">฿{totalCommissionPaid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">For selected period</p>
                    </div>
                </CardContent>
            </Card>

            {/* Main Table */}
            <Card className="bg-white border-0 rounded-friendly card-shadow">
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Services Done</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                                <TableHead className="text-right">Commission Earned</TableHead>
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
                                        <TableCell className="text-center">{staff.totalServices}</TableCell>
                                        <TableCell className="text-right">฿{staff.totalRevenue.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600">
                                            ฿{staff.totalCommission.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            View Details &rarr;
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
