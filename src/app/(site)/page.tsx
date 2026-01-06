import Link from "next/link";
import HeroSlider from "@/components/widgets/HeroSlider";
import CategoryHighlight from "@/components/widgets/CategoryHighlight";
import PostGrid from "@/components/widgets/PostGrid";
import SocialSidebar from "@/components/widgets/SocialSidebar";
import Newsletter from "@/components/widgets/Newsletter";

const heroPosts = [
  {
    id: "h1",
    title: "The Silent Revolution: How Private Space Agencies are Overtaking National Programs",
    excerpt: "From reusable rockets to orbital hotels, the final frontier is becoming a commercial playground faster than anyone anticipated.",
    category: "Tech",
    author: "James Miller",
    date: "Dec 20, 2025",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "h2",
    title: "Quantum Computing: Breaking the Unbreakable Cryptography",
    excerpt: "Researchers achieve new milestone in quantum supremacy, threatening the very foundations of digital security.",
    category: "Tech",
    author: "Dr. Elena Vance",
    date: "Dec 18, 2025",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "h3",
    title: "The Architecture of Dreams: Designing the Cities of 2050",
    excerpt: "Vertical forests, modular transit, and self-healing materials: how tomorrow's architects are solving the urban crisis.",
    category: "Lifestyle",
    author: "Marcello Rossi",
    date: "Dec 15, 2025",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
  }
];

const techPosts = [
  { id: 1, title: "Apple's Secret AR Project Revealed", excerpt: "New leaks from supply chain sources suggest Apple is finalizing a revolutionary interface that completely bypasses traditional screens, utilizing advanced retinal projection technology to overlay digital information seamlessly onto the physical world.", category: "Tech", author: "Sarah Jenkins", date: "Oct 24", image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=800" },
  { id: 2, title: "Next-Gen AI Chips Are Here", excerpt: "Nvidia announces new architecture specifically designed for large language models.", category: "Tech", author: "Mark Techson", date: "Oct 23" },
  { id: 3, title: "Blockchain's Surprising Comeback", excerpt: "Enterprise adoption is driving a new wave of interest in distributed ledgers.", category: "Tech", author: "Jane Chain", date: "Oct 22" },
  { id: 4, title: "Is 6G Already Around the Corner?", excerpt: "Research teams in Finland achieve record-breaking wireless speeds.", category: "Tech", author: "Speedy Gonzales", date: "Oct 21" },
];

const worldPosts = [
  { id: 5, title: "Crisis in the Mediterranean: A New Refugee Policy", excerpt: "EU leaders have gathered in Brussels to discuss a controversial new comprehensive plan for maritime security and migration management across the Mediterranean region, aiming to balance humanitarian obligations with stricter border control measures.", category: "World", author: "Hans Mueller", date: "Oct 24", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" },
  { id: 6, title: "Amazon Rainforest Sees Record Growth", excerpt: "New satellite data shows promising signs of regeneration in key areas.", category: "World", author: "Green Earth", date: "Oct 23", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?auto=format&fit=crop&q=80&w=800" },
  { id: 7, title: "The Changing Face of Asian Markets", excerpt: "Emerging economies are reshaping the global financial landscape.", category: "World", author: "Money Maker", date: "Oct 22" },
  { id: 8, title: "Arctic Passage Opens for Winter Cargo", excerpt: "Reduced ice levels allow for unprecedented winter shipping routes.", category: "World", author: "Ice Man", date: "Oct 21" },
];

const lifestylePosts = [
  { id: 9, title: "Mindfulness in the Digital Age", excerpt: "How to stay centered when your phone is constantly demanding attention.", category: "Lifestyle", author: "Anna Light", date: "Oct 24", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800" },
  { id: 10, title: "The Return of Vinyl: Why We Crave Physicality", category: "Lifestyle", author: "David Bowie", date: "Oct 23", image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800" },
  { id: 11, title: "Fine Dining Goes Casual", category: "Lifestyle", author: "Gordon R", date: "Oct 22", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
  { id: 12, title: "The Art of Minimalist Living", category: "Lifestyle", author: "Marie K", date: "Oct 21", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800" },
];

export default function Home() {
  return (
    <div className="container" style={{ padding: "1rem 1.5rem 4rem" }}>
      {/* Hero Slider */}
      <HeroSlider posts={heroPosts} />

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "3rem" }}>
        {/* Main Feed */}
        <main>
          <CategoryHighlight title="Tech" posts={techPosts} />

          <div style={{ margin: "4rem 0" }}>
            <Newsletter />
          </div>

          <CategoryHighlight title="World" posts={worldPosts} />
        </main>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "2rem", height: "fit-content" }}>
          <SocialSidebar />

          <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)", marginBottom: "3rem" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--accent)", paddingBottom: "0.3rem", display: "inline-block" }}>
              Most Read
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent)", opacity: 0.5 }}>0{i}</span>
                  <Link href={`/posts/popular-${i}`} style={{ fontSize: "0.95rem", fontWeight: "600", lineHeight: "1.4" }}>
                    {i === 1 ? "The Hidden Costs of Free Streaming Services" :
                      i === 2 ? "Why Everyone is Moving to Decentralized Social Media" :
                        i === 3 ? "Understanding the Paradox of Modern Productivity" :
                          i === 4 ? "A Guide to the Best Hidden Coffee Shops in Kyoto" :
                            "The Surprising Health Benefits of Cold Plunging"}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: "var(--accent)",
            padding: "2rem",
            borderRadius: "var(--radius-md)",
            color: "white",
            textAlign: "center"
          }}>
            <h3 style={{ marginBottom: "1rem" }}>95News Premium</h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.9, marginBottom: "1.5rem" }}>
              Get unlimited access to all stories and exclusive industry reports.
            </p>
            <button className="btn" style={{ backgroundColor: "white", color: "black", width: "100%", borderRadius: "var(--radius-sm)" }}>
              Join Now
            </button>
          </div>
        </aside>
      </div>

      <PostGrid title="Lifestyle & Culture" posts={lifestylePosts} columns={4} />
    </div>
  );
}
