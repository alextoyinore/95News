"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { addComment, deleteComment, updateComment } from '@/lib/postActions';
import { Comment, User } from '@/types/firestore';
import { useRouter } from 'next/navigation';

interface CommentWithAuthor extends Comment {
    author?: User;
}

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [comments, setComments] = useState<CommentWithAuthor[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'posts', postId, 'comments'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CommentWithAuthor));

            const userIds = [...new Set(commentsData.map(c => c.authorId))];
            if (userIds.length > 0) {
                const usersQuery = query(collection(db, 'users'), where('id', 'in', userIds));
                const usersSnapshot = await getDocs(usersQuery);
                const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.data().id, doc.data() as User]));

                const commentsWithAuthors = commentsData.map(comment => ({
                    ...comment,
                    author: usersMap.get(comment.authorId)
                }));
                setComments(commentsWithAuthors);
            } else {
                setComments(commentsData);
            }
        });

        return () => unsubscribe();
    }, [postId]);

    const handleLoginRedirect = () => {
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            handleLoginRedirect();
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await addComment(postId, user.uid, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (parentId: string) => {
        if (!user) {
            handleLoginRedirect();
            return;
        }
        if (!replyContent.trim()) return;

        setLoading(true);
        try {
            await addComment(postId, user.uid, replyContent.trim(), parentId);
            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        setLoading(true);
        try {
            await updateComment(postId, commentId, editContent.trim());
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Error editing comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(postId, commentId);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const topLevelComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

    const CommentItem = ({ comment, isReply = false }: { comment: CommentWithAuthor; isReply?: boolean }) => (
        <div style={{
            marginLeft: isReply ? '3rem' : '0',
            marginBottom: '1.5rem',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1rem'
                }}>
                    {comment.author?.displayName?.[0] || comment.author?.email?.[0] || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                        {comment.author?.displayName || comment.author?.email || 'User'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                {user && user.uid === comment.authorId && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                setEditingId(comment.id);
                                setEditContent(comment.content);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: '0.25rem 0.5rem'
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(comment.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: '0.25rem 0.5rem'
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {editingId === comment.id ? (
                <div>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            minHeight: '80px',
                            resize: 'vertical',
                            marginBottom: '0.5rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleEdit(comment.id)}
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setEditContent('');
                            }}
                            className="btn btn-outline"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {comment.content}
                    </p>
                    {!isReply && user && (
                        <button
                            onClick={() => setReplyingTo(comment.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                padding: 0
                            }}
                        >
                            Reply
                        </button>
                    )}
                </>
            )}

            {replyingTo === comment.id && (
                <div style={{ marginTop: '1rem' }}>
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            minHeight: '80px',
                            resize: 'vertical',
                            marginBottom: '0.5rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => handleReply(comment.id)}
                            disabled={loading || !replyContent.trim()}
                            className="btn btn-primary"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                            Reply
                        </button>
                        <button
                            onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                            }}
                            className="btn btn-outline"
                            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {!isReply && getReplies(comment.id).map(reply => (
                <div key={reply.id} style={{ marginTop: '1rem' }}>
                    <CommentItem comment={reply} isReply={true} />
                </div>
            ))}
        </div>
    );

    return (
        <section style={{ marginTop: '5rem' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem', fontWeight: '700' }}>
                Comments ({comments.length})
            </h3>

            {user ? (
                <form onSubmit={handleSubmitComment} style={{ marginBottom: '3rem' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        required
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            minHeight: '120px',
                            resize: 'vertical',
                            marginBottom: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="btn btn-primary"
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            ) : (
                <div style={{ marginBottom: '3rem', position: 'relative' }}>
                    <textarea
                        placeholder="Log in to share your thoughts..."
                        readOnly
                        onFocus={handleLoginRedirect}
                        onClick={handleLoginRedirect}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            fontSize: '1rem',
                            minHeight: '120px',
                            resize: 'vertical',
                            cursor: 'pointer'
                        }}
                    />
                </div>
            )}

            <div>
                {topLevelComments.length > 0 ? (
                    topLevelComments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No comments yet. Be the first to comment!
                    </p>
                )}
            </div>
        </section>
    );
}
