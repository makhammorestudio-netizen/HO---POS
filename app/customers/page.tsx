"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
    id: string;
    name: string;
    phone: string;
    points: number;
    _count: {
        transactions: number;
    };
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Customer Management</h1>
                <Button>Add New Customer</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p>Loading customers...</p>
                ) : (
                    customers.map((customer) => (
                        <Card key={customer.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {customer.name}
                                </CardTitle>
                                <div className="text-sm font-bold text-primary">{customer.points} pts</div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg">{customer.phone}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Visits: {customer._count.transactions}
                                </p>
                                <div className="mt-4">
                                    <Button variant="outline" size="sm" className="w-full">View History</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
