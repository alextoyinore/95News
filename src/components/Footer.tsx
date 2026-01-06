import Link from "next/link";

export default function Footer() {
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
                        <li><Link href="/world">World</Link></li>
                        <li><Link href="/politics">Politics</Link></li>
                        <li><Link href="/tech">Tech</Link></li>
                        <li><Link href="/lifestyle">Lifestyle</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: "1.5rem" }}>Company</h4>
                    <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                        <li><Link href="/careers">Careers</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 style={{ marginBottom: "1.5rem" }}>Newsletter</h4>
                    <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Get the latest updates directly in your inbox.
                    </p>
                    <form style={{ display: "flex", gap: "0.5rem" }}>
                        <input type="email" placeholder="Email address" style={{
                            padding: "0.8rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            flex: 1,
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)"
                        }} />
                        <button className="btn btn-primary" type="submit">Join</button>
                    </form>
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
