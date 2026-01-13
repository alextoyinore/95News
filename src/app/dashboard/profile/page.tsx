"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';

export default function ProfilePage() {
    const { user, userRecord } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        displayName: userRecord?.displayName || '',
        bio: userRecord?.bio || ''
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file);
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                photoURL: url
            });
            // We rely on the real-time listener in AuthContext to update the userRecord
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    React.useEffect(() => {
        if (userRecord) {
            setFormData({
                displayName: userRecord.displayName || '',
                bio: userRecord.bio || ''
            });
        }
    }, [userRecord]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                bio: formData.bio
            });
            // Success feedback would go here
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!userRecord) return <div>Loading...</div>;

    const initials = (userRecord.displayName || user?.email || 'U').charAt(0).toUpperCase();

    return (
        <div style={{ maxWidth: "800px" }}>
            <h1 style={{ marginBottom: "2rem" }}>Your Profile</h1>

            <div className="profile-layout">
                {/* Profile Sidebar */}
                <div>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
                        <div style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            margin: "0 auto 1.5rem",
                            backgroundColor: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "3rem",
                            fontWeight: "700",
                            overflow: "hidden",
                            border: "4px solid var(--bg-tertiary)",
                            position: "relative"
                        }}>
                            {userRecord.photoURL ? (
                                <img
                                    src={userRecord.photoURL}
                                    alt={userRecord.displayName || 'User'}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : initials}

                            {isUploading && (
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    backgroundColor: "rgba(0,0,0,0.5)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <h3 style={{ marginBottom: "0.5rem" }}>{userRecord.displayName || user?.email?.split('@')[0]}</h3>
                        <p style={{ color: "var(--accent)", fontWeight: "600", fontSize: "0.9rem", textTransform: "uppercase" }}>{userRecord.role}</p>
                        <div style={{ marginTop: "2rem" }}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                className="btn"
                                style={{ width: "100%", border: "1px solid var(--border)" }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Change Avatar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>General Information</h3>
                        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    style={{
                                        width: "100%",
                                        padding: "0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "transparent"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        padding: "0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "var(--bg-tertiary)",
                                        color: "var(--text-muted)"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        padding: "0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        border: "1px solid var(--border)",
                                        backgroundColor: "transparent",
                                        resize: "none"
                                    }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ alignSelf: "flex-start" }}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
