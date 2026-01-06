"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    User as FirebaseUser
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User as FirestoreUser } from "@/types/firestore";

interface AuthContextType {
    user: FirebaseUser | null;
    userRecord: FirestoreUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRecord: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userRecord, setUserRecord] = useState<FirestoreUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                setUser(firebaseUser);

                // Fetch or create user record in Firestore
                const userDocRef = doc(db, "users", firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserRecord(userDocSnap.data() as FirestoreUser);
                } else {
                    // Create a default subscriber record if it doesn't exist
                    const newRecord: FirestoreUser = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || "",
                        displayName: firebaseUser.displayName || "",
                        photoURL: firebaseUser.photoURL || "",
                        role: 'subscriber'
                    };
                    await setDoc(userDocRef, newRecord);
                    setUserRecord(newRecord);
                }
            } else {
                setUser(null);
                setUserRecord(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRecord, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
