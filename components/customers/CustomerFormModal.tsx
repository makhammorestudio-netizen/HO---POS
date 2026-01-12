import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Customer, Language, Gender } from "@prisma/client";
import { Loader2, AlertCircle } from "lucide-react";

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Customer>) => Promise<void>;
    initialData?: Customer | null;
}

export function CustomerFormModal({ isOpen, onClose, onSave, initialData }: CustomerFormModalProps) {
    const [formData, setFormData] = useState<Partial<Customer>>({
        fullName: "",
        phone: "",
        notes: "",
        preferredLanguage: "TH",
        gender: "UNSPECIFIED",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    phone: initialData.phone || "",
                    notes: initialData.notes || "",
                    email: initialData.email || "",
                });
            } else {
                setFormData({
                    fullName: "",
                    phone: "",
                    notes: "",
                    preferredLanguage: "TH",
                    gender: "UNSPECIFIED",
                    email: "",
                });
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.fullName || formData.fullName.length < 2) {
            setError("Full name must be at least 2 characters");
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('unique constraint') || err.message?.includes('P2002')) {
                setError("A customer with this phone number already exists.");
            } else {
                setError("Failed to save customer. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-white text-[#0F1F3D]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0F1F3D]">
                        {initialData ? "Edit Customer" : "Add New Customer"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-bold">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="e.g., Somchai Jaidee"
                            className="border-slate-200"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="081-XXX-XXXX"
                            className="border-slate-200"
                            type="tel"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="language" className="font-bold">Language</Label>
                            <Select
                                value={formData.preferredLanguage as string}
                                onValueChange={(val) => setFormData({ ...formData, preferredLanguage: val as Language })}
                            >
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TH">Thai (TH)</SelectItem>
                                    <SelectItem value="EN">English (EN)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="font-bold">Gender</Label>
                            <Select
                                value={formData.gender as string}
                                onValueChange={(val) => setFormData({ ...formData, gender: val as Gender })}
                            >
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                    <SelectItem value="UNSPECIFIED">Unspecified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="font-bold">Notes</Label>
                        <Input
                            id="notes"
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="e.g., Prefers gentle wash"
                            className="border-slate-200"
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-slate-500">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#1F3C88] hover:bg-[#1F3C88]/90 text-white min-w-[100px]" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
