import React from 'react';

export const metadata = {
    title: 'FAQ - 95News',
    description: 'Frequently Asked Questions about 95News.'
};

export default function FAQPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "3rem", textAlign: "center" }}>
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Frequency Asked Questions</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Got questions? We've got answers.</p>
                </header>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <FAQItem
                        question="How do I subscribe to the newsletter?"
                        answer="You can subscribe to our newsletter by entering your email address in the footer section of any page on our website. You'll receive daily updates with the latest headlines."
                    />
                    <FAQItem
                        question="Can I contribute articles to 95News?"
                        answer="Yes, we are always looking for fresh voices. Please visit our Careers page or Contact us with a pitch. We review submissions on a rolling basis."
                    />
                    <FAQItem
                        question="Is 95News free to read?"
                        answer="Yes, the majority of our content is free to access. We believe in open access to reliable information. We may introduce premium features in the future for specialized content."
                    />
                    <FAQItem
                        question="How can I report a correction?"
                        answer="We take accuracy effectively. If you spot an error, please use our Contact form and select 'Report a Correction' from the subject dropdown."
                    />
                    <FAQItem
                        question="Do you have a mobile app?"
                        answer="Currently, we do not have a dedicated mobile app, but our website is fully responsive and optimized for mobile devices."
                    />
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{question}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{answer}</p>
        </div>
    );
}
