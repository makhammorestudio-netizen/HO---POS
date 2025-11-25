import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back to Luxe Salon.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button>Download Report</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,234.56</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12</div>
                        <p className="text-xs text-muted-foreground">2 on break</p>
                    </CardContent>
                </Card>
                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+24</div>
                        <p className="text-xs text-muted-foreground">6 slots remaining</p>
                    </CardContent>
                </Card>
                <Card className="glass border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 since last hour</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass border-0">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/pos">
                            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 hover:bg-primary/20 transition-all cursor-pointer border border-white/10 h-32">
                                <DollarSign className="h-8 w-8 mb-2 text-primary" />
                                <span className="font-semibold">New Sale</span>
                            </div>
                        </Link>
                        <Link href="/customers">
                            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 hover:bg-primary/20 transition-all cursor-pointer border border-white/10 h-32">
                                <Users className="h-8 w-8 mb-2 text-primary" />
                                <span className="font-semibold">Register Customer</span>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass border-0">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">New Sale</p>
                                        <p className="text-sm text-muted-foreground">
                                            Stylist Alice sold Haircut
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">+$50.00</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
