"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Trash2 } from 'lucide-react';

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

    // New Service Form
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('HAIR');
    const [newPrice, setNewPrice] = useState('');
    const [newDuration, setNewDuration] = useState('60');

    const fetchServices = async () => {
        const res = await fetch('/api/services');
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setServices(data);
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
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            >
                                <option value="HAIR">Hair</option>
                                <option value="NAIL">Nail</option>
                                <option value="LASH">Lash</option>
                                <option value="PRODUCT">Product</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Price ($)</label>
                            <Input
                                type="number"
                                placeholder="0.00"
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
                {services.map(service => (
                    <Card key={service.id} className="glass border-0">
                        <CardContent className="pt-6 flex justify-between items-start">
                            <div>
                                <div className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground mb-2">
                                    {service.category}
                                </div>
                                <h3 className="font-semibold text-lg">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">{service.durationMin} mins</p>
                            </div>
                            <div className="text-xl font-bold">
                                ${Number(service.price).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
