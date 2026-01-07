import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Service } from "@prisma/client";
import { validateServiceForm } from "@/lib/serviceUtils";
import { Loader2, AlertCircle } from "lucide-react";

interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Service>) => Promise<void>;
    initialData?: Service | null;
}

export function ServiceFormModal({ isOpen, onClose, onSave, initialData }: ServiceFormModalProps) {
    const [formData, setFormData] = useState<Partial<Service>>({
        name: "",
        category: "HAIR",
        price: 0,
        cogs: 0,
        durationMin: 60,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    price: Number(initialData.price as any),
                    cogs: Number(initialData.cogs as any || 0),
                });
            } else {
                setFormData({
                    name: "",
                    category: "HAIR",
                    price: 0,
                    cogs: 0,
                    durationMin: 60,
                });
            }
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validation = validateServiceForm(formData);
        if (!validation.isValid) {
            setError(validation.error || "Invalid form data");
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to save service. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-white text-[#0F1F3D]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0F1F3D]">
                        {initialData ? "Edit Service" : "Add New Service"}
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
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Haircut"
                            className="text-[#0F1F3D]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category as string}
                                onValueChange={(val) => setFormData({ ...formData, category: val as any })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HAIR">Hair</SelectItem>
                                    <SelectItem value="NAIL">Nail</SelectItem>
                                    <SelectItem value="LASH">Lash</SelectItem>
                                    <SelectItem value="PRODUCT">Product</SelectItem>
                                    <SelectItem value="WAX">Wax</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (min)</Label>
                            <Select
                                value={String(formData.durationMin)}
                                onValueChange={(val) => setFormData({ ...formData, durationMin: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[15, 30, 45, 60, 90, 120, 150, 180].map((m) => (
                                        <SelectItem key={m} value={String(m)}>
                                            {m} min
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (THB)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cogs" className="flex items-center gap-1">
                                Cost (COGS)
                                <span className="text-[10px] text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                                id="cogs"
                                type="number"
                                min="0"
                                value={formData.cogs}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, cogs: Number(e.target.value) })}
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-right">
                        Estimated Profit: <span className="font-bold text-[#1F3C88]">
                            {Math.max(0, (Number(formData.price as any || 0) - Number(formData.cogs as any || 0))).toLocaleString()} THB
                        </span>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#1F3C88] hover:bg-[#1F3C88]/90 text-white" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Save Changes" : "Create Service"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
