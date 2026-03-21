"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Tag as TagIcon, Plus, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface Tag {
    id: number;
    name: string;
}

interface TagsInputProps {
    /** Currently selected tags */
    selectedTags: Tag[];
    /** Called when the selection changes */
    onChange: (tags: Tag[]) => void;
}

export default function TagsInput({ selectedTags, onChange }: TagsInputProps) {
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ─── Fetch all tags from backend ──────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth("/tags/");
                if (res.ok) setAllTags(await res.json());
            } catch { }
            finally { setLoading(false); }
        };
        load();
    }, []);

    // ─── Close dropdown when clicking outside ─────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ─── Filtered suggestions ─────────────────────────────────────────────────
    const selectedIds = new Set(selectedTags.map(t => t.id));
    const filtered = allTags.filter(
        t => !selectedIds.has(t.id) && t.name.toLowerCase().includes(query.toLowerCase())
    );
    const exactMatch = allTags.some(t => t.name.toLowerCase() === query.toLowerCase().trim());

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const addTag = useCallback((tag: Tag) => {
        if (!selectedIds.has(tag.id)) {
            onChange([...selectedTags, tag]);
        }
        setQuery("");
        setOpen(false);
        inputRef.current?.focus();
    }, [selectedIds, selectedTags, onChange]);

    const removeTag = useCallback((id: number) => {
        onChange(selectedTags.filter(t => t.id !== id));
    }, [selectedTags, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && query === "" && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1].id);
        }
        if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
        if (e.key === "Enter" && query.trim()) {
            e.preventDefault();
            // If exact match exists in filtered, add it
            const match = filtered[0];
            if (match) {
                addTag(match);
            } else if (!exactMatch) {
                handleCreateTag();
            }
        }
    };

    // ─── Create new tag ───────────────────────────────────────────────────────
    const handleCreateTag = async () => {
        const name = query.trim();
        if (!name) return;
        setCreating(true);
        try {
            const res = await fetchWithAuth("/tags/", {
                method: "POST",
                body: JSON.stringify({ name }),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error("Could not create tag: " + (err.name?.[0] || JSON.stringify(err)));
                return;
            }
            const newTag: Tag = await res.json();
            setAllTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
            addTag(newTag);
            toast.success(`Tag "${newTag.name}" created!`);
        } catch {
            toast.error("Failed to create tag");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Pill container / input row */}
            <div
                className={`flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-xl transition-all cursor-text min-h-[48px] ${open ? "border-indigo-400 ring-2 ring-indigo-100 bg-white" : "border-gray-200 hover:border-gray-300"}`}
                onClick={() => { inputRef.current?.focus(); setOpen(true); }}
            >
                {/* Selected tag pills */}
                {selectedTags.map(tag => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full group/pill select-none"
                    >
                        <TagIcon size={11} className="opacity-60" />
                        {tag.name}
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); removeTag(tag.id); }}
                            className="text-indigo-400 hover:text-indigo-700 transition-colors rounded-full"
                            title={`Remove "${tag.name}"`}
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}

                {/* Text input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedTags.length === 0 ? "Search or create tags..." : "Add more..."}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                />
                {loading && <Loader2 size={14} className="animate-spin text-gray-400 self-center" />}
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filtered.length > 0 && (
                        <ul className="max-h-52 overflow-y-auto py-1.5">
                            {filtered.map(tag => (
                                <li key={tag.id}>
                                    <button
                                        type="button"
                                        onMouseDown={e => { e.preventDefault(); addTag(tag); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                                    >
                                        <TagIcon size={13} className="text-indigo-400 shrink-0" />
                                        <span className="font-medium">{tag.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Create new tag option */}
                    {query.trim() && !exactMatch && (
                        <>
                            {filtered.length > 0 && <div className="border-t border-gray-100" />}
                            <button
                                type="button"
                                onMouseDown={e => { e.preventDefault(); handleCreateTag(); }}
                                disabled={creating}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors text-left"
                            >
                                {creating
                                    ? <Loader2 size={13} className="animate-spin shrink-0" />
                                    : <Plus size={13} className="shrink-0" />
                                }
                                <span>Create <strong>"{query.trim()}"</strong></span>
                            </button>
                        </>
                    )}

                    {/* Empty state */}
                    {filtered.length === 0 && !query.trim() && (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                            {allTags.length === 0 ? "No tags yet — type to create one" : "All tags selected. Type to add more."}
                        </div>
                    )}

                    {filtered.length === 0 && query.trim() && exactMatch && (
                        <div className="px-4 py-3 text-xs text-gray-400 text-center">
                            This tag is already selected
                        </div>
                    )}
                </div>
            )}

            {/* Helper hint */}
            <p className="mt-1.5 text-[11px] text-gray-400 ml-1">
                Press <kbd className="bg-gray-100 rounded px-1 text-gray-500">Enter</kbd> to add or create a tag · <kbd className="bg-gray-100 rounded px-1 text-gray-500">Backspace</kbd> to remove last
            </p>
        </div>
    );
}
