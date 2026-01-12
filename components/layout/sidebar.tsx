"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Scissors, Users, UserCircle, LogOut, Sparkles, Calendar, Banknote } from "lucide-react";
import { playfairScript } from "@/lib/fonts";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/pos", label: "POS Terminal", icon: Scissors },
    { href: "/transactions", label: "Transactions", icon: Banknote },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/services", label: "Services", icon: Sparkles },
    { href: "/staff", label: "Staff", icon: Users },
    { href: "/customers", label: "Customers", icon: UserCircle },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col justify-between bg-primary p-6">
            <div>
                {/* Logo/Brand */}
                <Link href="/" className="flex items-center gap-3 px-4 py-6 mb-2 group cursor-pointer transition-opacity hover:opacity-90">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-lg">
                        <img
                            src="/logo-head-office.png"
                            alt="Head Office Bangkok"
                            className="h-7 w-7 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>

                    <div className="leading-none">
                        <div className={`${playfairScript.className} text-white text-[20px] font-normal whitespace-nowrap`}>
                            Head Office Bangkok
                        </div>

                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/70 mt-1">
                            Hair & Beauty
                        </div>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-white text-primary shadow-md"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg",
                                    isActive ? "bg-primary/10" : "bg-white/10"
                                )}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Sign Out */}
            <div className="border-t border-white/20 pt-6">
                <button className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <LogOut className="h-4 w-4" />
                    </div>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
