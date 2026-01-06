"use client";

import React from 'react';

interface Block {
    type: string;
    data: any;
}

interface PostContentRendererProps {
    content: string | any; // JSON string or object from EditorJS
}

const PostContentRenderer: React.FC<PostContentRendererProps> = ({ content }) => {
    if (!content) return null;

    let blocks: Block[] = [];
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        blocks = parsed.blocks || [];
    } catch (e) {
        console.error("Failed to parse post content:", e);
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    return (
        <div className="article-content">
            {blocks.map((block, index) => {
                switch (block.type) {
                    case 'paragraph':
                        return (
                            <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />
                        );

                    case 'header':
                        const Tag = `h${block.data.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
                        return React.createElement(Tag, {
                            key: index,
                            dangerouslySetInnerHTML: { __html: block.data.text }
                        });

                    case 'list':
                        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        return (
                            <ListTag key={index}>
                                {block.data.items.map((item: string, i: number) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ListTag>
                        );

                    case 'image':
                        return (
                            <figure key={index}>
                                <img
                                    src={block.data.file?.url || block.data.url}
                                    alt={block.data.caption || ""}
                                    style={{ width: '100%', borderRadius: 'var(--radius-lg)' }}
                                />
                                {block.data.caption && (
                                    <figcaption>{block.data.caption}</figcaption>
                                )}
                            </figure>
                        );

                    case 'quote':
                        return (
                            <blockquote key={index}>
                                <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                {block.data.caption && <cite>- {block.data.caption}</cite>}
                            </blockquote>
                        );

                    case 'table':
                        return (
                            <div className="table-wrapper" key={index}>
                                <table>
                                    <tbody>
                                        {block.data.content.map((row: string[], i: number) => (
                                            <tr key={i}>
                                                {row.map((cell: string, j: number) => (
                                                    <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );

                    case 'code':
                        return (
                            <pre key={index}>
                                <code className="language-javascript">{block.data.code}</code>
                            </pre>
                        );

                    case 'delimiter':
                        return <hr key={index} style={{ margin: '3rem 0', border: 'none', borderTop: '2px solid var(--border)' }} />;

                    case 'embed':
                        return (
                            <div className="embed-container" key={index}>
                                <iframe
                                    src={block.data.embed}
                                    title={block.data.caption || "Embed content"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                            </div>
                        );

                    case 'warning':
                        return (
                            <div className="warning-block" key={index}>
                                <div className="warning-title">{block.data.title}</div>
                                <div className="warning-message" dangerouslySetInnerHTML={{ __html: block.data.message }} />
                            </div>
                        );

                    default:
                        console.warn(`Unknown block type: ${block.type}`, block);
                        return null;
                }
            })}
        </div>
    );
};

export default PostContentRenderer;
