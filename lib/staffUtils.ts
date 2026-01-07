import { Role } from "@prisma/client";

export interface Staff {
    id: string;
    name: string;
    role: Role;
    pin: string | null;
    avatar?: string | null; // Can be URL, base64, or preset ID
    photoUrl?: string | null; // Explicit photo URL/Base64
}

const LOCAL_STORAGE_KEY_STAFF = "ho_pos_staff";
const LOCAL_STORAGE_KEY_PHOTOS = "ho_pos_staff_photos";

/**
 * Validates the staff form data.
 * Requirements: Name >= 2 chars, PIN exactly 4 digits.
 */
export const validateStaffForm = (data: Partial<Staff>): { isValid: boolean; error?: string } => {
    if (!data.name || data.name.trim().length < 2) {
        return { isValid: false, error: "Name must be at least 2 characters long." };
    }
    if (!data.role) {
        return { isValid: false, error: "Role is required." };
    }
    // Strict 4-digit PIN validation as per requirements
    if (!data.pin || !/^\d{4}$/.test(data.pin)) {
        return { isValid: false, error: "PIN must be exactly 4 digits." };
    }
    return { isValid: true };
};

/**
 * Resizes an image file to a maximum of 256x256 pixels and returns a Base64 string.
 */
export const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 256;
                const MAX_HEIGHT = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.8 quality
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Merges backend staff list with local storage staff list.
 * Local storage takes precedence for updates if simplified, but here we just dedupe by ID.
 * Since backend is source of truth, we usually prefer backend, but for offline-created items
 * they won't exist in backend yet.
 */
export const getStaffList = async (): Promise<Staff[]> => {
    let apiStaff: Staff[] = [];
    try {
        const res = await fetch("/api/staff");
        if (res.ok) {
            apiStaff = await res.json();
        }
    } catch (error) {
        console.warn("Failed to fetch staff from API, falling back to local storage only.", error);
    }

    // Get local staff
    let localStaff: Staff[] = [];
    if (typeof window !== "undefined") {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY_STAFF);
        if (stored) {
            try {
                localStaff = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse local staff", e);
            }
        }
    }

    // Merge: Create a map by ID. API wins if conflict (assuming API is fresher), 
    // unless we strictly want local to override. 
    // Requirements say: "merge backend staff + localStorage staff (dedupe by id)"
    const staffMap = new Map<string, Staff>();

    // Add API staff first
    apiStaff.forEach(s => staffMap.set(s.id, s));

    // Add/Overwrite with Local staff (this allows local edits to persist if backend isn't updated yet)
    // Or, if we assume API is truth, we only add unique local IDs.
    // Let's adopt a strategy: Local staff are predominantly for "offline created" ones.
    // If an ID exists in API, we usually trust API. But user asked for "localStorage fallback".
    // Let's trust API for existence, but maybe check local for "unsynced" changes? 
    // Simplified User Algo: "dedupe by id". We will treat API as primary, apply Local for missing ones.
    localStaff.forEach(s => {
        if (!staffMap.has(s.id)) {
            staffMap.set(s.id, s);
        }
        // If we wanted local edits to win, we'd do staffMap.set(s.id, s) here unconditionally.
        // For now, let's stick to "adding missing ones".
    });

    // Also inject photos from local storage if they exist
    if (typeof window !== "undefined") {
        const photoMapStr = localStorage.getItem(LOCAL_STORAGE_KEY_PHOTOS);
        if (photoMapStr) {
            try {
                const photoMap = JSON.parse(photoMapStr);
                staffMap.forEach(staff => {
                    if (photoMap[staff.id]) {
                        staff.photoUrl = photoMap[staff.id];
                        // If avatar is not set or matches raw value, we can override it for display
                        // staff.avatar = photoMap[staff.id]; 
                    }
                });
            } catch (e) { console.error(e); }
        }
    }

    return Array.from(staffMap.values());
};

/**
 * Saves a staff member to local storage.
 */
export const saveStaffToLocal = (staff: Staff) => {
    if (typeof window === "undefined") return;

    // 1. Save Staff Data
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_STAFF);
    let list: Staff[] = stored ? JSON.parse(stored) : [];

    const index = list.findIndex(s => s.id === staff.id);
    if (index >= 0) {
        list[index] = staff;
    } else {
        list.push(staff);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_STAFF, JSON.stringify(list));

    // 2. Save Photo if exists (separate key to avoid bloat if we separated them, but requirement said 'map')
    if (staff.photoUrl) {
        const photoStoreStr = localStorage.getItem(LOCAL_STORAGE_KEY_PHOTOS);
        const photoStore = photoStoreStr ? JSON.parse(photoStoreStr) : {};
        photoStore[staff.id] = staff.photoUrl;
        localStorage.setItem(LOCAL_STORAGE_KEY_PHOTOS, JSON.stringify(photoStore));
    }
};

/**
 * Generates a deterministic avatar placeholder (initials + color) logic 
 * is actually handled well by the Avatar component usually, but here we helper it.
 */
export const getAvatarForStaff = (staff: Staff) => {
    if (staff.photoUrl) return staff.photoUrl; // Local base64 or API URL
    if (staff.avatar && staff.avatar.startsWith("http")) return staff.avatar;
    if (staff.avatar && staff.avatar.startsWith("data:")) return staff.avatar;

    // Fallback to presets or return null to let UI render initials
    if (staff.avatar && staff.avatar.includes("avatar-")) return staff.avatar; // Preset ID

    return null; // Let UI handle initials
};
