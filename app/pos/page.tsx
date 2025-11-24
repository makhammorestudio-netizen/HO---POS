"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Service, User } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CartItem {
    service: Service;
    primaryStaffId: string;
    assistantStaffId?: string;
}

const PAYMENT_METHODS = [
    { id: "CASH", label: "Cash" },
    { id: "CREDIT_CARD", label: "Credit Card" },
    { id: "TRANSFER", label: "Bank Transfer" },
    { id: "GOWABI", label: "Gowabi" },
];

export default function POSPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [note, setNote] = useState<string>("");

    useEffect(() => {
        // Fetch initial data
        Promise.all([
            fetch("/api/services").then(res => res.json()), // Need to create this API
            fetch("/api/staff").then(res => res.json())
        ]).then(([servicesData, staffData]) => {
            setServices(servicesData);
            setStaff(staffData);
            if (staffData.length > 0) setSelectedStaff(staffData[0].id);
        });
    }, []);

    const addToCart = (service: Service) => {
        if (!selectedStaff) {
            alert("Please select a stylist first");
            return;
        }
        setCart([...cart, {
            service,
            primaryStaffId: selectedStaff
        }]);
    };

    const handleCheckout = async () => {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cart.map(item => ({
                    serviceId: item.service.id,
                    price: item.service.price,
                    primaryStaffId: item.primaryStaffId,
                    assistantStaffId: item.assistantStaffId
                })),
                paymentMethod: paymentMethod,
                note: note,
                customerId: null // Optional for now
            })
        });

        if (res.ok) {
            alert("Transaction Successful!");
            setCart([]);
            setNote("");
        } else {
            alert("Transaction Failed");
        }
    };

    const total = cart.reduce((sum, item) => sum + Number(item.service.price), 0);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left: Service Catalog */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Services</h1>
                    <select
                        className="p-2 border rounded"
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                        <option value="" disabled>Select Stylist</option>
                        {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {services.map((service) => (
                        <Card
                            key={service.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => addToCart(service)}
                        >
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                                <h3 className="font-semibold">{service.name}</h3>
                                <p className="text-primary font-bold mt-2">${Number(service.price).toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 bg-white border-l flex flex-col shadow-xl">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Current Sale</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-10">Cart is empty</div>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                                <div>
                                    <div className="font-medium">{item.service.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Stylist: {staff.find(s => s.id === item.primaryStaffId)?.name}
                                    </div>
                                </div>
                                <div className="font-bold">${Number(item.service.price).toFixed(2)}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t bg-slate-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            {PAYMENT_METHODS.map(method => (
                                <option key={method.id} value={method.id}>{method.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Note / Coupon Code</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="Optional..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between text-xl font-bold mb-4">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full h-12 text-lg" onClick={handleCheckout} disabled={cart.length === 0}>
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}
