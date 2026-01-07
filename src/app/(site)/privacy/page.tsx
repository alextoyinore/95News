import React from 'react';

export const metadata = {
    title: 'Privacy Policy - 95News',
    description: 'Privacy Policy for 95News.'
};

export default function PrivacyPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Privacy Policy</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)" }}>
                    <div className="article-content" style={{ marginTop: 0 }}>
                        <p>At 95News, accessible from 95news.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by 95News and how we use it.</p>

                        <h3>Log Files</h3>
                        <p>95News follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>

                        <h3>Cookies and Web Beacons</h3>
                        <p>Like any other website, 95News uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

                        <h3>Google DoubleClick DART Cookie</h3>
                        <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet.</p>

                        <h3>Privacy Policies</h3>
                        <p>You may consult this list to find the Privacy Policy for each of the advertising partners of 95News.</p>

                        <h3>Third Party Privacy Policies</h3>
                        <p>95News's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>

                        <h3>Children's Information</h3>
                        <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>

                        <h3>Consent</h3>
                        <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
