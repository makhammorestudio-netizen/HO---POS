import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role } from "@prisma/client";
import { StaffAvatar, AVATAR_PRESETS } from "./StaffAvatar";
import { cn } from "@/lib/utils";
import { validateStaffForm, resizeImage } from "@/lib/staffUtils";
import { Upload, X } from "lucide-react";

interface Staff {
    id: string;
    name: string;
    role: Role;
    pin: string | null;
    avatar?: string | null;
    photoUrl?: string | null;
}

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (staff: Partial<Staff>) => Promise<void>;
    initialData?: Staff | null;
}

export function StaffFormModal({ isOpen, onClose, onSave, initialData }: StaffFormModalProps) {
    const [formData, setFormData] = useState<Partial<Staff>>({
        name: "",
        role: "STYLIST",
        pin: "",
        avatar: null,
        photoUrl: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    role: initialData.role,
                    pin: initialData.pin || "",
                    avatar: initialData.avatar,
                    photoUrl: initialData.photoUrl
                });
            } else {
                setFormData({
                    name: "",
                    role: "STYLIST",
                    pin: "",
                    avatar: null,
                    photoUrl: null
                });
            }
        }
    }, [isOpen, initialData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await resizeImage(e.target.files[0]);
                setFormData(prev => ({ ...prev, photoUrl: base64 }));
            } catch (err) {
                console.error("Failed to resize image", err);
                setError("Failed to process image. Please try another.");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Strict Validation from Helpers
        const validation = validateStaffForm(formData);
        if (!validation.isValid) {
            setError(validation.error || "Invalid form data");
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Failed to save staff", error);
            setError("Failed to save staff details. We will try to save locally.");
            // Note: The parent component handles the actual local fallback logic, 
            // but if it re-throws, we catch it here to show error.
            // If parent handles fallback silently for offline, it shouldn't throw.
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && !loading) onClose();
        }}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-[#0F1F3D] text-xl font-bold">
                        {initialData ? "Edit Staff" : "Add New Staff"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Avatar / Photo Selection */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <StaffAvatar
                                name={formData.name || "New Staff"}
                                avatar={formData.avatar}
                                src={formData.photoUrl}
                                size="lg"
                                className="h-24 w-24 border-4 border-slate-50 shadow-sm"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white h-6 w-6" />
                            </div>
                            {formData.photoUrl && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFormData({ ...formData, photoUrl: null });
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={triggerFileInput}
                                className="text-xs h-8"
                            >
                                Upload Photo
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Max 256x256 • JPG/PNG</p>
                        </div>

                        {/* Presets - Only show if no photo uploaded */}
                        {!formData.photoUrl && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                {AVATAR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, avatar: preset.id })}
                                        className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all border",
                                            formData.avatar === preset.id
                                                ? "border-primary bg-primary/10 scale-110 shadow-sm"
                                                : "border-transparent bg-slate-50 hover:bg-slate-100"
                                        )}
                                    >
                                        {preset.icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-[#0F1F3D]">Name <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="border-slate-200 focus:border-[#0F1F3D] text-[#0F1F3D] font-medium"
                                placeholder="e.g. Fon"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-[#0F1F3D]">Role <span className="text-red-500">*</span></label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#0F1F3D] focus:outline-none focus:ring-2 focus:ring-[#0F1F3D]/10 focus:border-[#0F1F3D]"
                                required
                            >
                                <option value="STYLIST">Stylist</option>
                                <option value="TECHNICIAN">Technician</option>
                                <option value="ASSISTANT">Assistant</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-[#0F1F3D]">PIN <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.pin || ""}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setFormData({ ...formData, pin: val });
                                }}
                                className="border-slate-200 focus:border-[#0F1F3D] text-[#0F1F3D] font-mono tracking-widest"
                                placeholder="0000"
                                type="tel"
                                inputMode="numeric"
                                maxLength={4}
                            />
                            <p className="text-xs text-slate-500">Must be exactly 4 digits</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                            className="text-slate-500 hover:text-[#0F1F3D] hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0F1F3D] hover:bg-[#0F1F3D]/90 text-white min-w-[120px] shadow-md font-bold"
                        >
                            {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Staff")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
