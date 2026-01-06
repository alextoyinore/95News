"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { togglePostLike, getPostLikeCount, checkUserLiked } from '@/lib/postActions';
import { formatDate } from '@/lib/utils';

interface PostMetadataProps {
    postId: string;
    publishedAt?: string;
    createdAt: string;
    views?: number;
}

export default function PostMetadata({ postId, publishedAt, createdAt, views = 0 }: PostMetadataProps) {
    const { user } = useAuth();
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Fetch initial like count
        getPostLikeCount(postId).then(setLikeCount);

        // Check if user has liked
        if (user) {
            checkUserLiked(postId, user.uid).then(setIsLiked);
        }
    }, [postId, user]);

    const handleLike = async () => {
        if (!user) {
            alert('Please log in to like this post');
            return;
        }

        try {
            setIsAnimating(true);
            const liked = await togglePostLike(postId, user.uid);
            setIsLiked(liked);
            setLikeCount(prev => liked ? prev + 1 : prev - 1);
            setTimeout(() => setIsAnimating(false), 300);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            padding: '1.5rem 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: '2rem',
            flexWrap: 'wrap'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{formatDate(publishedAt || createdAt)}</span>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
            }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{views.toLocaleString()} views</span>
            </div>

            <button
                onClick={handleLike}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: isLiked ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => {
                    if (!isLiked) e.currentTarget.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                    if (!isLiked) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{likeCount > 0 ? likeCount.toLocaleString() : 'Like'}</span>
            </button>
        </div>
    );
}
