import React from 'react';
import Link from 'next/link';

interface AlsoReadPost {
    slug: string;
    title: string;
}

interface AlsoReadWidgetProps {
    post: AlsoReadPost;
}

const AlsoReadWidget: React.FC<AlsoReadWidgetProps> = ({ post }) => {
    return (
        <div className="my-8 p-6 bg-[var(--bg-tertiary)] border-l-4 border-[var(--accent)] rounded-r-lg">
            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-2 block">
                Also Read
            </span>
            <Link
                href={`/${post.slug}`}
                className="text-xl font-bold hover:text-[var(--accent)] transition-colors leading-tight block"
            >
                {post.title}
            </Link>
        </div>
    );
};

export default AlsoReadWidget;
