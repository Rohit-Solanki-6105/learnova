"use client";

import React, { useEffect, useRef, useState } from "react";

interface EditorProps {
    is_editting: boolean;
    file: any;
    setFile: (data: any) => void;
}

const DEFAULT_DATA = {
    time: new Date().getTime(),
    blocks: [
        {
            id: "intro-header",
            type: "header",
            data: {
                text: "Professional Rich Text Editor 🚀",
                level: 2,
            },
        },
        {
            id: "intro-paragraph",
            type: "paragraph",
            data: {
                text: "Start creating your beautifully formatted content here! You can use the TAB key to explore the block menu or type markdown shortcuts (e.g., ## for headers) directly.",
            },
        },
        {
            id: "intro-list",
            type: "list",
            data: {
                style: "unordered",
                items: [
                    "Interactive blocks like Tables and Embeds",
                    "Images with caption support",
                    "Nested lists for complex structures",
                    "Rich text inline formatting"
                ]
            }
        },
        {
            id: "intro-warning",
            type: "warning",
            data: {
                title: "Pro Tip",
                message: "Don't forget to save your progress! EditorJS will automatically emit changes."
            }
        }
    ],
    version: "2.30.0"
};

const Editor = ({ is_editting, file, setFile }: EditorProps) => {
    const editorRef = useRef<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const initEditor = async () => {
            // Dynamic imports to prevent SSR issues with Editor.js touching 'window'
            const EditorJS = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const List = (await import("@editorjs/list")).default;
            const NestedList = (await import("@editorjs/nested-list")).default;
            const Warning = (await import("@editorjs/warning")).default;
            const Embed = (await import("@editorjs/embed")).default;
            const Table = (await import("@editorjs/table")).default;
            const ImageTool = (await import("@editorjs/image")).default;
            const Paragraph = (await import("@editorjs/paragraph")).default;

            if (!editorRef.current) {
                const editor = new EditorJS({
                    holder: "editorjs-container",
                    readOnly: !is_editting,
                    data: file?.blocks && file.blocks.length > 0 ? file : DEFAULT_DATA,
                    tools: {
                        header: Header,
                        paragraph: Paragraph,
                        list: List,
                        nestedList: NestedList,
                        warning: Warning,
                        embed: {
                            class: Embed,
                            config: {
                                services: {
                                    youtube: true,
                                    twitter: true,
                                    instagram: true,
                                    codepen: true,
                                    vimeo: true,
                                    imgur: true
                                }
                            }
                        },
                        table: Table,
                        image: {
                            class: ImageTool,
                            config: {
                                uploader: {
                                    // Bypass backend by resolving promises directly
                                    uploadByFile(file: File) {
                                        return Promise.resolve({
                                            success: 1,
                                            file: {
                                                url: URL.createObjectURL(file),
                                            }
                                        });
                                    },
                                    uploadByUrl(url: string) {
                                        return Promise.resolve({
                                            success: 1,
                                            file: { url }
                                        });
                                    }
                                }
                            }
                        }
                    },
                    onChange: async () => {
                        if (editorRef.current) {
                            try {
                                const data = await editorRef.current.save();
                                setFile(data);
                            } catch (err) {
                                console.error("Editor saving failed", err);
                            }
                        }
                    },
                    placeholder: 'Let your imagination run wild...',
                    autofocus: is_editting,
                });

                editorRef.current = editor;
            }
        };

        initEditor();

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                try {
                    editorRef.current.destroy();
                    editorRef.current = null;
                } catch (e) {
                    console.error(e);
                }
            }
        };
    }, [isMounted]); // Init exactly once on client mount

    // Watch for is_editting changes
    useEffect(() => {
        if (editorRef.current && editorRef.current.readOnly && typeof editorRef.current.readOnly.toggle === 'function') {
            editorRef.current.readOnly.toggle(!is_editting);
        }
    }, [is_editting]);

    const handleClear = async () => {
        if (editorRef.current) {
            await editorRef.current.clear();
            setFile({ time: new Date().getTime(), blocks: [] });
        }
    };

    const handleResetToDefault = () => {
        if (editorRef.current) {
            editorRef.current.render(DEFAULT_DATA);
            setFile(DEFAULT_DATA);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 transition-all overflow-hidden flex flex-col group/editor">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {is_editting ? (
                            <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Editing Mode</>
                        ) : (
                            <><span className="w-2 h-2 rounded-full bg-amber-500" /> View Only</>
                        )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {is_editting ? "You can modify and restructure the content below." : "Preview of the lesson materials."}
                    </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/editor:opacity-100 transition-opacity">
                    {is_editting && (
                        <>
                            <button
                                type="button"
                                onClick={handleResetToDefault}
                                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm border border-indigo-200"
                            >
                                Load Template
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm border border-red-200 focus:ring-2 focus:ring-red-500/30"
                            >
                                Clear Slate
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div className={`p-6 md:p-10 flex-1 bg-white dark:bg-slate-950 ${is_editting ? 'cursor-text' : 'cursor-default'}`}>
                <div id="editorjs-container" className="prose prose-indigo dark:prose-invert max-w-none min-h-100 prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl" />
            </div>
        </div>
    );
};

export default Editor;
