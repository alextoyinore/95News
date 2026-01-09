export default function SubscriptionPage() {
    return (
        <div className="container site-content" style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            paddingBottom: "4rem"
        }}>
            <h1 style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: "800",
                marginBottom: "1rem",
                background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
            }}>
                Premium Coming Soon
            </h1>
            <p style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                maxWidth: "600px",
                marginBottom: "3rem",
                lineHeight: "1.6"
            }}>
                We are building an exclusive experience just for you. Get ready for deep-dives, industry reports, and ad-free browsing.
            </p>

            <div style={{
                padding: "2rem",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                maxWidth: "500px",
                width: "100%"
            }}>
                <h3 style={{ marginBottom: "1rem" }}>Get Notified</h3>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        style={{
                            flex: 1,
                            padding: "0.8rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--bg-primary)"
                        }}
                    />
                    <button className="btn btn-primary">Notify Me</button>
                </div>
            </div>
        </div>
    )
}
