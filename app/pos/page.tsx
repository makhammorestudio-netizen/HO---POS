"use client";

import { useState, useEffect } from 'react';
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
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Service {
    id: string;
    name: string;
    category: 'HAIR' | 'NAIL' | 'LASH' | 'PRODUCT';
    price: number;
    durationMin: number;
}

interface Staff {
    id: string;
    name: string;
    role: 'STYLIST' | 'ASSISTANT';
}

interface CartItem {
    service: Service;
    primaryStaffId: string;
    assistantStaffId?: string;
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
                    if (Array.isArray(data)) setStaff(data);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    const addToCart = (service: Service) => {
        // Default to first stylist found
        const defaultStylist = staff.find(s => s.role === 'STYLIST')?.id || '';
        setCart([...cart, { service, primaryStaffId: defaultStylist }]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateItemStaff = (index: number, field: 'primaryStaffId' | 'assistantStaffId', value: string) => {
        const newCart = [...cart];
        newCart[index] = { ...newCart[index], [field]: value };
        setCart(newCart);
    };

    const totalAmount = cart.reduce((sum, item) => sum + Number(item.service.price), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        serviceId: item.service.id,
                        price: item.service.price,
                        primaryStaffId: item.primaryStaffId,
                        assistantStaffId: item.assistantStaffId
                    })),
                    paymentMethod,
                    note
                }),
            });

            if (res.ok) {
                alert('Transaction completed!');
                setCart([]);
                setNote('');
                setPaymentMethod('CASH');
            } else {
                alert('Checkout failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error processing transaction');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const filteredServices = services.filter(s => {
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
                    {filteredServices.map(service => (
                        <button
                            key={service.id}
                            onClick={() => addToCart(service)}
                            className="group relative flex flex-col items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10"
                        >
                            <div className="mb-4 rounded-lg bg-white/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                {service.category === 'HAIR' && <Scissors className="h-6 w-6" />}
                                {service.category === 'NAIL' && <Sparkles className="h-6 w-6" />}
                                {service.category === 'LASH' && <Eye className="h-6 w-6" />}
                                {service.category === 'PRODUCT' && <Package className="h-6 w-6" />}
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">{service.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{service.durationMin} min</p>
                            </div>
                            <div className="mt-4 text-lg font-bold">
                                ฿{Number(service.price).toFixed(2)}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT SIDE: Cart */}
            <div className="flex w-96 flex-col rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl">
                <div className="border-b border-white/10 p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Current Order
                    </h2>
                    <p className="text-sm text-muted-foreground">{cart.length} items</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-50">
                            <ShoppingCart className="h-12 w-12 mb-2" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">{item.service.name}</span>
                                    <span className="font-bold">฿{Number(item.service.price).toFixed(2)}</span>
                                </div>

                                {/* Staff Selection */}
                                <div className="space-y-2 text-sm">
                                    <select
                                        className="w-full rounded bg-black/20 px-2 py-1 text-xs border border-white/10"
                                        value={item.primaryStaffId}
                                        onChange={(e) => updateItemStaff(index, 'primaryStaffId', e.target.value)}
                                    >
                                        <option value="">Select Stylist</option>
                                        {staff.filter(s => s.role === 'STYLIST').map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        className="w-full rounded bg-black/20 px-2 py-1 text-xs border border-white/10"
                                        value={item.assistantStaffId || ''}
                                        onChange={(e) => updateItemStaff(index, 'assistantStaffId', e.target.value)}
                                    >
                                        <option value="">No Assistant</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={() => removeFromCart(index)}
                                    className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-red-400 hover:text-red-300"
                                >
                                    <Trash2 className="h-3 w-3" /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                <div className="border-t border-white/10 bg-black/40 p-6 space-y-4">
                    {/* Note */}
                    <Input
                        placeholder="Add note / coupon..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="bg-white/5 border-white/10"
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
                                        ? "bg-primary text-white"
                                        : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                <method.icon className="h-4 w-4" />
                                {method.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>฿{totalAmount.toFixed(2)}</span>
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25"
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isCheckingOut}
                    >
                        {isCheckingOut ? 'Processing...' : 'Checkout'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
