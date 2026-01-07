"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, Category, User } from '@/types/firestore';
import { formatDate, getAuthorSlug } from '@/lib/utils';
import { Search } from 'lucide-react';

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination State
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [activeStrategy, setActiveStrategy] = useState<'keyword' | 'slug' | null>(null);

    const RESULTS_PER_PAGE = 20;

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
            if (searchTerm !== initialQuery) {
                const newUrl = searchTerm ? `/search?q=${encodeURIComponent(searchTerm)}` : '/search';
                router.replace(newUrl, { scroll: false });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, router, initialQuery]);

    // Helper to fetch docs based on strategy
    const fetchDocs = async (strategy: 'keyword' | 'slug', term: string, keyword?: string, startAfterDoc?: DocumentSnapshot) => {
        const constraints: any[] = [
            where("status", "==", "published")
        ];

        if (strategy === 'keyword' && keyword) {
            constraints.push(where("titleKeywords", "array-contains", keyword));
            constraints.push(orderBy("createdAt", "desc"));
        } else {
            // Slug strategy
            const slugStart = term.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            constraints.push(orderBy("slug"));
            constraints.push(where("slug", ">=", slugStart));
            constraints.push(where("slug", "<=", slugStart + '\uf8ff'));
        }

        constraints.push(limit(RESULTS_PER_PAGE));

        if (startAfterDoc) {
            constraints.push(startAfter(startAfterDoc));
        }

        const q = query(collection(db, "posts"), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs;
    };

    // Helper to process docs into rich objects and update state
    const processAndSetResults = async (docs: any[], isReset: boolean) => {
        if (docs.length === 0) {
            if (isReset) setResults([]);
            setHasMore(false);
            return;
        }

        const last = docs[docs.length - 1];
        setLastDoc(last);
        setHasMore(docs.length === RESULTS_PER_PAGE);

        const posts = docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

        // Resolve Relations (Authors/Categories)
        const authorIds = Array.from(new Set(posts.map(p => p.authorId)));
        const authorsMap: Record<string, any> = {};

        await Promise.all(authorIds.map(async (uid) => {
            const uSnap = await getDocs(query(collection(db, "users"), where("id", "==", uid), limit(1)));
            if (!uSnap.empty) {
                const uData = uSnap.docs[0].data() as User;
                authorsMap[uid] = {
                    name: uData.displayName || uData.email || "Author",
                    slug: getAuthorSlug(uData)
                };
            }
        }));

        const catSnap = await getDocs(collection(db, "categories"));
        const catMap: Record<string, string> = {};
        catSnap.forEach(doc => {
            catMap[doc.id] = doc.data().name;
        });

        const formatted = posts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            category: catMap[post.categoryIds?.[0] || ''] || "Uncategorized",
            author: authorsMap[post.authorId]?.name || "95News",
            date: formatDate(post.publishedAt || post.createdAt),
            image: post.featuredImageUrl
        }));

        if (isReset) {
            setResults(formatted);
        } else {
            setResults(prev => [...prev, ...formatted]);
        }
    };

    // Initial Search Effect
    useEffect(() => {
        const performSearch = async () => {
            const rawTerm = debouncedTerm.trim();
            if (!rawTerm) {
                setResults([]);
                setHasSearched(false);
                setLastDoc(null);
                setHasMore(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);
            setLastDoc(null);
            setHasMore(false);

            try {
                // Determine strategy
                const searchWords = rawTerm.toLowerCase().split(' ').map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w !== '');
                const strongKeyword = searchWords.find(w => w.length > 3);

                let strategy: 'keyword' | 'slug' = strongKeyword ? 'keyword' : 'slug';
                let docs = await fetchDocs(strategy, rawTerm, strongKeyword);

                // Fallback check
                if (docs.length === 0 && strategy === 'keyword') {
                    strategy = 'slug';
                    docs = await fetchDocs(strategy, rawTerm, strongKeyword);
                }

                setActiveStrategy(strategy);
                await processAndSetResults(docs, true);

            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedTerm]);

    const handleLoadMore = async () => {
        if (!hasMore || !lastDoc || !activeStrategy) return;

        setLoadingMore(true);
        try {
            const rawTerm = debouncedTerm.trim();
            const searchWords = rawTerm.toLowerCase().split(' ').map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w !== '');
            const strongKeyword = searchWords.find(w => w.length > 3);

            const docs = await fetchDocs(activeStrategy, rawTerm, strongKeyword, lastDoc);
            await processAndSetResults(docs, false);
        } catch (error) {
            console.error("Load more error:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="container" style={{ padding: "120px 1.5rem 4rem 1.5rem", minHeight: "60vh" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Search</h1>

            <div style={{ marginBottom: "4rem", maxWidth: "600px", position: "relative" }}>
                <Search style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} size={20} />
                <input
                    type="text"
                    placeholder="Search for stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "1rem 1.5rem 1rem 3.5rem",
                        fontSize: "1.2rem",
                        borderRadius: "var(--radius-lg)",
                        border: "2px solid var(--border)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "all 0.3s ease"
                    }}
                />
            </div>

            <div>
                <h3 style={{ marginBottom: "1.5rem", color: "var(--text-secondary)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                    {loading ? "Searching..." : hasSearched ? (results.length > 0 ? `Results for "${debouncedTerm}"` : `No results found for "${debouncedTerm}"`) : "Enter a keyword"}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {results.map(result => (
                        <Link key={result.id} href={`/${result.slug}`}>
                            <article style={{
                                paddingBottom: "2rem",
                                borderBottom: "1px solid var(--border)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <span style={{
                                        color: "var(--accent)",
                                        fontWeight: "700",
                                        fontSize: "0.75rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px"
                                    }}>
                                        {result.category}
                                    </span>
                                    <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{result.date}</span>
                                </div>
                                <h4 style={{ fontSize: "1.5rem", lineHeight: "1.3", margin: "0.5rem 0" }}>{result.title}</h4>
                                {result.excerpt && (
                                    <p style={{ opacity: 0.8, lineHeight: "1.6", maxWidth: "700px" }}>
                                        {result.excerpt.substring(0, 150)}...
                                    </p>
                                )}
                                <div style={{ fontSize: "0.85rem", marginTop: "1rem", fontWeight: "600", opacity: 0.7 }}>
                                    By {result.author}
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div style={{ marginTop: "3rem", textAlign: "center" }}>
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="btn btn-outline"
                            style={{ padding: "0.8rem 2rem" }}
                        >
                            {loadingMore ? "Loading..." : "Load More Articles"}
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .post-card-hover {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .post-card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: "4rem" }}>Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
