import React from 'react';

export const metadata = {
    title: 'About Us - 95News',
    description: 'Learn more about 95News, our mission, and the team behind the stories.'
};

export default function AboutPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "4rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1.5rem" }}>About <span style={{ color: "var(--accent)" }}>95News</span></h1>
                    <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                        Delivering unbiased, real-time news to keep you informed in a rapidly changing world.
                    </p>
                </header>

                <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)", marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Our Mission</h2>
                    <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                        At 95News, we believe in the power of information. Our mission is to provide accurate, timely, and comprehensive news coverage across the globe. We strive to empower our readers with the knowledge they need to make informed decisions and understand the complexities of modern society.
                    </p>
                    <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                        We are committed to journalistic integrity, transparency, and the pursuit of truth. Whether it's breaking news, in-depth analysis, or cultural features, strictly factual reporting is at the heart of everything we do.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "4rem" }}>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                        <h3 style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }}>5M+</h3>
                        <p style={{ fontWeight: "600" }}>Monthly Readers</p>
                    </div>
                    <div className="glass" style={{ padding: "2rem", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                        <h3 style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "0.5rem" }}>50+</h3>
                        <p style={{ fontWeight: "600" }}>Global Reporters</p>
                    </div>
                </div>

                <h2 style={{ fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>Our Values</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
                    <div style={{ padding: "2rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", fontSize: "1.5rem" }}>✨</div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Integrity</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>We adhere to the highest standards of journalism ethics.</p>
                    </div>
                    <div style={{ padding: "2rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", fontSize: "1.5rem" }}>🚀</div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Innovation</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>We embrace new technologies to tell stories better.</p>
                    </div>
                    <div style={{ padding: "2rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", fontSize: "1.5rem" }}>🌍</div>
                        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Global Perspective</h3>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>We verify stories from local sources worldwide.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
