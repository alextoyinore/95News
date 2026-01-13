"use client";

import React, { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { Copy, Check } from 'lucide-react';

interface Block {
    type: string;
    data: any;
}

interface PostContentRendererProps {
    content: string | any; // JSON string or object from EditorJS
}

const CodeBlock = ({ code, language = 'javascript' }: { code: string, language?: string }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    const handleCopy = async () => {
        // Create a temporary textarea to decode HTML entities
        const textarea = document.createElement('textarea');
        textarea.innerHTML = code;
        const decodedCode = textarea.value;

        try {
            await navigator.clipboard.writeText(decodedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="relative group my-8 bg-[#2d2d2d] rounded-lg overflow-hidden border border-[#404040]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#404040]">
                <span className="text-xs text-gray-400 font-mono lowercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-white/10"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check size={14} />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="!m-0 !p-6 !bg-transparent overflow-x-auto">
                <code
                    className={`language-${language}`}
                    dangerouslySetInnerHTML={{ __html: code }}
                />
            </pre>
        </div>
    );
};

const PostContentRenderer: React.FC<PostContentRendererProps> = ({ content }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

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
                            <CodeBlock
                                key={index}
                                code={block.data.code}
                                language="javascript"
                            />
                        );

                    case 'delimiter':
                        return <hr key={index} style={{ margin: '3rem 0', border: 'none', borderTop: '2px solid var(--border)' }} />;

                    case 'embed':
                        const aspectRatio = block.data.height && block.data.width
                            ? (block.data.height / block.data.width) * 100
                            : 56.25; // Default 16:9

                        return (
                            <figure key={index} className="embed-wrapper">
                                <div className="embed-responsive" style={{ paddingBottom: `${aspectRatio}%` }}>
                                    <iframe
                                        src={block.data.embed}
                                        title={block.data.caption || "Embed content"}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                            </figure>
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
