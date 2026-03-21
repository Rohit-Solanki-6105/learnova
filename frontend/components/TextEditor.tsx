"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Next.js SSR-safe import
const RichTextEditor = dynamic(() => import('react-rich-text-editor'), { ssr: false });

export interface TextEditorProps {
    text: string;
    setText: (val: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export default function TextEditor({ 
    text, 
    setText, 
    placeholder = "Start typing...", 
    readOnly = false 
}: TextEditorProps) {
    const [editorValue, setEditorValue] = useState<any>(null);
    const [RTE, setRTE] = useState<any>(null);
    const initRef = useRef(false);

    // react-rich-text-editor requires its own object class (RichTextEditor.createValueFromString)
    // We must load it asynchronously here to avoid SSR window is not defined errors.
    useEffect(() => {
        let mounted = true;
        
        import('react-rich-text-editor').then((mod) => {
            if (!mounted) return;
            const module = mod.default || mod;
            setRTE(() => module);
            
            if (text) {
                setEditorValue(module.createValueFromString(text, 'html'));
            } else {
                setEditorValue(module.createEmptyValue());
            }
            initRef.current = true;
        }).catch(err => {
            console.error("Failed to load react-rich-text-editor", err);
        });

        return () => { mounted = false; };
    }, []);

    // Sync external text changes from props (only if it differs significantly)
    // This handles cases where data is loaded from API *after* component mounted
    useEffect(() => {
        if (!RTE || !initRef.current || !editorValue) return;

        const currentHtml = editorValue.toString('html');
        // Prevent cursor jumping while typing by only resetting if strictly different
        if (text !== currentHtml && typeof text === 'string') {
             setEditorValue(RTE.createValueFromString(text || '', 'html'));
        }
    }, [text, RTE]);

    const handleChange = (value: any) => {
        setEditorValue(value);
        if (setText) {
            setText(value.toString('html'));
        }
    };

    if (!RTE || !editorValue) {
        return (
            <div className="w-full h-50 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-400 font-medium">Loading Editor...</span>
            </div>
        );
    }

    return (
        <div className="text-editor-container bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <RichTextEditor
                value={editorValue}
                onChange={handleChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className="quill-editor-wrapper border-none"
                editorClassName="min-h-[200px] p-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-950 border-none outline-none focus:ring-0 prose dark:prose-invert max-w-none"
                toolbarClassName="bg-gray-50/80 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800 p-2 flex flex-wrap gap-1"
            />
            {/* Minimal override CSS to fix react-rich-text-editor inherited un-styled bounds */}
            <style jsx global>{`
                .text-editor-container .public-DraftEditor-content {
                    min-height: 200px;
                }
                .text-editor-container .EditorToolbar__root___3_Aqz {
                    background: transparent;
                    border: none;
                    font-family: inherit;
                }
            `}</style>
        </div>
    );
}
