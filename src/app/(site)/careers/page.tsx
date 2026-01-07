import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Careers - 95News',
    description: 'Join the 95News team and help shape the future of journalism.'
};

export default function CareersPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "4rem", textAlign: "center" }}>
                    <span style={{ color: "var(--accent)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>Join Our Team</span>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", margin: "1rem 0" }}>Careers at 95News</h1>
                    <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto" }}>
                        We are looking for passionate storytellers, developers, and creators to help us build the next generation of digital news.
                    </p>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Editorial</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                            Produce high-quality journalism that impacts millions of readers daily.
                        </p>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Senior Editor (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Tech Reporter (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Multimedia Expert (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Social Media Manager (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-md)" }}>
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Product & Tech</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                            Build the platforms and tools that power effective storytelling.
                        </p>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Product Designer (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                            <li style={{ padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600" }}>Full Stack Engineer (Co-Founder)</span>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Remote</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "3rem", textAlign: "center" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Don't see a perfect fit?</h2>
                    <p style={{ marginBottom: "2rem", color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto 2rem" }}>
                        We are always on the lookout for exceptional talent. If you think you can make a difference at 95News, we want to hear from you.
                    </p>
                    <Link href="/contact" className="btn btn-primary" style={{ display: "inline-block" }}>
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
}
