import { useState, useEffect, useRef } from "react";
import { Search, UserPlus, Check, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    fullName: string;
    phone?: string | null;
}

interface CustomerSelectorProps {
    customers: Customer[];
    selectedCustomerId: string | null;
    onSelect: (id: string | null) => void;
    onAddNew: () => void;
}

export function CustomerSelector({ customers, selectedCustomerId, onSelect, onAddNew }: CustomerSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const filteredCustomers = customers.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <label className="text-sm font-bold text-[#1F2A53] mb-1.5 block">Customer (optional)</label>
            <div
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors",
                    !selectedCustomerId && "text-slate-400"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 truncate">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    {selectedCustomer ? (
                        <span className="text-[#1F2A53] font-medium">
                            {selectedCustomer.fullName} {selectedCustomer.phone ? `- ${selectedCustomer.phone}` : ""}
                        </span>
                    ) : (
                        "Select customer (Walk-in)..."
                    )}
                </div>
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
            </div>

            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                autoFocus
                                placeholder="Search by name or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 pl-9 bg-white border-slate-200 text-sm"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        <button
                            className={cn(
                                "flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors border-b border-slate-50",
                                !selectedCustomerId && "bg-[#E5E6FF] text-[#1F3C88] font-bold"
                            )}
                            onClick={() => {
                                onSelect(null);
                                setIsOpen(false);
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4 opacity-70" />
                                Walk-in Customer
                            </span>
                            {!selectedCustomerId && <Check className="h-4 w-4 text-[#1F3C88]" />}
                        </button>

                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <button
                                    key={customer.id}
                                    className={cn(
                                        "flex items-center justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors",
                                        selectedCustomerId === customer.id && "bg-[#E5E6FF] text-[#1F3C88] font-bold"
                                    )}
                                    onClick={() => {
                                        onSelect(customer.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[#1F2A53]">{customer.fullName}</span>
                                        {customer.phone && <span className="text-xs text-slate-400">{customer.phone}</span>}
                                    </div>
                                    {selectedCustomerId === customer.id && <Check className="h-4 w-4 text-[#1F3C88]" />}
                                </button>
                            ))
                        ) : (
                            search && (
                                <div className="p-4 text-center text-sm text-slate-400">
                                    No customer found
                                </div>
                            )
                        )}
                    </div>

                    <button
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-[#1F3C88] font-bold bg-[#E5E6FF]/50 hover:bg-[#E5E6FF] transition-colors border-t border-[rgba(31,60,136,0.1)]"
                        onClick={() => {
                            onAddNew();
                            setIsOpen(false);
                        }}
                    >
                        <UserPlus className="h-4 w-4" />
                        + Add New Customer
                    </button>
                </div>
            )}
        </div>
    );
}
