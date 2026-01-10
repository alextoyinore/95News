import { db } from "./firebase";
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc, getCountFromServer } from "firebase/firestore";
import { Post, Category, User, Page } from "@/types/firestore";
import { formatDate, getAuthorSlug } from "@/lib/utils";

export async function getCategoryBySlug(slugs: string | string[]) {
    const slugList = Array.isArray(slugs) ? slugs : [slugs];
    for (const slug of slugList) {
        const q = query(collection(db, "categories"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
            return { id: snap.docs[0].id, ...snap.docs[0].data() } as Category;
        }
    }
    return null;
}

export async function resolvePostsData(postDocs: Post[]) {
    if (postDocs.length === 0) return [];

    const authorIds = Array.from(new Set(postDocs.map(p => p.authorId)));
    const authors: { [key: string]: { name: string, slug: string, id: string } } = {};

    for (const id of authorIds) {
        const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", id), limit(1)));
        if (!userSnap.empty) {
            const userData = userSnap.docs[0].data() as User;
            authors[id] = {
                id: userData.id,
                name: userData.displayName || userData.email || "95News",
                slug: getAuthorSlug(userData)
            };
        }
    }

    const catSnap = await getDocs(collection(db, "categories"));
    const categoriesMap: { [key: string]: { name: string, slug: string } } = {};
    catSnap.forEach(doc => {
        const data = doc.data() as Category;
        categoriesMap[doc.id] = { name: data.name, slug: data.slug };
    });

    return postDocs.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || "",
        category: categoriesMap[post.categoryIds?.[0] || ""]?.name || "News",
        categorySlug: categoriesMap[post.categoryIds?.[0] || ""]?.slug || "news",
        author: authors[post.authorId]?.name || "95News",
        authorId: post.authorId,
        authorSlug: authors[post.authorId]?.slug || "95news-author",
        date: formatDate(post.createdAt),
        image: post.featuredImageUrl,
        views: post.views || 0
    }));
}

export async function fetchSectionPosts(slugs: string | string[], count: number = 4) {
    const cat = await getCategoryBySlug(slugs);
    if (!cat) return [];

    const q = query(
        collection(db, "posts"),
        where("categoryIds", "array-contains", cat.id),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(count)
    );
    const snap = await getDocs(q);
    return await resolvePostsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
}

export async function fetchLatestPosts(count: number = 4) {
    const q = query(
        collection(db, "posts"),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(count)
    );
    const snap = await getDocs(q);
    return await resolvePostsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
}

export async function fetchMostReadPosts(count: number = 5) {
    try {
        // First, get all published posts
        const q = query(
            collection(db, "posts"),
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
            limit(50) // Get more posts to ensure we have enough with views
        );
        const snap = await getDocs(q);
        const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

        // Get view counts for each post from the views subcollection
        const postsWithViews = await Promise.all(
            posts.map(async (post) => {
                const viewsSnapshot = await getCountFromServer(collection(db, 'posts', post.id, 'views'));
                const viewCount = viewsSnapshot.data().count;
                return { post, viewCount };
            })
        );

        // Sort by view count and take the top posts
        const sortedPosts = postsWithViews
            .filter(item => item.viewCount > 0) // Only include posts with views
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, count)
            .map(item => ({
                ...item.post,
                views: item.viewCount
            }));

        // If we don't have enough posts with views, fall back to latest posts
        if (sortedPosts.length === 0) {
            console.log("No posts with views found, using latest posts as fallback");
            return await fetchLatestPosts(count);
        }

        return await resolvePostsData(sortedPosts);
    } catch (error) {
        console.error("Error fetching most read posts:", error);
        return await fetchLatestPosts(count);
    }
}


export async function fetchPostsByTag(tagSlug: string, count: number = 5) {
    let tagId = null;
    const tagQuery = query(collection(db, "tags"), where("slug", "==", tagSlug), limit(1));
    const tagSnap = await getDocs(tagQuery);
    if (!tagSnap.empty) {
        tagId = tagSnap.docs[0].id;
    }

    if (!tagId) return [];

    const q = query(
        collection(db, "posts"),
        where("tagIds", "array-contains", tagId),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(count)
    );

    const snap = await getDocs(q);
    return await resolvePostsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
}

export async function getPageBySlug(slug: string) {
    const q = query(collection(db, "pages"), where("slug", "==", slug), where("status", "==", "published"), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Page;
}

export async function getPageById(id: string) {
    const docRef = doc(db, "pages", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Page;
}
