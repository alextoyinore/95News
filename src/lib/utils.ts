import { User } from "@/types/firestore";

export const formatDate = (dateVal: any) => {
    if (!dateVal) return "Unknown Date";
    try {
        // Handle Firestore Timestamp object (from server)
        if (dateVal && typeof dateVal.toDate === 'function') {
            return dateVal.toDate().toLocaleDateString();
        }
        // Handle serialized Firestore Timestamp (from client after Next.js serialization)
        if (dateVal && typeof dateVal === 'object' && 'seconds' in dateVal) {
            const d = new Date(dateVal.seconds * 1000);
            if (isNaN(d.getTime())) return "Invalid Date";
            return d.toLocaleDateString();
        }
        // Handle string or Date object
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleDateString();
    } catch (e) {
        return "Invalid Date";
    }
};

export const getAuthorSlug = (user: User) => {
    return (user.displayName || user.email.split('@')[0]).toLowerCase().replace(/\s+/g, '-');
};

export const getDateSlugs = (dateVal: any) => {
    try {
        const d = dateVal && typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal);
        if (isNaN(d.getTime())) return { year: "2026", month: "01" };
        const monthNum = (d.getMonth() + 1).toString().padStart(2, '0');
        return {
            year: d.getFullYear().toString(),
            month: monthNum
        };
    } catch (e) {
        return { year: "2026", month: "01" };
    }
};
