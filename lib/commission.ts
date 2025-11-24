import { Role, ServiceCategory } from "@prisma/client";

interface CommissionContext {
    servicePrice: number;
    serviceCategory: ServiceCategory;
    staffRole: Role;
    isAssistant: boolean; // True if this person is the secondary/assistant on the item
}

export function calculateCommission({
    servicePrice,
    serviceCategory,
    staffRole,
    isAssistant,
}: CommissionContext): number {
    // Rule 1: Stylist gets 10% on Hair services only
    if (staffRole === Role.STYLIST) {
        if (serviceCategory === ServiceCategory.HAIR) {
            return servicePrice * 0.10;
        }
        return 0; // No commission for other services for Stylists (based on current rules)
    }

    // Rule 2: Assistant Stylist logic
    if (staffRole === Role.ASSISTANT) {
        if (isAssistant) {
            // 5% if helping
            return servicePrice * 0.05;
        } else {
            // 10% if solo (on any service)
            return servicePrice * 0.10;
        }
    }

    // Default to 0 for Admin or undefined roles
    return 0;
}
