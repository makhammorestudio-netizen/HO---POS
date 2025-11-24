"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@prisma/client";

interface Staff {
    id: string;
    name: string;
    role: Role;
    pin: string;
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/staff")
            .then((res) => res.json())
            .then((data) => {
                setStaffList(data);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Staff Management</h1>
                <Button>Add New Staff</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p>Loading staff...</p>
                ) : (
                    staffList.map((staff) => (
                        <Card key={staff.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {staff.role}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{staff.name}</div>
                                <p className="text-xs text-muted-foreground">
                                    PIN: {staff.pin ? "****" : "Not Set"}
                                </p>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm">View Commissions</Button>
                                    <Button variant="outline" size="sm">Edit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
