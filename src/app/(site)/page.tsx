import Link from "next/link";
import HeroSlider from "@/components/widgets/HeroSlider";
import CategoryHighlight from "@/components/widgets/CategoryHighlight";
import PostGrid from "@/components/widgets/PostGrid";
import SocialSidebar from "@/components/widgets/SocialSidebar";
import Newsletter from "@/components/widgets/Newsletter";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Post, Category, User } from "@/types/firestore";
import { formatDate, getAuthorSlug } from "@/lib/utils";
import { getLayoutSettings } from "@/lib/layoutActions";

async function getCategoryBySlug(slugs: string | string[]) {
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

async function resolvePostsData(postDocs: Post[]) {
  if (postDocs.length === 0) return [];

  const authorIds = Array.from(new Set(postDocs.map(p => p.authorId)));
  const authors: { [key: string]: { name: string, slug: string } } = {};

  for (const id of authorIds) {
    const userSnap = await getDocs(query(collection(db, "users"), where("id", "==", id), limit(1)));
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data() as User;
      authors[id] = {
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
    image: post.featuredImageUrl
  }));
}

async function fetchSectionPosts(slugs: string | string[], count: number = 4) {
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

async function fetchLatestPosts(count: number = 4) {
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return await resolvePostsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
}

export default async function Home() {
  // 0. Fetch Layout Settings
  const layoutSettings = await getLayoutSettings();
  const getWidgetActive = (id: string) => {
    if (!layoutSettings) return true; // Default to active if no settings
    return layoutSettings.widgets.find(w => w.id === id)?.active ?? true;
  };

  // 1. Fetch Hero Posts (Featured)
  let featuredTagId = null;
  const tagQuery = query(collection(db, "tags"), where("slug", "==", "featured"), limit(1));
  const tagSnap = await getDocs(tagQuery);
  if (!tagSnap.empty) {
    featuredTagId = tagSnap.docs[0].id;
  }

  let heroPosts: any[] = [];

  if (featuredTagId) {
    const heroQuery = query(
      collection(db, "posts"),
      where("tagIds", "array-contains", featuredTagId),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const heroSnap = await getDocs(heroQuery);
    heroPosts = await resolvePostsData(heroSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
  }

  // 2. Fetch specific sections
  const latestNewsPosts = await fetchLatestPosts(4);
  const techPosts = await fetchSectionPosts(["technology", "tech"], 4);
  const businessPosts = await fetchSectionPosts("business", 4);
  const politicsPosts = await fetchSectionPosts(["politics", "political"], 4);
  const worldPosts = await fetchSectionPosts("world", 4);
  const sportsPosts = await fetchSectionPosts("sports", 4);

  // De-duplicate Editorial & Opinion
  const editorialPostsRaw = await fetchSectionPosts("editorial", 4);
  const opinionPostsRaw = await fetchSectionPosts("opinion", 4);
  const combinedEditorial = [...editorialPostsRaw, ...opinionPostsRaw];
  const uniqueEditorial = Array.from(new Map(combinedEditorial.map(item => [item.id, item])).values()).slice(0, 8);

  const lifestylePosts = await fetchSectionPosts(["lifestyle", "lifestyle-and-culture"], 4);

  // 3. Most Read
  let popularPosts: any[] = [];
  if (getWidgetActive('w3')) {
    const popularQuery = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("views", "desc"),
      limit(5)
    );

    // Strictly fetch by views. If index is missing, this will throw, asking dev to create index.
    const popularSnap = await getDocs(popularQuery);
    popularPosts = popularSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  }

  return (
    <div className="container site-content" style={{ paddingBottom: "4rem" }}>
      {heroPosts.length > 0 && <HeroSlider posts={heroPosts} />}

      <div className="home-grid" style={{
        display: "grid",
        gap: "3rem",
        marginTop: heroPosts.length === 0 ? "2rem" : "0"
      }}>
        <main>
          <CategoryHighlight title="News" posts={latestNewsPosts} viewAllLink="/latest" />
          <div style={{ margin: "3rem 0" }}>
            <CategoryHighlight title="Technology" posts={techPosts} />
          </div>
          {businessPosts.length > 0 && <CategoryHighlight title="Business" posts={businessPosts} />}

          {politicsPosts.length > 0 && (
            <div style={{ margin: "4rem 0" }}>
              <CategoryHighlight title="Politics" posts={politicsPosts} />
            </div>
          )}

          {getWidgetActive('w2') && (
            <div style={{ margin: "4rem 0" }}>
              <Newsletter />
            </div>
          )}

          <CategoryHighlight title="World" posts={worldPosts} />

        </main>

        <aside className="home-sidebar">
          {getWidgetActive('w1') && <SocialSidebar />}

          {getWidgetActive('w3') && popularPosts.length > 0 && (
            <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "3rem" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.3rem", display: "inline-block" }}>
                Most Read
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {popularPosts.map((post, i) => (
                  <div key={post.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent)", opacity: 0.5 }}>0{i + 1}</span>
                    <Link href={`/${post.slug}`} style={{ fontSize: "0.95rem", fontWeight: "600", lineHeight: "1.4" }}>
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: "var(--accent)",
            padding: "2rem",
            borderRadius: "var(--radius-md)",
            color: "white",
            textAlign: "center"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>95News Premium</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "1.5rem" }}>
              Join 95News Premium for exclusive industry reports and deep-dives.
            </p>
            <Link href="/subscription">
              <button className="btn" style={{ backgroundColor: "white", color: "black", width: "100%", borderRadius: "var(--radius-sm)" }}>
                Sign Up
              </button>
            </Link>
          </div>
        </aside>
      </div>

      {uniqueEditorial.length > 0 && (
        <div style={{ margin: "4rem 0" }}>
          <PostGrid title="Editorial & Opinion" posts={uniqueEditorial} columns={4} viewAllLink="/category/opinion" />
        </div>
      )}

      {lifestylePosts.length > 0 && (
        <PostGrid title="Lifestyle & Culture" posts={lifestylePosts} columns={4} viewAllLink="/category/lifestyle" />
      )}

      {sportsPosts.length > 0 && (
        <div style={{ margin: "4rem 0" }}>
          <PostGrid title="Sports" posts={sportsPosts} columns={4} viewAllLink="/category/sports" />
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-grid {
          grid-template-columns: 3fr 1fr;
        }
        .home-sidebar {
          position: sticky;
          top: 6rem;
          align-self: start;
        }
        @media (max-width: 1024px) {
          .home-grid {
            grid-template-columns: 1fr;
          }
          .home-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
          }
          .home-grid main {
            order: 1;
          }
          .home-sidebar {
            order: 2;
          }
        }
        @media (max-width: 640px) {
          .home-sidebar {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </div>
  );
}
