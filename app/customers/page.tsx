"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Phone, Calendar, User, MoreVertical } from "lucide-react";
import { Customer } from "@prisma/client";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { format } from "date-fns";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchCustomers = useCallback(async (query = "") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/customers${query ? `?search=${encodeURIComponent(query)}` : ""}`);
            const data = await res.json();
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchCustomers]);

    const handleSaveCustomer = async (data: Partial<Customer>) => {
        const method = selectedCustomer ? "PATCH" : "POST";
        const url = selectedCustomer ? `/api/customers/${selectedCustomer.id}` : "/api/customers";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to save customer");
        }

        fetchCustomers(search);
    };

    const openEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setSelectedCustomer(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1F2A53]">Customer Management</h1>
                    <p className="text-[#4B5675]">Manage your customer list and check their visit history.</p>
                </div>
                <Button onClick={openCreate} className="bg-[#1F3C88] hover:bg-[#1F3C88]/90 text-white gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    Add New Customer
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-[rgba(255,255,255,0.7)] p-4 rounded-xl border border-[rgba(31,60,136,0.12)]">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5675]" />
                    <Input
                        placeholder="Search by name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-white text-[#1F2A53] border-slate-200"
                    />
                </div>
            </div>

            {loading && customers.length === 0 ? (
                <div className="text-center py-12 text-[#4B5675]">Loading customers...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {customers.map((customer) => (
                        <Card
                            key={customer.id}
                            className="group relative border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden"
                        >
                            <CardContent className="pt-6">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#1F3C88]" onClick={() => openEdit(customer)}>
                                        <Plus className="h-4 w-4 rotate-45" /> {/* Use a different icon or Edit if available */}
                                    </Button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-[#E5E6FF] flex items-center justify-center text-[#1F3C88]">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg text-[#1F2A53] leading-none mb-1">
                                            {customer.fullName}
                                        </h3>
                                        {customer.phone && (
                                            <div className="flex items-center gap-1.5 text-sm text-[#4B5675]">
                                                <Phone className="h-3 w-3" />
                                                {customer.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            Last Visit: {customer.lastVisitAt ? format(new Date(customer.lastVisitAt), "dd MMM yyyy") : "Never"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Badge className="bg-[#E5E6FF] text-[#1F3C88] hover:bg-[#E5E6FF] border-0">
                                            {customer.totalVisits} Visits
                                        </Badge>
                                        {customer.preferredLanguage && (
                                            <Badge variant="outline" className="text-[10px] py-0">
                                                {customer.preferredLanguage}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#1F3C88] font-bold text-xs"
                                        onClick={() => openEdit(customer)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {customers.length === 0 && !loading && (
                <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">No customers found matching your search.</p>
                </div>
            )}

            <CustomerFormModal
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveCustomer}
                initialData={selectedCustomer}
            />
        </div>
    );
}
