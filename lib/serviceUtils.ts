import { Service } from "@prisma/client";

// Local storage key
const STORAGE_KEY = "ho_pos_services";

// Validation helper
export const validateServiceForm = (data: Partial<Service>): { isValid: boolean; error?: string } => {
    if (!data.name || data.name.length < 2) {
        return { isValid: false, error: "Service name must be at least 2 characters" };
    }
    if (!data.category) {
        return { isValid: false, error: "Category is required" };
    }
    if (data.price === undefined || Number(data.price) < 0) {
        return { isValid: false, error: "Price must be a positive number" };
    }
    if (data.cogs !== undefined && Number(data.cogs) < 0) {
        return { isValid: false, error: "Cost (COGS) cannot be negative" };
    }
    return { isValid: true };
};

// Fetch services (merged API + Local)
export const getServicesList = async (): Promise<Service[]> => {
    let apiServices: Service[] = [];
    try {
        const res = await fetch("/api/services");
        if (res.ok) {
            apiServices = await res.json();
        }
    } catch (e) {
        console.warn("API Service fetch failed, using local only", e);
    }

    // Load local overrides/new items
    const localData = localStorage.getItem(STORAGE_KEY);
    const localServices: Service[] = localData ? JSON.parse(localData) : [];

    // Map by ID for easy merging
    const serviceMap = new Map<string, Service>();

    // API first
    apiServices.forEach(s => serviceMap.set(s.id, s));

    // Local overrides (if ID matches, it updates; if new ID, it adds)
    localServices.forEach(s => serviceMap.set(s.id, s));

    return Array.from(serviceMap.values());
};

// Save service (Attempt API -> Fallback Local)
export const saveServiceToLocal = (service: Service) => {
    const localData = localStorage.getItem(STORAGE_KEY);
    const localServices: Service[] = localData ? JSON.parse(localData) : [];

    // Update or Add
    const index = localServices.findIndex(s => s.id === service.id);
    if (index >= 0) {
        localServices[index] = service;
    } else {
        localServices.push(service);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(localServices));
};
