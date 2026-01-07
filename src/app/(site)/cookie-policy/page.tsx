import React from 'react';

export const metadata = {
    title: 'Cookie Policy - 95News',
    description: 'Cookie Policy for 95News.'
};

export default function CookiePolicyPage() {
    return (
        <div className="container site-content">
            <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "5rem" }}>
                <header style={{ marginBottom: "3rem" }}>
                    <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1rem" }}>Cookie Policy</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Last updated: {new Date().toLocaleDateString()}</p>
                </header>

                <div className="glass" style={{ padding: "3rem", borderRadius: "var(--radius-lg)" }}>
                    <div className="article-content" style={{ marginTop: 0 }}>
                        <p>This is the Cookie Policy for 95News, accessible from 95news.com</p>

                        <h3>What Are Cookies</h3>
                        <p>As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.</p>

                        <h3>How We Use Cookies</h3>
                        <p>We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.</p>

                        <h3>Disabling Cookies</h3>
                        <p>You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site.</p>

                        <h3>The Cookies We Set</h3>
                        <ul>
                            <li>
                                <strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.
                            </li>
                            <li>
                                <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                            </li>
                            <li>
                                <strong>Forms related cookies:</strong> When you submit data to through a form such as those found on contact pages or comment forms cookies may be set to remember your user details for future correspondence.
                            </li>
                        </ul>

                        <h3>Third Party Cookies</h3>
                        <p>In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.</p>
                        <ul>
                            <li>
                                This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience.
                            </li>
                        </ul>

                        <h3>More Information</h3>
                        <p>Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
