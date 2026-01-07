"use client";

import { collection, addDoc, deleteDoc, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export async function incrementPostViews(postId: string) {
    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            views: increment(1)
        });
        // Also add to sub-collection for analytics
        await addDoc(collection(db, 'posts', postId, 'views'), {
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
    try {
        const likeRef = doc(db, 'posts', postId, 'likes', userId);
        const likeDoc = await getDocs(query(collection(db, 'posts', postId, 'likes'), where('userId', '==', userId))); // Actually accessing by ID directly is better if we use userId as docId

        // Use userId as document ID for easier toggling
        const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
        const docSnap = await import('firebase/firestore').then(mod => mod.getDoc(likeDocRef));

        if (docSnap.exists()) {
            await deleteDoc(likeDocRef);
            return false;
        } else {
            await import('firebase/firestore').then(mod => mod.setDoc(likeDocRef, {
                userId,
                createdAt: new Date().toISOString()
            }));
            return true;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

export async function getPostLikeCount(postId: string): Promise<number> {
    try {
        const likesSnapshot = await import('firebase/firestore').then(mod => mod.getCountFromServer(collection(db, 'posts', postId, 'likes')));
        return likesSnapshot.data().count;
    } catch (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
}

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
        const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
        const docSnap = await import('firebase/firestore').then(mod => mod.getDoc(likeDocRef));
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking user like:', error);
        return false;
    }
}

export async function addComment(postId: string, userId: string, content: string, parentId?: string) {
    try {
        await addDoc(collection(db, 'posts', postId, 'comments'), {
            authorId: userId,
            content,
            parentId: parentId || null,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export async function deleteComment(postId: string, commentId: string) {
    try {
        await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}

export async function updateComment(postId: string, commentId: string, content: string) {
    try {
        await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
            content,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
    }
}
