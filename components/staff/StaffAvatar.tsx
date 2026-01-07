import { cn } from "@/lib/utils";

interface StaffAvatarProps {
    name: string;
    avatar?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const AVATAR_PRESETS = [
    { id: 'avatar-1', icon: '👩' },
    { id: 'avatar-2', icon: '👨' },
    { id: 'avatar-3', icon: '👱‍♀️' },
    { id: 'avatar-4', icon: '👨‍🦰' },
    { id: 'avatar-5', icon: '👩‍🦱' },
    { id: 'avatar-6', icon: '👨‍🦱' },
    { id: 'avatar-7', icon: '👧' },
    { id: 'avatar-8', icon: '👦' },
];

export function StaffAvatar({ name, avatar, size = 'md', className, src }: StaffAvatarProps & { src?: string | null }) {
    const preset = AVATAR_PRESETS.find(p => p.id === avatar);

    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // If src is provided (uploaded photo), use it.
    // If avatar matches a preset ID, use that.
    // Else fall back to initials.

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden relative",
                sizeClasses[size],
                src ? "bg-slate-100" : (preset ? "bg-slate-100" : "bg-[#E7EEFF] text-[#1F3C88]"),
                className
            )}
            role="img"
            aria-label={`Avatar for ${name}`}
        >
            {src ? (
                <img src={src} alt={name} className="h-full w-full object-cover" />
            ) : preset ? (
                <span className="text-lg leading-none">{preset.icon}</span>
            ) : (
                getInitials(name)
            )}
        </div>
    );
}
