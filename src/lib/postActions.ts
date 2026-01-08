import { collection, addDoc, deleteDoc, query, where, getDocs, doc, updateDoc, increment, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';

export async function incrementPostViews(postId: string, ip?: string) {
    if (!ip) return;
    try {
        // Simple hash to anonymize IP
        const encoder = new TextEncoder();
        const data = encoder.encode(ip);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create a daily unique ID: hash + date
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const viewId = `${ipHash}_${today}`;

        const viewRef = doc(db, 'posts', postId, 'views', viewId);
        const viewDoc = await getDoc(viewRef);

        if (!viewDoc.exists()) {
            await setDoc(viewRef, {
                hashedIp: ipHash,
                date: today,
                timestamp: new Date().toISOString()
            });

            // Increment counter on main post doc
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                views: increment(1)
            });
        }
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

export async function getPostViewCount(postId: string): Promise<number> {
    try {
        const viewsSnapshot = await getCountFromServer(collection(db, 'posts', postId, 'views'));
        return viewsSnapshot.data().count;
    } catch (error) {
        console.error('Error getting view count:', error);
        return 0;
    }
}

export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
    try {
        const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
        const docSnap = await getDoc(likeDocRef);

        if (docSnap.exists()) {
            await deleteDoc(likeDocRef);
            return false;
        } else {
            await setDoc(likeDocRef, {
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
        const likesSnapshot = await getCountFromServer(collection(db, 'posts', postId, 'likes'));
        return likesSnapshot.data().count;
    } catch (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
}

export async function checkUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
        const likeDocRef = doc(db, 'posts', postId, 'likes', userId);
        const docSnap = await getDoc(likeDocRef);
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
