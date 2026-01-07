import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StaffAvatar } from "./StaffAvatar";
import { Role } from "@prisma/client";

interface Staff {
    id: string;
    name: string;
    role: Role;
    pin: string | null;
    avatar?: string | null;
    photoUrl?: string | null;
}

interface StaffCardProps {
    staff: Staff;
    onEdit: (staff: Staff) => void;
}

export function StaffCard({ staff, onEdit }: StaffCardProps) {
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'STYLIST': return 'bg-purple-100 text-purple-700';
            case 'TECHNICIAN': return 'bg-orange-100 text-orange-700';
            case 'ASSISTANT': return 'bg-blue-100 text-blue-700';
            case 'ADMIN': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    // Determine avatar source: checks photoUrl first (from local storage merge), then avatar field
    const photoSrc = (staff as any).photoUrl || (staff.avatar?.startsWith('data:') ? staff.avatar : null);

    return (
        <Card className="bg-white border border-slate-200 rounded-friendly shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-5 flex items-center gap-5">
                <StaffAvatar
                    name={staff.name}
                    avatar={staff.avatar}
                    src={photoSrc}
                    size="lg"
                    className="h-14 w-14 border border-slate-100 shadow-inner"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-[#0F1F3D] text-[22px] leading-tight truncate pr-2 tracking-tight">
                            {staff.name}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(staff)}
                            className="text-slate-400 hover:text-[#0F1F3D] hover:bg-slate-100 h-8 px-3 rounded-full"
                        >
                            Edit
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn("border-0 font-semibold px-2.5 py-0.5 rounded-md text-xs", getRoleBadgeColor(staff.role))}>
                            {staff.role}
                        </Badge>
                    </div>

                    <div className="text-sm text-slate-500 font-medium">
                        PIN: <span className="font-mono text-slate-600 bg-slate-100 px-1 rounded">{staff.pin ? "****" : "N/A"}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
