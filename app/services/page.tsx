"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Trash2, Scissors, Eye, Package, Droplet, Tag } from 'lucide-react';

interface Service {
    id: string;
    name: string;
    category: string;
    price: number;
    durationMin: number;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New Service Form
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('HAIR');
    const [newPrice, setNewPrice] = useState('');
    const [newDuration, setNewDuration] = useState('60');

    // --- Helpers & Config ---

    const formatTHB = (amount: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const CATEGORY_META: Record<string, { icon: any; label: string }> = {
        HAIR: { icon: Scissors, label: 'Hair' },
        NAIL: { icon: Sparkles, label: 'Nail' },
        LASH: { icon: Eye, label: 'Lash' },
        PRODUCT: { icon: Package, label: 'Product' },
        WAX: { icon: Droplet, label: 'Wax' },
        OTHER: { icon: Tag, label: 'Other' },
    };

    // Fallback for unknown categories
    const getCategoryMeta = (cat: string) => {
        const key = cat?.toUpperCase();
        return CATEGORY_META[key] || { icon: Tag, label: cat || 'Unknown' };
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setServices(data);
                    setError(null);
                }
            } else {
                const err = await res.json();
                setError(err.error || "Could not connect to the database.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to load services.");
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCreate = async () => {
        if (!newName || !newPrice) return;
        setIsLoading(true);
        await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newName,
                category: newCategory,
                price: newPrice,
                durationMin: newDuration
            })
        });
        setNewName('');
        setNewPrice('');
        fetchServices();
        setIsLoading(false);
    };

    const handleSeed = async () => {
        setIsLoading(true);
        await fetch('/api/seed', { method: 'POST' });
        fetchServices();
        setIsLoading(false);
        alert('Example services added!');
    };

    const ActiveCategoryIcon = getCategoryMeta(newCategory).icon;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Services</h2>
                    <p className="text-muted-foreground">Manage your service catalog.</p>
                </div>
                <Button onClick={handleSeed} variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Example Data
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
                    <h3 className="font-bold">Database Error</h3>
                    <p>{error}</p>
                    <p className="mt-2 text-sm">If it says "Table does not exist", we need to push the schema.</p>
                </div>
            )}

            {/* Create Service Card */}
            <Card className="glass border-0">
                <CardHeader>
                    <CardTitle>Add New Service</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5 items-end">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Service Name</label>
                            <Input
                                placeholder="e.g. Haircut"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <label className="text-sm font-medium">Category</label>
                                <ActiveCategoryIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            >
                                {Object.keys(CATEGORY_META).map(catKey => (
                                    <option key={catKey} value={catKey}>
                                        {CATEGORY_META[catKey].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Price (THB)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={newPrice}
                                onChange={e => setNewPrice(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <Button onClick={handleCreate} disabled={isLoading}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Services List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map(service => {
                    const meta = getCategoryMeta(service.category);
                    const Icon = meta.icon;
                    return (
                        <Card key={service.id} className="glass border-0 overflow-hidden">
                            <CardContent className="pt-6 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        {/* Icon Badge */}
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#E5E6FF] flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-[#1F3C88]" />
                                        </div>

                                        <div>
                                            {/* Category Pill */}
                                            <div className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold mb-1
                                                bg-[rgba(229,230,255,0.8)] text-[#1F3C88] border border-[rgba(31,60,136,0.10)]">
                                                {meta.label}
                                            </div>
                                            <h3 className="font-semibold text-lg leading-tight">{service.name}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground bg-white/5 px-2 py-1 rounded">
                                        {service.durationMin} min
                                    </p>
                                    <div className="text-xl font-bold tracking-tight">
                                        {formatTHB(Number(service.price))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
