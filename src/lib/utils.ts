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
        if (isNaN(d.getTime())) return { year: "2026", month: "01", day: "01" };
        const monthNum = (d.getMonth() + 1).toString().padStart(2, '0');
        const dayNum = d.getDate().toString().padStart(2, '0');
        return {
            year: d.getFullYear().toString(),
            month: monthNum,
            day: dayNum
        };
    } catch (e) {
        return { year: "2026", month: "01", day: "01" };
    }
};
export const calculateReadTime = (content: any): number => {
    if (!content) return 0;

    let text = "";
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        const blocks = parsed.blocks || [];

        blocks.forEach((block: any) => {
            if (block.data?.text) {
                text += block.data.text + " ";
            } else if (block.data?.items) {
                // For list blocks
                block.data.items.forEach((item: string) => {
                    text += item + " ";
                });
            } else if (block.data?.content) {
                // For table blocks
                block.data.content.forEach((row: string[]) => {
                    row.forEach((cell: string) => {
                        text += cell + " ";
                    });
                });
            }
        });
    } catch (e) {
        // If it's not JSON, it might be raw HTML or text
        text = content.toString();
    }

    // Strip HTML tags
    const cleanText = text.replace(/<[^>]*>?/gm, '');

    // Calculate words (roughly)
    const words = cleanText.trim().split(/\s+/).length;

    // Average reading speed: 200-250 words per minute
    const wpm = 225;
    const minutes = Math.ceil(words / wpm);

    return minutes > 0 ? minutes : 1;
};
