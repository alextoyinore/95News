import React from 'react';

export const metadata = {
    title: 'Terms and Conditions - 95News',
    description: 'Terms and Conditions for using 95News.'
};

export default function TermsPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Terms and Conditions</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)" }}>
                    <div className="article-content" style={{ marginTop: 0 }}>
                        <p>Welcome to 95News!</p>
                        <p>These terms and conditions outline the rules and regulations for the use of 95News's Website, located at 95news.com.</p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use 95News if you do not agree to take all of the terms and conditions stated on this page.</p>

                        <h3>2. Cookies</h3>
                        <p>We employ the use of cookies. By accessing 95News, you agreed to use cookies in agreement with the 95News's Privacy Policy.</p>

                        <h3>3. License</h3>
                        <p>Unless otherwise stated, 95News and/or its licensors own the intellectual property rights for all material on 95News. All intellectual property rights are reserved. You may access this from 95News for your own personal use subjected to restrictions set in these terms and conditions.</p>

                        <h3>4. User Comments</h3>
                        <p>Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. 95News does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of 95News,its agents and/or affiliates.</p>

                        <h3>5. Hyperlinking to our Content</h3>
                        <p>The following organizations may link to our Website without prior written approval: Government agencies; Search engines; News organizations.</p>

                        <h3>6. Content Liability</h3>
                        <p>We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website.</p>

                        <h3>7. Reservation of Rights</h3>
                        <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request.</p>

                        <h3>8. Disclaimer</h3>
                        <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
