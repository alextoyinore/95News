import Link from "next/link";
import HeroSlider from "@/components/widgets/HeroSlider";
import CategoryHighlight from "@/components/widgets/CategoryHighlight";
import PostGrid from "@/components/widgets/PostGrid";
import SocialSidebar from "@/components/widgets/SocialSidebar";
import Newsletter from "@/components/widgets/Newsletter";
import TrendingTags from "@/components/widgets/TrendingTags";
import AuthorSpotlight from "@/components/widgets/AuthorSpotlight";
import { fetchSectionPosts, fetchLatestPosts, fetchPostsByTag } from "@/lib/cmsActions";
import { Page, MagazineBlock } from "@/types/firestore";
import { LayoutSettings } from "@/lib/layoutActions";

interface MagazinePageRendererProps {
    page: Page;
    layoutSettings: LayoutSettings | null;
}

export default async function MagazinePageRenderer({ page, layoutSettings }: MagazinePageRendererProps) {
    const blocks = page.blocks || [];
    const activeTemplateId = page.layoutType === 'magazine' ? (page.builderEnabled ? 'magazine' : 'magazine') : 'magazine';
    // ^ We can refine this to allow template selection per page later

    const getWidgetActive = (id: string) => {
        if (!layoutSettings) return true;
        return layoutSettings.widgets.find(w => w.id === id)?.active ?? true;
    };

    // Helper to render a single block
    const renderBlock = async (block: MagazineBlock) => {
        switch (block.type) {
            case 'hero-slider':
                const heroPosts = await fetchPostsByTag(block.config?.tagSlug || 'featured', block.config?.limit || 5);
                return <div key={block.id} style={{ marginBottom: "4rem" }}><HeroSlider posts={heroPosts} /></div>;

            case 'category-highlight':
                const highlightPosts = await fetchSectionPosts(block.config?.categorySlug, block.config?.limit || 4);
                return <div key={block.id} style={{ marginBottom: "4rem" }}><CategoryHighlight title={block.config?.title || "Latest"} posts={highlightPosts} viewAllLink={block.config?.viewAllLink} /></div>;

            case 'post-grid':
                const gridPosts = await fetchSectionPosts(block.config?.categorySlug, block.config?.limit || 4);
                return <div key={block.id} style={{ marginBottom: "4rem" }}><PostGrid title={block.config?.title} posts={gridPosts} columns={block.config?.columns || 2} viewAllLink={block.config?.viewAllLink} /></div>;

            case 'newsletter':
                return <div key={block.id} style={{ marginBottom: "4rem" }}><Newsletter /></div>;

            case 'trending-tags':
                return <div key={block.id} style={{ marginBottom: "4rem" }}><TrendingTags /></div>;

            case 'author-spotlight':
                return <div key={block.id} style={{ marginBottom: "4rem" }}><AuthorSpotlight /></div>;

            case 'social-sidebar':
                return <div key={block.id} style={{ marginBottom: "4rem" }}><SocialSidebar /></div>;

            default:
                return null;
        }
    };

    const renderedBlocks = await Promise.all(blocks.map(block => renderBlock(block)));

    const hasSidebarBlocks = blocks.some(b => ['social-sidebar', 'trending-tags', 'author-spotlight', 'newsletter'].includes(b.type));

    return (
        <div className="container site-content" style={{ paddingBottom: "4rem" }}>
            {hasSidebarBlocks ? (
                <div className="home-grid">
                    <main>
                        {renderedBlocks.filter((_, i) => !['trending-tags', 'author-spotlight', 'social-sidebar'].includes(blocks[i].type))}
                    </main>
                    <aside className="home-sidebar">
                        {renderedBlocks.filter((_, i) => ['trending-tags', 'author-spotlight', 'social-sidebar'].includes(blocks[i].type))}
                    </aside>
                </div>
            ) : (
                renderedBlocks
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .home-grid {
                    display: grid;
                    grid-template-columns: 3fr 1fr;
                    gap: 3rem;
                }
                .home-sidebar {
                    position: sticky;
                    top: 8rem;
                    align-self: start;
                    height: fit-content;
                }
                @media (max-width: 1024px) {
                    .home-grid { grid-template-columns: 1fr; }
                    .home-sidebar { position: static; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 2rem; }
                }
            `}} />
        </div>
    );
}
