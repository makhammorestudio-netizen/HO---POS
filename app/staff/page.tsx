"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { CommissionSummaryView } from "@/components/staff/CommissionSummaryView";
import { Users, Banknote } from "lucide-react";

interface Staff {
    id: string;
    name: string;
    role: Role;
    pin: string;
}

export default function StaffPage() {
    const [viewMode, setViewMode] = useState<'list' | 'commissions'>('list');
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (viewMode === 'list') {
            fetch("/api/staff")
                .then((res) => res.json())
                .then((data) => {
                    setStaffList(data);
                    setLoading(false);
                });
        }
    }, [viewMode]);

    const filteredStaff = staffList.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDialogOpen(true);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const updated = {
            ...selectedStaff,
            name: formData.get("name") as string,
            role: formData.get("role") as Role,
            pin: formData.get("pin") as string,
        };
        await fetch(`/api/staff/${selectedStaff.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
        });
        setStaffList((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        setIsDialogOpen(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Staff Management</h1>

                {/* View Toggle Tabs */}
                <div className="bg-white/10 p-1 rounded-lg flex gap-1">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className={cn("gap-2", viewMode === 'list' ? "bg-primary text-primary-foreground" : "text-white hover:text-white hover:bg-white/10")}
                    >
                        <Users className="h-4 w-4" />
                        Staff List
                    </Button>
                    <Button
                        variant={viewMode === 'commissions' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('commissions')}
                        className={cn("gap-2", viewMode === 'commissions' ? "bg-primary text-primary-foreground" : "text-white hover:text-white hover:bg-white/10")}
                    >
                        <Banknote className="h-4 w-4" />
                        Commission Summary
                    </Button>
                </div>

                {viewMode === 'list' && (
                    <Button onClick={() => { setSelectedStaff(null); setIsDialogOpen(true); }}>
                        Add New Staff
                    </Button>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    <Input
                        placeholder="Search staff by name or role"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 w-80"
                    />

                    {loading ? (
                        <p className="text-muted-foreground">Loading staff...</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredStaff.map((staff) => (
                                <Card
                                    key={staff.id}
                                    className="glass border-0 bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            <Badge variant="primary">{staff.role}</Badge>
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(staff)}>
                                            Edit
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{staff.name}</div>
                                        <p className="text-xs text-muted-foreground">
                                            PIN: {staff.pin ? "****" : "Not Set"}
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
                                <DialogTitle>{selectedStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={selectedStaff ? handleEditSave : (e) => e.preventDefault()} className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input name="name" defaultValue={selectedStaff?.name ?? ""} required />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <select name="role" defaultValue={selectedStaff?.role ?? ""} className="h-10 rounded border bg-background px-3 py-2 text-sm" required>
                                        <option value="">Select role</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="STYLIST">STYLIST</option>
                                        <option value="TECHNICIAN">TECHNICIAN</option>
                                        <option value="ASSISTANT">ASSISTANT</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">PIN</label>
                                    <Input name="pin" defaultValue={selectedStaff?.pin ?? ""} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">{selectedStaff ? "Save" : "Create"}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <CommissionSummaryView />
            )}
        </div>
    );
}
