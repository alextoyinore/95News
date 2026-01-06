"use client";

import React, { useEffect, useRef } from 'react';

// Editor component
interface EditorProps {
    data?: any;
    onChange?: (data: any) => void;
    holder: string;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, holder }) => {
    const editorInstance = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const initEditor = async () => {
            if (!containerRef.current) return;

            try {
                // Dynamically import tools and EditorJS
                const [
                    EditorJS,
                    Header,
                    List,
                    Image,
                    Quote,
                    Table,
                    Embed,
                    Marker,
                    InlineCode,
                    Delimiter,
                    Code,
                    Warning,
                    Chart
                ] = await Promise.all([
                    import('@editorjs/editorjs').then(m => m.default),
                    import('@editorjs/header').then(m => m.default),
                    import('@editorjs/list').then(m => m.default),
                    import('@editorjs/image').then(m => m.default),
                    import('@editorjs/quote').then(m => m.default),
                    import('@editorjs/table').then(m => m.default),
                    import('@editorjs/embed').then(m => m.default),
                    import('@editorjs/marker').then(m => m.default),
                    import('@editorjs/inline-code').then(m => m.default),
                    import('@editorjs/delimiter').then(m => m.default),
                    import('@editorjs/code').then(m => m.default),
                    import('@editorjs/warning').then(m => m.default),
                    import('./editor-tools/ChartTool').then(m => m.default),
                ]);

                if (!isMounted) return;

                // Clean up any existing instance first
                if (editorInstance.current) {
                    await editorInstance.current.isReady;
                    await editorInstance.current.destroy();
                    editorInstance.current = null;
                }

                if (!containerRef.current) return;

                const editor = new (EditorJS as any)({
                    holder: containerRef.current,
                    tools: {
                        header: {
                            class: Header,
                            inlineToolbar: true,
                            config: {
                                placeholder: 'Enter a header',
                                levels: [2, 3, 4],
                                defaultLevel: 2
                            }
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                        },
                        image: {
                            class: Image,
                            config: {
                                endpoints: {
                                    byFile: '/api/upload/image',
                                }
                            }
                        },
                        quote: Quote,
                        table: Table,
                        embed: Embed,
                        marker: Marker,
                        inlineCode: InlineCode,
                        delimiter: Delimiter,
                        code: Code,
                        warning: Warning,
                        chart: Chart
                    },
                    data: data,
                    async onChange(api: any) {
                        const content = await api.saver.save();
                        if (onChangeRef.current) {
                            onChangeRef.current(content);
                        }
                    },
                    placeholder: "Let's write an awesome story!"
                });

                await editor.isReady;
                if (isMounted) {
                    editorInstance.current = editor;
                } else {
                    await editor.destroy();
                }
            } catch (error) {
                console.error('Failed to initialize Editor.js:', error);
            }
        };

        initEditor();

        return () => {
            isMounted = false;
            if (editorInstance.current) {
                const instance = editorInstance.current;
                editorInstance.current = null;
                instance.isReady.then(() => instance.destroy()).catch((e: any) => console.error('ERROR editor cleanup', e));
            }
        };
    }, [holder]); // Removed onChange from dependencies

    // Keep onChange ref up to date
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    return (
        <div
            ref={containerRef}
            className="editorjs-container"
            style={{
                width: '100%',
                minHeight: '400px',
                backgroundColor: 'var(--bg-primary)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
            }}
        />
    );
};

export default Editor;
