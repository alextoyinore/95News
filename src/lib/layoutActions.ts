"use server";

import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface LayoutSettings {
    activeTemplateId: string;
    homePageId?: string;
    spotlightAuthorId?: string;
    widgets: {
        id: string;
        name: string;
        active: boolean;
    }[];
    lastUpdated?: any;
}

const SETTINGS_COLLECTION = "site_settings";
const HOME_LAYOUT_DOC = "home_layout";

export const getLayoutSettings = async (): Promise<LayoutSettings | null> => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, HOME_LAYOUT_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as LayoutSettings;
            // Serialize timestamp to string if it exists
            if (data.lastUpdated && typeof data.lastUpdated.toDate === 'function') {
                data.lastUpdated = data.lastUpdated.toDate().toISOString();
            }
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching layout settings:", error);
        return null;
    }
};

export const saveLayoutSettings = async (settings: LayoutSettings) => {
    try {
        const docRef = doc(db, SETTINGS_COLLECTION, HOME_LAYOUT_DOC);
        await setDoc(docRef, {
            activeTemplateId: settings.activeTemplateId,
            homePageId: settings.homePageId || null,
            spotlightAuthorId: settings.spotlightAuthorId || null,
            widgets: settings.widgets,
            lastUpdated: serverTimestamp()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error("Error saving layout settings:", error);
        throw error;
    }
};
