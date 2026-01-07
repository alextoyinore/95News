import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata = {
    title: 'Contact Us - 95News',
    description: 'Get in touch with the 95News team.'
};

export default function ContactPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "4rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "1rem" }}>Contact Us</h1>
                    <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>
                        Have a story tip, question, or feedback? We'd love to hear from you.
                    </p>
                </header>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: "1.8rem", marginBottom: "2rem" }}>Get in Touch</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            <div style={{ display: "flex", gap: "1.5rem" }}>
                                <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Mail size={24} color="var(--accent)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Email Us</h3>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.3rem" }}>General Inquiries</p>
                                    <a href="mailto:hello@95news.com" style={{ fontWeight: "600", color: "var(--text-primary)" }}>hello@95news.com.ng</a>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.5rem" }}>
                                <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Phone size={24} color="var(--accent)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Call Us</h3>
                                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.3rem" }}>Mon-Fri from 9am to 6pm</p>
                                    <a href="tel:++2348060177914" style={{ fontWeight: "600", color: "var(--text-primary)" }}>(+234) 806 017 77914</a>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1.5rem" }}>
                                <div style={{ width: "50px", height: "50px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <MapPin size={24} color="var(--accent)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Visit Us</h3>
                                    <p style={{ color: "var(--text-secondary)" }}>
                                        100283<br />
                                        Lagos, Nigeria
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass" style={{ padding: "2.5rem", borderRadius: "var(--radius-lg)" }}>
                        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>Name</label>
                                <input type="text" placeholder="Your name" style={{ width: "100%", padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>Email</label>
                                <input type="email" placeholder="you@example.com" style={{ width: "100%", padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>Subject</label>
                                <select style={{ width: "100%", padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
                                    <option>General Inquiry</option>
                                    <option>Editorial Feedback</option>
                                    <option>Advertising</option>
                                    <option>Report a Correction</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "600" }}>Message</label>
                                <textarea rows={5} placeholder="How can we help?" style={{ width: "100%", padding: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", backgroundColor: "var(--bg-primary)" }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
