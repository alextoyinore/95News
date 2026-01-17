import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post, User, Category, Page } from "@/types/firestore";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorBio from "@/components/AuthorBio";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import PostContentRenderer from "@/components/PostContentRenderer";
import { formatDate, getDateSlugs, calculateReadTime } from "@/lib/utils";
import Newsletter from "@/components/widgets/Newsletter";
import AudioPlayer from "@/components/AudioPlayer";
import BrowserAudioPlayer from "@/components/BrowserAudioPlayer";
import ShareButtons from "@/components/ShareButtons";
import PostMetadata from "@/components/PostMetadata";
import CommentSection from "@/components/CommentSection";
import RelatedPosts from "@/components/RelatedPosts";
import { incrementPostViews } from "@/lib/postActions";
import { getPageBySlug } from "@/lib/cmsActions";
import MagazinePageRenderer from "@/components/MagazinePageRenderer";
import StandardPageRenderer from "@/components/StandardPageRenderer";
import { getLayoutSettings } from "@/lib/layoutActions";

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

async function getPostBySlug(slug: string) {
    const q = query(collection(db, "posts"), where("slug", "==", slug), where("status", "==", "published"), limit(1));
    const querySnap = await getDocs(q);

    if (querySnap.empty) return null;

    const docSnap = querySnap.docs[0];
    const data = docSnap.data() as Post;

    // Resolve Author
    let author: User | null = null;
    try {
        if (data.authorId) {
            const authorDoc = await getDoc(doc(db, "users", data.authorId));
            if (authorDoc.exists()) {
                author = { id: authorDoc.id, ...authorDoc.data() } as User;
            }
        }
    } catch (e) {
        console.error("Error fetching author:", e);
    }

    // Resolve Contributors
    let contributors: User[] = [];
    if (data.contributors && data.contributors.length > 0) {
        try {
            const uniqueContributors = Array.from(new Set(data.contributors));
            if (uniqueContributors.length > 0) {
                const contributorDocs = await Promise.all(
                    uniqueContributors.slice(0, 10).map(id => getDoc(doc(db, "users", id)))
                );
                contributors = contributorDocs
                    .filter(d => d.exists())
                    .map(d => ({ id: d.id, ...d.data() } as User));
            }
        } catch (e) {
            console.error("Error fetching contributors:", e);
        }
    }

    // Resolve Category (first one)
    let category: Category | null = null;
    if (data.categoryIds && data.categoryIds.length > 0) {
        try {
            const catQuery = query(collection(db, "categories"), where("id", "==", data.categoryIds[0]), limit(1));
            const catSnap = await getDocs(catQuery);
            if (!catSnap.empty) {
                category = { id: catSnap.docs[0].id, ...catSnap.docs[0].data() } as Category;
            }
        } catch (e) {
            console.error("Error fetching category:", e);
        }
    }

    return {
        ...data,
        id: docSnap.id,
        author,
        contributors,
        category,
    };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;

    // 1. Try to fetch as a Post
    const post = await getPostBySlug(slug);

    if (!post) {
        // 2. Try to fetch as a Page
        const page = await getPageBySlug(slug);

        if (!page) {
            notFound();
        }

        const layoutSettings = await getLayoutSettings();

        if (page.layoutType === 'magazine') {
            return <MagazinePageRenderer page={page} layoutSettings={layoutSettings} />;
        }

        return <StandardPageRenderer page={page} />;
    }

    const breadcrumbItems = [
        { label: post.category?.name || "News", href: `/category/${post.category?.slug || "news"}` },
        { label: post.title.length > 50 ? post.title.substring(0, 50) + "..." : post.title }
    ];

    const authorDisplayName = post.author?.displayName || post.author?.email || "95News";
    const authorId = post.author?.id;

    // Dynamically detect domain and IP
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const currentUrl = `${proto}://${host}/${slug}`;

    // Track View
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    await incrementPostViews(post.id, ip);

    // Serialize timestamps for Client Components
    const serializedCreatedAt = post.createdAt ? (typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toDate().toISOString()) : new Date().toISOString();
    const serializedPublishedAt = post.publishedAt ? (typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt.toDate().toISOString()) : undefined;
    const archiveSlugs = getDateSlugs(post.createdAt);
    const readTime = calculateReadTime(post.content);

    return (
        <>
            <ReadingProgressBar />

            <div className="container site-content" style={{ paddingBottom: "5rem" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <Breadcrumbs items={breadcrumbItems} />

                    <article>
                        <header style={{ marginBottom: "2rem" }}>
                            <h1 style={{
                                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                                fontWeight: "800",
                                lineHeight: "1.1",
                                marginBottom: "1.5rem"
                            }}>
                                {post.title}
                            </h1>

                            {post.excerpt && (
                                <p style={{
                                    fontSize: "1.25rem",
                                    color: "var(--text-secondary)",
                                    lineHeight: "1.6",
                                    marginBottom: "1.5rem"
                                }}>
                                    {post.excerpt}
                                </p>
                            )}

                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.5rem",
                                flexWrap: "wrap",
                                marginBottom: "1.5rem"
                            }}>
                                <Link href={authorId ? `/author/${authorId.trim()}` : "#"} style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--accent)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "700",
                                        color: "white",
                                        fontSize: "1.2rem"
                                    }}>
                                        {authorDisplayName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                                            {authorDisplayName}
                                        </div>
                                        <Link
                                            href={`/archive/${archiveSlugs.year}/${archiveSlugs.month}/${archiveSlugs.day}`}
                                            style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                                            className="hover-accent"
                                        >
                                            {formatDate(post.createdAt)}
                                        </Link>
                                    </div>
                                </Link>


                                {post.contributors && post.contributors.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>Contributors</span>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                            {post.contributors.map((contributor: User, idx: number) => (
                                                <Link key={contributor.id} href={`/author/${contributor.id}`} style={{ textDecoration: "underline" }}>
                                                    {contributor.displayName || contributor.email || "Unknown"}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {post.category && (
                                    <Link href={`/category/${post.category.slug}`} style={{
                                        backgroundColor: "var(--accent)",
                                        color: "white",
                                        padding: "0.4rem 0.8rem",
                                        borderRadius: "var(--radius-sm)",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        textTransform: "uppercase"
                                    }}>
                                        {post.category.name}
                                    </Link>
                                )}
                            </div>
                        </header>

                        <PostMetadata
                            postId={post.id}
                            publishedAt={serializedPublishedAt}
                            createdAt={serializedCreatedAt}
                            readTime={readTime}
                        />

                        {post.audioUrl ? (
                            <AudioPlayer audioUrl={post.audioUrl} title={post.title} />
                        ) : (
                            <BrowserAudioPlayer content={post.content} title={post.title} />
                        )}

                        {post.featuredImageUrl && (
                            <figure style={{ marginBottom: "3rem" }}>
                                <img
                                    src={post.featuredImageUrl}
                                    alt={post.title}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "16 / 9",
                                        borderRadius: "var(--radius-lg)",
                                        objectFit: "cover"
                                    }}
                                />
                                {post.featuredImageCaption && (
                                    <figcaption style={{
                                        textAlign: "center",
                                        color: "var(--text-secondary)",
                                        fontSize: "0.95rem",
                                        marginTop: "1rem",
                                        fontStyle: "italic"
                                    }}>
                                        {post.featuredImageCaption}
                                    </figcaption>
                                )}
                            </figure>
                        )}

                        <div className="article-content" style={{ marginBottom: "4rem" }}>
                            <PostContentRenderer content={post.content} />
                        </div>

                        {post.tagIds && post.tagIds.length > 0 && (
                            <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {post.tagIds.map((tag: string) => (
                                    <Link
                                        key={tag}
                                        href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}`}
                                        style={{
                                            fontSize: "0.85rem",
                                            padding: "0.3rem 0.8rem",
                                            backgroundColor: "var(--bg-tertiary)",
                                            borderRadius: "20px",
                                            color: "var(--text-secondary)",
                                            transition: "all 0.2s"
                                        }}
                                        className="hover:bg-[var(--accent)] hover:text-white"
                                    >
                                        #{tag}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div style={{
                            paddingTop: "2rem",
                            borderTop: "1px solid var(--border)",
                            marginBottom: "4rem"
                        }}>
                            <ShareButtons url={currentUrl} title={post.title} />
                        </div>
                    </article >

                    {
                        post.author && (
                            <AuthorBio author={{
                                id: post.author.id,
                                name: authorDisplayName,
                                bio: post.author.bio || "Contributing writer at 95News.",
                                avatar: post.author.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorDisplayName)}&background=random`
                            }} />
                        )
                    }

                    < Newsletter />

                    <CommentSection postId={post.id} />

                    {
                        post.categoryIds && post.categoryIds.length > 0 && (
                            <RelatedPosts categoryId={post.categoryIds[0]} currentPostId={post.id} />
                        )
                    }
                </div >
            </div >
        </>
    );
}
