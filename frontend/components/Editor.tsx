"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

interface EditorProps {
    is_editting: boolean;
    file: any;
    setFile: (data: any) => void;
}

const DEFAULT_DATA = {
    time: new Date().getTime(),
    blocks: [
        { id: "intro-header",    type: "header",    data: { text: "Professional Rich Text Editor 🚀", level: 2 } },
        { id: "intro-paragraph", type: "paragraph", data: { text: "Start creating your beautifully formatted content here! You can use the TAB key to explore the block menu or type markdown shortcuts (e.g., ## for headers) directly." } },
        { id: "intro-list",      type: "list",      data: { style: "unordered", items: ["Interactive blocks like Tables and Embeds", "Images with caption support", "Nested lists for complex structures", "Rich text inline formatting"] } },
        { id: "intro-warning",   type: "warning",   data: { title: "Pro Tip", message: "Don't forget to save your progress! EditorJS will automatically emit changes." } },
    ],
    version: "2.30.0",
};

// ─── Block-to-HTML renderer ───────────────────────────────────────────────────
function renderBlock(block: any, idx: number): React.ReactNode {
    const { type, data } = block;

    switch (type) {
        case "header": {
            const level = data.level ?? 2;
            const sizeMap: Record<number, string> = { 1: "text-4xl", 2: "text-3xl", 3: "text-2xl", 4: "text-xl", 5: "text-lg", 6: "text-base" };
            const Tag = (`h${level}`) as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            return <Tag key={idx} className={`font-extrabold text-gray-900 mt-8 mb-3 ${sizeMap[level] ?? "text-2xl"}`} dangerouslySetInnerHTML={{ __html: data.text }} />;
        }
        case "paragraph":
            return <p key={idx} className="text-gray-700 leading-relaxed my-3 text-base" dangerouslySetInnerHTML={{ __html: data.text }} />;

        case "list":
        case "nestedList": {
            const items: string[] = data.items ?? [];
            if (data.style === "ordered") {
                return (
                    <ol key={idx} className="list-decimal list-inside space-y-1.5 my-4 text-gray-700 pl-4">
                        {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === "string" ? item : (item as any).content ?? "" }} />)}
                    </ol>
                );
            }
            return (
                <ul key={idx} className="list-disc list-inside space-y-1.5 my-4 text-gray-700 pl-4">
                    {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: typeof item === "string" ? item : (item as any).content ?? "" }} />)}
                </ul>
            );
        }

        case "warning":
            return (
                <div key={idx} className="flex gap-4 my-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-bold text-amber-800 text-sm">{data.title}</p>
                        <p className="text-amber-700 text-sm mt-0.5">{data.message}</p>
                    </div>
                </div>
            );

        case "image":
            return (
                <figure key={idx} className="my-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.url ?? data.file?.url} alt={data.caption ?? "Image"} className="w-full rounded-2xl shadow-sm object-cover max-h-[480px]" />
                    {data.caption && <figcaption className="text-center text-xs text-gray-400 mt-2">{data.caption}</figcaption>}
                </figure>
            );

        case "video":
            return (
                <div key={idx} className="my-6 aspect-video w-full">
                    <iframe
                        src={data.url}
                        title={data.caption ?? "Video"}
                        className="w-full h-full rounded-2xl shadow-sm"
                        allowFullScreen
                    />
                </div>
            );

        case "embed":
            return (
                <div key={idx} className="my-6">
                    <iframe
                        src={data.embed ?? data.url}
                        title={data.caption ?? "Embed"}
                        className="w-full rounded-2xl shadow-sm border border-gray-100"
                        style={{ height: data.height ?? 300 }}
                        allowFullScreen
                    />
                    {data.caption && <p className="text-xs text-center text-gray-400 mt-2">{data.caption}</p>}
                </div>
            );

        case "table": {
            const rows: string[][] = data.content ?? [];
            return (
                <div key={idx} className="my-6 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="w-full text-sm text-gray-700 border-collapse">
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri} className={ri === 0 && data.withHeadings ? "bg-gray-50 font-bold" : "hover:bg-gray-50/50"}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="border border-gray-100 px-4 py-2.5" dangerouslySetInnerHTML={{ __html: cell }} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        case "quote":
            return (
                <blockquote key={idx} className="my-5 border-l-4 border-indigo-400 pl-5 italic text-gray-600">
                    <p dangerouslySetInnerHTML={{ __html: data.text }} />
                    {data.caption && <cite className="block text-xs text-gray-400 mt-1 not-italic">— {data.caption}</cite>}
                </blockquote>
            );

        case "delimiter":
            return <hr key={idx} className="my-8 border-t-2 border-dashed border-gray-200" />;

        case "code":
            return (
                <pre key={idx} className="my-5 bg-gray-900 text-green-300 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                    <code>{data.code}</code>
                </pre>
            );

        default:
            // Fallback: show type + raw data
            return (
                <div key={idx} className="my-4 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                    <span className="font-bold uppercase text-gray-500">[{type}]</span>{" "}
                    {data.text || data.content || ""}
                </div>
            );
    }
}

// ─── Read-only viewer ─────────────────────────────────────────────────────────
function BlocksViewer({ data }: { data: any }) {
    const blocks: any[] = data?.blocks ?? [];

    if (blocks.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <p className="text-sm italic">No content blocks yet.</p>
            </div>
        );
    }

    return (
        <div className="prose prose-indigo max-w-none">
            {blocks.map((block, idx) => renderBlock(block, idx))}
        </div>
    );
}

// ─── Editor component ─────────────────────────────────────────────────────────
const Editor = ({ is_editting, file, setFile }: EditorProps) => {
    const editorRef = useRef<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    // Use a stable unique ID so multiple instances on same page don't clash
    const containerId = useMemo(() => `editorjs-${Math.random().toString(36).slice(2, 9)}`, []);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isMounted || !is_editting) return;

        const initEditor = async () => {
            const EditorJS     = (await import("@editorjs/editorjs")).default;
            const Header       = (await import("@editorjs/header")).default;
            const List         = (await import("@editorjs/list")).default;
            const NestedList   = (await import("@editorjs/nested-list")).default;
            const Warning      = (await import("@editorjs/warning")).default;
            const EmbedUrlTool = (await import("./EmbedUrlTool")).default;
            const Table        = (await import("@editorjs/table")).default;
            const ImageUrlTool = (await import("./ImageUrlTool")).default;
            const VideoUrlTool = (await import("./VideoUrlTool")).default;
            const Paragraph    = (await import("@editorjs/paragraph")).default;

            // Destroy previous instance if it exists
            if (editorRef.current?.destroy) {
                try { editorRef.current.destroy(); } catch (_) {}
                editorRef.current = null;
            }

            const editor = new EditorJS({
                holder: containerId,
                readOnly: false,
                data: file?.blocks && file.blocks.length > 0 ? file : DEFAULT_DATA,
                tools: {
                    header: Header,
                    paragraph: Paragraph,
                    list: List,
                    nestedList: NestedList,
                    warning: Warning,
                    embed: EmbedUrlTool,
                    table: Table,
                    image: ImageUrlTool,
                    video: VideoUrlTool,
                },
                onChange: async () => {
                    if (editorRef.current) {
                        try {
                            const saved = await editorRef.current.save();
                            setFile(saved);
                        } catch (err) {
                            console.error("EditorJS save failed", err);
                        }
                    }
                },
                placeholder: "Let your imagination run wild...",
                autofocus: true,
            });

            editorRef.current = editor;
        };

        initEditor();

        return () => {
            if (editorRef.current?.destroy) {
                try { editorRef.current.destroy(); } catch (_) {}
                editorRef.current = null;
            }
        };
    // Re-init when switching to editing mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, is_editting, containerId]);

    const handleClear = async () => {
        if (editorRef.current) {
            await editorRef.current.clear();
            setFile({ time: Date.now(), blocks: [] });
        }
    };

    const handleResetToDefault = () => {
        if (editorRef.current) {
            editorRef.current.render(DEFAULT_DATA);
            setFile(DEFAULT_DATA);
        }
    };

    // ── Read-only / Preview ────────────────────────────────────────────────────
    if (!is_editting) {
        return (
            <div className="w-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">View Only</span>
                    <span className="text-xs text-gray-500 ml-1">— Preview of lesson materials</span>
                </div>
                <div className="p-6 md:p-10">
                    <BlocksViewer data={file} />
                </div>
            </div>
        );
    }

    // ── Editing mode ───────────────────────────────────────────────────────────
    return (
        <div className="w-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col group/editor">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Editing Mode
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        You can modify and restructure the content below.
                    </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover/editor:opacity-100 transition-opacity">
                    <button type="button" onClick={handleResetToDefault}
                        className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all shadow-sm border border-indigo-200">
                        Load Template
                    </button>
                    <button type="button" onClick={handleClear}
                        className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm border border-red-200">
                        Clear Slate
                    </button>
                </div>
            </div>
            <div className="p-6 md:p-10 flex-1 bg-white dark:bg-slate-950 cursor-text">
                <div id={containerId} className="prose prose-indigo dark:prose-invert max-w-none min-h-[300px]" />
            </div>
        </div>
    );
};

export default Editor;
