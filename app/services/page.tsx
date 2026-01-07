"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Scissors, Eye, Package, Droplet, Tag, Edit2 } from 'lucide-react';
import { Service } from '@prisma/client';
import { getServicesList, saveServiceToLocal } from '@/lib/serviceUtils';
import { ServiceFormModal } from '@/components/services/ServiceFormModal';

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Helpers & Config
    const formatTHB = (amount: number | string) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(Number(amount));
    };

    const CATEGORY_META: Record<string, { icon: any; label: string }> = {
        HAIR: { icon: Scissors, label: 'Hair' },
        NAIL: { icon: Sparkles, label: 'Nail' },
        LASH: { icon: Eye, label: 'Lash' },
        PRODUCT: { icon: Package, label: 'Product' },
        WAX: { icon: Droplet, label: 'Wax' },
        OTHER: { icon: Tag, label: 'Other' },
    };

    const getCategoryMeta = (cat: string) => {
        const key = cat?.toUpperCase();
        return CATEGORY_META[key] || { icon: Tag, label: cat || 'Unknown' };
    };

    const loadServices = async () => {
        setIsLoading(true);
        const data = await getServicesList();
        setServices(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleCreateClick = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (service: Service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleSaveService = async (data: Partial<Service>) => {
        try {
            if (selectedService) {
                // Edit
                try {
                    const res = await fetch(`/api/services/${selectedService.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('API update failed');
                } catch (e) {
                    console.warn("API unavailable, saving locally", e);
                    saveServiceToLocal({ ...selectedService, ...data } as Service);
                }
            } else {
                // Create
                try {
                    const res = await fetch('/api/services', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('API create failed');
                } catch (e) {
                    console.warn("API unavailable, saving locally", e);
                    saveServiceToLocal({
                        ...data,
                        id: `local_${Date.now()}`,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    } as unknown as Service);
                }
            }
            // Reload to merge
            await loadServices();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#1F2A53]">Services</h2>
                    <p className="text-muted-foreground">Manage your service catalog and pricing.</p>
                </div>
                <Button onClick={handleCreateClick} className="bg-[#1F3C88] hover:bg-[#1F3C88]/90 text-white gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    Add New Service
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-[rgba(255,255,255,0.7)] p-4 rounded-xl border border-[rgba(31,60,136,0.12)]">
                <Input
                    placeholder="Search services..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md bg-white text-[#1F2A53]"
                />
            </div>

            {/* Services List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-[#4B5675]">Loading services...</div>
                ) : (
                    filteredServices.map(service => {
                        const meta = getCategoryMeta(service.category);
                        const Icon = meta.icon;
                        return (
                            <Card key={service.id} className="group relative border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden">
                                <CardContent className="pt-6">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#1F3C88]" onClick={() => handleEditClick(service)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>

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
                                                <h3 className="font-bold text-lg leading-tight text-[#1F2A53]">{service.name}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-50">
                                        <div className="text-sm">
                                            <div className="text-muted-foreground mb-1">{service.durationMin} min</div>
                                            {Number(service.cogs as any) > 0 && (
                                                <div className="text-xs text-slate-400">Cost: {formatTHB(service.cogs as any)}</div>
                                            )}
                                        </div>
                                        <div className="text-xl font-bold tracking-tight text-[#1F3C88]">
                                            {formatTHB(service.price)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
                initialData={selectedService}
            />
        </div>
    );
}
