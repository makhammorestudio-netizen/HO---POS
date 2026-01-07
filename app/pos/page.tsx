"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Search,
    ShoppingCart,
    Trash2,
    CreditCard,
    Banknote,
    Smartphone,
    QrCode,
    Scissors,
    Sparkles,
    Eye,
    Package,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaffAvatar } from '@/components/staff/StaffAvatar';

// Types
interface Service {
    id: string;
    name: string;
    category: 'HAIR' | 'NAIL' | 'LASH' | 'PRODUCT';
    price: number;
    cogs?: number;
    durationMin: number;
}

interface Staff {
    id: string;
    name: string;
    role: 'STYLIST' | 'TECHNICIAN' | 'ASSISTANT';
    avatar?: string | null;
}

interface CartItem {
    service: Service;
    mainStaffId: string;      // required: STYLIST or TECHNICIAN
    assistantId?: string;     // optional: ASSISTANT only, HAIR services only
    price: number;            // Editable price
    cogs: number;             // Cost basis
}

const CATEGORIES = [
    { id: 'ALL', label: 'All Services', icon: Sparkles },
    { id: 'HAIR', label: 'Hair', icon: Scissors },
    { id: 'NAIL', label: 'Nail', icon: Sparkles },
    { id: 'LASH', label: 'Lash', icon: Eye },
    { id: 'PRODUCT', label: 'Products', icon: Package },
];

export default function POSPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'TRANSFER' | 'GOWABI'>('CASH');
    const [note, setNote] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const servicesRes = await fetch('/api/services');
                if (servicesRes.ok) {
                    const data = await servicesRes.json();
                    if (Array.isArray(data)) setServices(data);
                }

                const staffRes = await fetch('/api/staff');
                if (staffRes.ok) {
                    const data = await staffRes.json();
                    if (Array.isArray(data)) {
                        console.log('📋 Full staff list:', data);
                        console.log('👥 Staff roles:', data.map((s: any) => ({ name: s.name, role: s.role })));
                        setStaff(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                setError("Failed to load services or staff. Please refresh.");
            }
        };
        fetchData();
    }, []);

    const addToCart = (service: Service) => {
        // Default to first stylist or technician
        const defaultMain = staff.find((s: Staff) => s.role === 'STYLIST' || s.role === 'TECHNICIAN')?.id || '';
        setCart([...cart, {
            service,
            mainStaffId: defaultMain,
            price: Number(service.price),
            cogs: Number(service.cogs || 0)
        }]);
        setSuccess(null);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateItemStaff = (index: number, field: 'mainStaffId' | 'assistantId', value: string) => {
        const newCart = [...cart];
        newCart[index] = { ...newCart[index], [field]: value };
        setCart(newCart);
    };

    const updateItemPrice = (index: number, value: string) => {
        const newPrice = parseFloat(value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            const newCart = [...cart];
            newCart[index] = { ...newCart[index], price: newPrice };
            setCart(newCart);
        }
    };

    const totalAmount = cart.reduce((sum: number, item: CartItem) => sum + item.price, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        serviceId: item.service.id,
                        price: item.price,
                        cogs: item.cogs,
                        mainStaffId: item.mainStaffId,
                        assistantId: item.assistantId,
                        category: item.service.category
                    })),
                    paymentMethod,
                    note
                }),
            });

            if (res.ok) {
                setSuccess('Transaction saved successfully!');
                setCart([]);
                setNote('');
                setPaymentMethod('CASH');
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Unable to save sale, please try again.');
            }
        } catch (e) {
            console.error(e);
            setError('Unable to save sale, please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const filteredServices = services.filter((s: Service) => {
        const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex h-[calc(100vh-4rem)] gap-6">
            {/* LEFT SIDE: Catalog */}
            <div className="flex flex-1 flex-col gap-6">
                {/* Header & Search */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Sale</h1>
                        <p className="text-muted-foreground">Select services to add to cart</p>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search services..."
                            className="pl-9 bg-white/5 border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                                selectedCategory === cat.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            )}
                        >
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Service Grid */}
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredServices.map((service: Service) => (
                        <button
                            key={service.id}
                            onClick={() => addToCart(service)}
                            className="group relative flex flex-col items-start justify-between rounded-2xl bg-white p-4 transition-all hover:shadow-lg hover:shadow-primary/20 card-shadow"
                        >
                            <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {service.category === 'HAIR' && <Scissors className="h-6 w-6" />}
                                {service.category === 'NAIL' && <Sparkles className="h-6 w-6" />}
                                {service.category === 'LASH' && <Eye className="h-6 w-6" />}
                                {service.category === 'PRODUCT' && <Package className="h-6 w-6" />}
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">{service.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{service.durationMin} min</p>
                            </div>
                            <div className="mt-4 text-lg font-bold text-foreground">
                                ฿{Number(service.price).toFixed(2)}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: Cart */}
            <div className="flex w-96 flex-col rounded-2xl bg-white card-shadow">
                <div className="border-b border-slate-200 p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Current Order
                    </h2>
                    <p className="text-sm text-muted-foreground">{cart.length} items</p>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="mx-6 mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-600 border border-red-500/20">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-6 mt-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 border border-green-500/20">
                        {success}
                    </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                            <ShoppingCart className="h-12 w-12 mb-2" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item: CartItem, index: number) => (
                            <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-foreground">{item.service.name}</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">฿</span>
                                        <Input
                                            type="number"
                                            className="h-7 w-20 px-1 py-0 text-right font-bold bg-white border-slate-200"
                                            value={item.price}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateItemPrice(index, e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Staff Selection */}
                                <div className="space-y-2 text-sm">
                                    {/* Main Staff - STYLIST or TECHNICIAN only */}
                                    <div className="flex items-center gap-2">
                                        <div className="shrink-0">
                                            <StaffAvatar
                                                name={staff.find((s: Staff) => s.id === item.mainStaffId)?.name || "?"}
                                                avatar={staff.find((s: Staff) => s.id === item.mainStaffId)?.avatar}
                                                size="sm"
                                                className="h-8 w-8"
                                            />
                                        </div>
                                        <select
                                            className="w-full rounded bg-white px-2 py-1 text-xs border border-slate-200 text-foreground h-8"
                                            value={item.mainStaffId}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => updateItemStaff(index, 'mainStaffId', e.target.value)}
                                        >
                                            <option value="">Select Main Staff</option>
                                            {(() => {
                                                const mainStaffOptions = staff.filter((s: Staff) => s.role === 'STYLIST' || s.role === 'TECHNICIAN');
                                                return mainStaffOptions.map((s: Staff) => {
                                                    const roleDisplay = s.role === 'STYLIST' ? 'Stylist' : 'Technician';
                                                    return (
                                                        <option key={s.id} value={s.id}>{s.name} ({roleDisplay})</option>
                                                    );
                                                });
                                            })()}
                                        </select>
                                    </div>

                                    {/* Assistant - ASSISTANT only, HAIR services only */}
                                    {item.service.category === 'HAIR' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="shrink-0">
                                                {item.assistantId ? (
                                                    <StaffAvatar
                                                        name={staff.find((s: Staff) => s.id === item.assistantId)?.name || "?"}
                                                        avatar={staff.find((s: Staff) => s.id === item.assistantId)?.avatar}
                                                        size="sm"
                                                        className="h-8 w-8"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-muted-foreground">
                                                        -
                                                    </div>
                                                )}
                                            </div>
                                            <select
                                                className="w-full rounded bg-white px-2 py-1 text-xs border border-slate-200 text-foreground h-8"
                                                value={item.assistantId || ''}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateItemStaff(index, 'assistantId', e.target.value)}
                                            >
                                                <option value="">No Assistant</option>
                                                {staff.filter((s: Staff) => s.role === 'ASSISTANT').map((s: Staff) => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeFromCart(index)}
                                    className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="h-3 w-3" /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                <div className="border-t border-slate-200 bg-slate-50 p-6 space-y-4">
                    {/* Note */}
                    <Input
                        placeholder="Add note / coupon..."
                        value={note}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
                        className="bg-white border-slate-200"
                    />

                    {/* Payment Method */}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'CASH', icon: Banknote, label: 'Cash' },
                            { id: 'CREDIT_CARD', icon: CreditCard, label: 'Card' },
                            { id: 'TRANSFER', icon: Smartphone, label: 'Transfer' },
                            { id: 'GOWABI', icon: QrCode, label: 'Gowabi' },
                        ].map(method => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-lg p-2 text-[10px] transition-all gap-1",
                                    paymentMethod === method.id
                                        ? "bg-primary text-white shadow-md"
                                        : "bg-white text-muted-foreground hover:bg-slate-100 border border-slate-200"
                                )}
                            >
                                <method.icon className="h-4 w-4" />
                                {method.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-lg font-bold text-foreground">
                        <span>Total</span>
                        <span>฿{totalAmount.toFixed(2)}</span>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25"
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                    >
                        {isCheckingOut ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Checkout'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
