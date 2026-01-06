"use client";

import { collection, addDoc, deleteDoc, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export async function incrementPostViews(postId: string) {
    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
    try {
        // Check if user already liked the post
        const likesQuery = query(
            collection(db, 'postLikes'),
            where('postId', '==', postId),
            where('userId', '==', userId)
        );
        const likesSnapshot = await getDocs(likesQuery);

        if (!likesSnapshot.empty) {
            // Unlike: remove the like
            await deleteDoc(likesSnapshot.docs[0].ref);
            return false;
        } else {
            // Like: add the like
            await addDoc(collection(db, 'postLikes'), {
                postId,
                userId,
                createdAt: new Date().toISOString()
            });
            return true;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

export async function getPostLikeCount(postId: string): Promise<number> {
    try {
        const likesQuery = query(
            collection(db, 'postLikes'),
            where('postId', '==', postId)
        );
        const likesSnapshot = await getDocs(likesQuery);
        return likesSnapshot.size;
    } catch (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
}

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
        const likesQuery = query(
            collection(db, 'postLikes'),
            where('postId', '==', postId),
            where('userId', '==', userId)
        );
        const likesSnapshot = await getDocs(likesQuery);
        return !likesSnapshot.empty;
    } catch (error) {
        console.error('Error checking user like:', error);
        return false;
    }
}

export async function addComment(postId: string, userId: string, content: string, parentId?: string) {
    try {
        await addDoc(collection(db, 'comments'), {
            postId,
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

export async function deleteComment(commentId: string) {
    try {
        await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}

export async function updateComment(commentId: string, content: string) {
    try {
        await updateDoc(doc(db, 'comments', commentId), {
            content,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
    }
}
