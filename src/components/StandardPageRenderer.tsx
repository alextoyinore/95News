import React from 'react';
import PostContentRenderer from "@/components/PostContentRenderer";
import Breadcrumbs from "@/components/Breadcrumbs";

interface StandardPageRendererProps {
    page: {
        title: string;
        content?: string;
        showTitle?: boolean;
    };
}

export default function StandardPageRenderer({ page }: StandardPageRendererProps) {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: page.title }
    ];

    return (
        <div className="container site-content" style={{ paddingBottom: "5rem" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Breadcrumbs items={breadcrumbItems} />

                <article style={{ marginTop: "2rem" }}>
                    {page.showTitle !== false && (
                        <h1 style={{
                            fontSize: "clamp(2.5rem, 6vw, 4rem)",
                            fontWeight: "800",
                            lineHeight: "1.1",
                            marginBottom: "3rem"
                        }}>
                            {page.title}
                        </h1>
                    )}

                    <div className="article-content">
                        <PostContentRenderer content={page.content} />
                    </div>
                </article>
            </div>
        </div>
    );
}
