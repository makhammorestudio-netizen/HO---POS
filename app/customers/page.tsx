"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string;
    phone: string;
    points: number;
    _count: { transactions: number };
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetch("/api/customers")
            .then((res) => res.json())
            .then((data) => {
                setCustomers(data);
                setLoading(false);
            });
    }, []);

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const openEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const updated = {
            ...selectedCustomer,
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            points: Number(formData.get("points")) || 0,
        };
        await fetch(`/api/customers/${selectedCustomer.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });
        setCustomers((list) => list.map((c) => (c.id === updated.id ? updated : c)));
        setIsDialogOpen(false);
    };

    return (
        <div className="container mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Customer Management</h1>
                <Button onClick={() => setIsDialogOpen(true)}>Add New Customer</Button>
            </div>

            <Input
                placeholder="Search by name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 w-80"
            />

            {loading ? (
                <p className="text-muted-foreground">Loading customers...</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCustomers.map((customer) => (
                        <Card
                            key={customer.id}
                            className="glass border-0 bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    <Badge variant="primary">{customer.points} pts</Badge>
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(customer)}>
                                    Edit
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{customer.name}</div>
                                <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Visits: {customer._count.transactions}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <span />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={selectedCustomer ? handleSave : (e) => e.preventDefault()} className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input name="name" defaultValue={selectedCustomer?.name ?? ""} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Phone</label>
                            <Input name="phone" defaultValue={selectedCustomer?.phone ?? ""} required />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Points</label>
                            <Input name="points" type="number" defaultValue={selectedCustomer?.points?.toString() ?? "0"} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{selectedCustomer ? "Save" : "Create"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
