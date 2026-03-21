"use client";

import React, { useEffect, useRef } from "react";

export interface TextEditorProps {
    text: string;
    setText: (val: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["clean"],
];

export default function TextEditor({
    text = "",
    setText,
    placeholder = "Start typing...",
    readOnly = false,
}: TextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    // Track if the change came from user input to avoid infinite loops
    const isUserInput = useRef(false);

    // Initialize Quill once on mount (dynamic import avoids SSR issues)
    useEffect(() => {
        if (quillRef.current || !editorRef.current) return;

        let isMounted = true;

        (async () => {
            const { default: Quill } = await import("quill");
            await import("quill/dist/quill.snow.css");

            if (!isMounted || !editorRef.current) return;

            const quill = new Quill(editorRef.current, {
                theme: "snow",
                placeholder,
                readOnly,
                modules: {
                    toolbar: readOnly ? false : TOOLBAR_OPTIONS,
                },
            });

            // Set initial content
            if (text) {
                quill.clipboard.dangerouslyPasteHTML(text);
            }

            // Listen for text changes and propagate to parent
            quill.on("text-change", () => {
                isUserInput.current = true;
                setText(quill.root.innerHTML === "<p><br></p>" ? "" : quill.root.innerHTML);
                isUserInput.current = false;
            });

            quillRef.current = quill;
        })();

        return () => {
            isMounted = false;
        };
        // Intentionally run only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external `text` prop changes (e.g., loaded from API) into the editor
    useEffect(() => {
        if (!quillRef.current) return;
        if (isUserInput.current) return; // Ignore — this is our own change

        const currentHtml = quillRef.current.root.innerHTML;
        const normalised = currentHtml === "<p><br></p>" ? "" : currentHtml;
        if (text !== normalised) {
            quillRef.current.clipboard.dangerouslyPasteHTML(text ?? "");
        }
    }, [text]);

    // Toggle readOnly dynamically
    useEffect(() => {
        if (!quillRef.current) return;
        quillRef.current.enable(!readOnly);
    }, [readOnly]);

    return (
        <div className="quill-wrapper">
            <div ref={editorRef} />

            <style jsx global>{`
                /* ── Toolbar ── */
                .quill-wrapper .ql-toolbar.ql-snow {
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem 0.75rem 0 0;
                    background: #f9fafb;
                    padding: 8px 12px;
                    font-family: inherit;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px;
                }

                /* ── Container ── */
                .quill-wrapper .ql-container.ql-snow {
                    border: 1px solid #e5e7eb;
                    border-top: none;
                    border-radius: 0 0 0.75rem 0.75rem;
                    font-family: inherit;
                    font-size: 0.9375rem;
                }

                /* ── Editor area ── */
                .quill-wrapper .ql-editor {
                    min-height: 200px;
                    padding: 1rem 1.25rem;
                    color: #111827;
                    line-height: 1.75;
                }

                .quill-wrapper .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                    left: 1.25rem;
                }

                /* ── Focus ring ── */
                .quill-wrapper:focus-within .ql-toolbar.ql-snow,
                .quill-wrapper:focus-within .ql-container.ql-snow {
                    border-color: #6366f1;
                }

                /* ── Toolbar button active / hover ── */
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke {
                    stroke: #6366f1 !important;
                }
                .quill-wrapper .ql-snow.ql-toolbar button:hover .ql-fill,
                .quill-wrapper .ql-snow.ql-toolbar button.ql-active .ql-fill {
                    fill: #6366f1 !important;
                }

                /* ── Dark mode ── */
                :is(.dark) .quill-wrapper .ql-toolbar.ql-snow {
                    background: #0f172a;
                    border-color: #1e293b;
                }
                :is(.dark) .quill-wrapper .ql-container.ql-snow {
                    border-color: #1e293b;
                    background: #0f172a;
                }
                :is(.dark) .quill-wrapper .ql-editor {
                    color: #e2e8f0;
                }
                :is(.dark) .quill-wrapper .ql-stroke {
                    stroke: #94a3b8 !important;
                }
                :is(.dark) .quill-wrapper .ql-fill {
                    fill: #94a3b8 !important;
                }
                :is(.dark) .quill-wrapper .ql-picker-label {
                    color: #94a3b8 !important;
                }
            `}</style>
        </div>
    );
}