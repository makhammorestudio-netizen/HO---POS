"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Scissors, Users, UserCircle, LogOut, Sparkles } from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "POS Terminal", icon: Scissors },
    { href: "/services", label: "Services", icon: Sparkles },
    { href: "/staff", label: "Staff", icon: Users },
    { href: "/customers", label: "Customers", icon: UserCircle },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r border-white/10 bg-black/20 backdrop-blur-xl p-4">
            <div>
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
                    <span className="text-xl font-bold tracking-tight">Luxe POS</span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-white/10 pt-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
