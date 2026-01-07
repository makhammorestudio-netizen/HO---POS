"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CommissionSummaryView } from "@/components/staff/CommissionSummaryView";
import { Users, Banknote, Plus, AlertCircle } from "lucide-react";
import { StaffCard } from "@/components/staff/StaffCard";
import { StaffFormModal } from "@/components/staff/StaffFormModal";
import { getStaffList, saveStaffToLocal, Staff } from "@/lib/staffUtils";

// Simple toast for success notification if no library exists
const SuccessToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed bottom-4 right-4 bg-[#0F1F3D] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
        <div className="bg-green-500 rounded-full p-1"><Plus className="h-3 w-3 text-white" /></div>
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-white/50 hover:text-white">✕</button>
    </div>
);

export default function StaffPage() {
    const [viewMode, setViewMode] = useState<'list' | 'commissions'>('list');
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const loadStaff = async () => {
        setLoading(true);
        const data = await getStaffList();
        // Sort by name for consistent display
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setStaffList(sorted);
        setLoading(false);
    };

    useEffect(() => {
        if (viewMode === 'list') {
            loadStaff();
        }
    }, [viewMode]);

    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    const filteredStaff = staffList.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.role.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setSelectedStaff(null);
        setIsDialogOpen(true);
    };

    const handleSaveStaff = async (staffData: Partial<Staff>) => {
        try {
            if (selectedStaff) {
                // Edit existing staff
                try {
                    const response = await fetch(`/api/staff/${selectedStaff.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(staffData),
                    });

                    if (!response.ok) throw new Error('Failed to update staff API');
                    // Refresh from source to be sure
                    await loadStaff();
                } catch (apiError) {
                    console.warn("API Update failed, saving locally as fallback", apiError);
                    // Fallback local save
                    const updatedStaff = { ...selectedStaff, ...staffData } as Staff;
                    saveStaffToLocal(updatedStaff);
                    await loadStaff(); // Reload will merge local
                }
                setToastMsg("Staff updated successfully");
            } else {
                // Create new staff
                try {
                    const response = await fetch('/api/staff', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(staffData),
                    });

                    if (!response.ok) throw new Error('Failed to create staff API');
                    await loadStaff();
                } catch (apiError) {
                    console.warn("API Create failed, saving locally as fallback", apiError);
                    // Fallback local create
                    const newStaff = {
                        ...staffData,
                        id: `local_${Date.now()}`, // Temporary ID for local items
                        createdAt: new Date(),
                        updatedAt: new Date()
                    } as unknown as Staff; // Casting as our utils Staff doesn't have dates but DB does. Utils Staff is enough for UI.

                    saveStaffToLocal(newStaff);
                    await loadStaff();
                }
                setToastMsg("Staff created successfully");
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Staff operation failed:', error);
            throw error; // Re-throw to be caught by modal if it was a catastrophic failure not handled by fallbacks
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 relative">
            {toastMsg && <SuccessToast message={toastMsg} onClose={() => setToastMsg(null)} />}

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-[32px] font-bold text-[#1F2A53]">Staff Management</h1>

                {/* View Toggle Tabs */}
                <div className="bg-[rgba(255,255,255,0.7)] p-1 rounded-lg flex gap-1 border border-[rgba(31,60,136,0.12)]">
                    <Button
                        variant="ghost"
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "gap-2 h-9 px-4 rounded-md transition-all font-medium",
                            viewMode === 'list'
                                ? "bg-[#1F3C88] text-white shadow-sm hover:bg-[#1F3C88]/90 hover:text-white"
                                : "text-[#4B5675] hover:text-[#1F2A53] hover:bg-white/50"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Staff List
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setViewMode('commissions')}
                        className={cn(
                            "gap-2 h-9 px-4 rounded-md transition-all font-medium",
                            viewMode === 'commissions'
                                ? "bg-[#1F3C88] text-white shadow-sm hover:bg-[#1F3C88]/90 hover:text-white"
                                : "text-[#4B5675] hover:text-[#1F2A53] hover:bg-white/50"
                        )}
                    >
                        <Banknote className="h-4 w-4" />
                        Commission Summary
                    </Button>
                </div>

                {viewMode === 'list' && (
                    <Button
                        onClick={openCreate}
                        className="bg-[#1F3C88] hover:bg-[#1F3C88]/90 text-white gap-2 shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Staff
                    </Button>
                )}
            </div>

            {viewMode === 'list' ? (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-6">
                        <Input
                            placeholder="Search staff by name or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md border-slate-200 focus:border-[#1F3C88] focus:ring-[#1F3C88]/20 text-[#1F2A53] bg-white shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-[#4B5675]">Loading staff...</div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredStaff.map((staff) => (
                                <StaffCard
                                    key={staff.id}
                                    staff={staff}
                                    onEdit={openEdit}
                                />
                            ))}
                            {filteredStaff.length === 0 && (
                                <div className="col-span-full py-12 text-[#4B5675] bg-white rounded-friendly border border-slate-100 flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-slate-300" />
                                    <p>No staff members found.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <StaffFormModal
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                        onSave={handleSaveStaff}
                        initialData={selectedStaff}
                    />
                </div>
            ) : (
                <CommissionSummaryView />
            )}
        </div>
    );
}
