export const dynamic = "force-dynamic";
import Link from "next/link";
import HeroSlider from "@/components/widgets/HeroSlider";
import CategoryHighlight from "@/components/widgets/CategoryHighlight";
import PostGrid from "@/components/widgets/PostGrid";
import SocialSidebar from "@/components/widgets/SocialSidebar";
import Newsletter from "@/components/widgets/Newsletter";
import TrendingTags from "@/components/widgets/TrendingTags";
import AuthorSpotlight from "@/components/widgets/AuthorSpotlight";
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
    try {
      const popularQuery = query(
        collection(db, "posts"),
        where("status", "==", "published"),
        orderBy("views", "desc"),
        limit(5)
      );

      // Note: This requires a composite index in Firestore (status: asc, views: desc)
      const popularSnap = await getDocs(popularQuery);
      const rawPopular = popularSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

      if (rawPopular.length === 0) {
        popularPosts = latestNewsPosts.slice(0, 5);
      } else {
        popularPosts = await resolvePostsData(rawPopular);
      }
    } catch (error) {
      console.error("Error fetching popular posts (likely missing index):", error);
      // Fallback: If popular fails (usually due to missing index), show latest as fallback
      popularPosts = latestNewsPosts.slice(0, 5);
    }
  }

  const activeTemplateId = layoutSettings?.activeTemplateId || 'magazine';

  const renderSidebar = () => (
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

      {getWidgetActive('w4') && <TrendingTags />}
      {getWidgetActive('w5') && <AuthorSpotlight />}

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
  );

  const renderMagazineLayout = () => (
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

      {renderSidebar()}
    </div>
  );

  const renderClassicLayout = () => (
    <div className="home-grid classic-layout" style={{
      display: "grid",
      gap: "4rem",
      marginTop: "2rem"
    }}>
      <main>
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>Latest Stories</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {[...heroPosts, ...latestNewsPosts].slice(0, 10).map((post) => (
              <div key={post.id} className="classic-post-item" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                {post.image && (
                  <div style={{ width: "200px", height: "130px", flexShrink: 0 }}>
                    <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
                  </div>
                )}
                <div>
                  <Link href={`/category/${post.categorySlug}`} style={{ color: "var(--accent)", fontSize: "0.80rem", fontWeight: "700", textTransform: "uppercase" }}>{post.category}</Link>
                  <Link href={`/${post.slug}`}>
                    <h3 style={{ fontSize: "1.4rem", margin: "0.5rem 0", lineHeight: "1.2" }}>{post.title}</h3>
                  </Link>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>{post.date} • {post.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {getWidgetActive('w2') && <Newsletter />}
      </main>
      {renderSidebar()}
    </div>
  );

  const renderModernLayout = () => (
    <div className="modern-layout" style={{ marginTop: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2.5rem" }}>
        {[...heroPosts, ...latestNewsPosts].slice(0, 9).map((post) => (
          <div key={post.id} className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: "240px", position: "relative" }}>
              <img src={post.image} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "1rem", left: "1rem" }}>
                <span style={{ backgroundColor: "var(--accent)", color: "white", padding: "0.3rem 0.7rem", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: "700" }}>
                  {post.category}
                </span>
              </div>
            </div>
            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
              <Link href={`/${post.slug}`}>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "1rem", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.title}</h3>
              </Link>
              <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", marginBottom: "1.5rem", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{post.author}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{post.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="home-grid" style={{ display: "grid", gap: "4rem", marginTop: "4rem" }}>
        <div>
          {getWidgetActive('w2') && <Newsletter />}

          <div style={{ marginTop: "4rem" }}>
            <PostGrid title="More from Technology" posts={techPosts} columns={2} viewAllLink="/category/technology" />
          </div>

          {businessPosts.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <PostGrid title="Business News" posts={businessPosts} columns={2} viewAllLink="/category/business" />
            </div>
          )}

          {politicsPosts.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <PostGrid title="Politics & Government" posts={politicsPosts} columns={2} viewAllLink="/category/politics" />
            </div>
          )}

          {worldPosts.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <PostGrid title="Around the World" posts={worldPosts} columns={2} viewAllLink="/category/world" />
            </div>
          )}

          {sportsPosts.length > 0 && (
            <div style={{ marginTop: "4rem" }}>
              <PostGrid title="Sports Highlight" posts={sportsPosts} columns={2} viewAllLink="/category/sports" />
            </div>
          )}
        </div>
        {renderSidebar()}
      </div>
    </div>
  );

  return (
    <div className="container site-content" style={{ paddingBottom: "4rem" }}>
      {activeTemplateId === 'magazine' && heroPosts.length > 0 && <HeroSlider posts={heroPosts} />}

      {activeTemplateId === 'magazine' && renderMagazineLayout()}
      {activeTemplateId === 'classic' && renderClassicLayout()}
      {activeTemplateId === 'modern' && renderModernLayout()}

      {(activeTemplateId === 'magazine' || activeTemplateId === 'classic') && (
        <>
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
        </>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .home-grid {
          grid-template-columns: 3fr 1fr;
        }
        .home-sidebar {
          position: sticky;
          top: 8rem;
          align-self: start;
          height: fit-content;
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
