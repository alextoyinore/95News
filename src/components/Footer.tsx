import Link from "next/link";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/firestore";

async function getFooterCategories() {
    try {
        const q = query(collection(db, "categories"), limit(5));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (e) {
        console.error("Error fetching footer categories:", e);
        return [];
    }
}

export default async function Footer() {
    const categories = await getFooterCategories();

    return (
        <footer style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "4rem 0",
            marginTop: "4rem",
            borderTop: "1px solid var(--border)"
        }}>
            <div className="container" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "3rem"
            }}>
                <div>
                    <Link href="/" style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        fontFamily: "var(--font-heading)",
                        letterSpacing: "-1px"
                    }}>
                        95<span style={{ color: "var(--accent)" }}>News</span>
                    </Link>
                    <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
                        Delivering the stories that matter, every single day.
                    </p>
                </div>
                <div>
                    <h4 style={{ marginBottom: "1.5rem" }}>Categories</h4>
                    <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <li key={cat.id}>
                                    <Link href={`/category/${cat.slug}`} className="hover-accent">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <>
                                <li><Link href="/category/world">World</Link></li>
                                <li><Link href="/category/politics">Politics</Link></li>
                                <li><Link href="/category/tech">Tech</Link></li>
                                <li><Link href="/category/lifestyle">Lifestyle</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: "1.5rem" }}>Company</h4>
                    <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
                        <li><Link href="/about" className="hover-accent">About Us</Link></li>
                        <li><Link href="/contact" className="hover-accent">Contact</Link></li>
                        <li><Link href="/careers" className="hover-accent">Careers</Link></li>
                        <li><Link href="/faq" className="hover-accent">FAQ</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: "1.5rem" }}>Legal</h4>
                    <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
                        <li><Link href="/privacy" className="hover-accent">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover-accent">Terms of Service</Link></li>
                        <li><Link href="/cookie-policy" className="hover-accent">Cookie Policy</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container" style={{
                marginTop: "4rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--border)",
                textAlign: "center",
                fontSize: "0.9rem",
                color: "var(--text-muted)"
            }}>
                &copy; {new Date().getFullYear()} 95News. All rights reserved.
            </div>
        </footer>
    );
}
