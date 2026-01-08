"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, MessageCircle, Eye, Users, Layers, Image } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { Post, Category } from "@/types/firestore";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalComments: 0,
        pageViews: 0,
        subscribers: 0,
        totalPages: 0,
        totalCategories: 0,
        totalMedia: 0
    });
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [recentComments, setRecentComments] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Collections
                const postsSnap = await getDocs(collection(db, 'posts'));
                const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'subscriber')));
                const pagesSnap = await getDocs(collection(db, 'pages'));
                const categoriesSnap = await getDocs(collection(db, 'categories'));
                const mediaSnap = await getDocs(collection(db, 'media'));
                const commentsSnap = await getDocs(collection(db, 'comments'));

                let totalViews = 0;
                postsSnap.forEach(doc => {
                    const post = doc.data() as Post;
                    totalViews += post.views || 0;
                });

                setStats({
                    totalPosts: postsSnap.size,
                    totalComments: commentsSnap.size,
                    pageViews: totalViews,
                    subscribers: usersSnap.size,
                    totalPages: pagesSnap.size,
                    totalCategories: categoriesSnap.size,
                    totalMedia: mediaSnap.size
                });

                // 2. Recent Posts (Last 5)
                const recentPostsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(5));
                const recentPostsSnap = await getDocs(recentPostsQuery);
                setRecentPosts(recentPostsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));

                // 3. Recent Comments (Last 5)
                const recentCommentsQuery = query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(5));
                const recentCommentsSnap = await getDocs(recentCommentsQuery);
                setRecentComments(recentCommentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 4. Category Data for Doughnut Chart
                const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                const categoryCounts = categories.map(cat => {
                    const count = postsSnap.docs.filter(doc => (doc.data() as Post).categoryIds?.includes(cat.id)).length;
                    return { name: cat.name, count };
                });

                setCategoryData({
                    labels: categoryCounts.map(c => c.name),
                    datasets: [{
                        label: 'Posts per Category',
                        data: categoryCounts.map(c => c.count),
                        backgroundColor: [
                            '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
                        ],
                        borderWidth: 0,
                    }]
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div>Loading Dashboard...</div>;

    const lineData = {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
            label: 'Page Views',
            data: [12000, 19000, 15000, 22000, 25000, 30000],
            borderColor: '#ff4d00',
            backgroundColor: 'rgba(255, 77, 0, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            // Handle Firestore Timestamp
            if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString();
            // Handle ISO String
            return new Date(date).toLocaleDateString();
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: "2rem" }}>Overview</h1>

            <div className="dashboard-grid" style={{ marginBottom: "3rem" }}>
                {[
                    { label: "Total Posts", value: stats.totalPosts, icon: FileText, trend: "+12%" },
                    { label: "Page Views", value: stats.pageViews >= 1000 ? `${(stats.pageViews / 1000).toFixed(1)}k` : stats.pageViews, icon: Eye, trend: "+18%" },
                    { label: "Subscribers", value: stats.subscribers, icon: Users, trend: "+2%" },
                    { label: "Total Comments", value: stats.totalComments, icon: MessageCircle, trend: "+5%" },
                    { label: "Total Pages", value: stats.totalPages, icon: FileText, trend: "Static" },
                    { label: "Categories", value: stats.totalCategories, icon: Layers, trend: "Fixed" },
                ].map(stat => (
                    <div key={stat.label} className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <stat.icon size={20} style={{ color: "var(--accent)" }} />
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>{stat.trend}</span>
                        </div>
                        <h4 style={{ color: "var(--text-secondary)", fontWeight: "500", fontSize: "0.85rem" }}>{stat.label}</h4>
                        <p style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem" }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid" style={{ marginBottom: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))" }}>
                <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Traffic Analytics</h3>
                    <div style={{ height: "300px" }}>
                        <Line data={lineData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Content Split</h3>
                    <div style={{ height: "300px", display: "flex", justifyContent: "center" }}>
                        {categoryData && <Doughnut data={categoryData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gap: "2rem" }}>
                <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3>Recent Activity</h3>
                        <Link href="/dashboard/posts" style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: "600" }}>View All</Link>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                <th style={{ padding: "1rem 0" }}>Title</th>
                                <th style={{ padding: "1rem 0" }}>Status</th>
                                <th style={{ padding: "1rem 0" }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map((post) => (
                                <tr key={post.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem 0", fontWeight: "500", fontSize: "0.9rem" }}>{post.title}</td>
                                    <td style={{ padding: "1rem 0" }}>
                                        <span style={{
                                            padding: "0.15rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                            backgroundColor: post.status === "published" ? "#d1fae5" : "#fef3c7",
                                            color: post.status === "published" ? "#065f46" : "#92400e"
                                        }}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        {formatDate(post.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3>Recent Comments</h3>
                        <Link href="/dashboard/comments" style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: "600" }}>View All</Link>
                    </div>
                    {recentComments.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>No recent comments.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {recentComments.map((comment) => (
                                <div key={comment.id} style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                                        <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{comment.authorName || comment.author}</span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {comment.content}
                                    </p>
                                    <div style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "0.3rem" }}>
                                        on: {comment.postTitle || "Post"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

