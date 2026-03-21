declare module 'react-rich-text-editor' {
    import React from 'react';

    export interface EditorValue {
        toString(format: string): string;
        setContentFromString(content: string, format: string): EditorValue;
    }

    export interface RichTextEditorProps {
        value: EditorValue;
        onChange: (value: EditorValue) => void;
        placeholder?: string;
        readOnly?: boolean;
        className?: string;
        editorClassName?: string;
        toolbarClassName?: string;
        customControls?: (controls: any[], value: EditorValue, onChange: (value: EditorValue) => void) => any[];
    }

    export default class RichTextEditor extends React.Component<RichTextEditorProps> {
        static createEmptyValue(): EditorValue;
        static createValueFromString(content: string, format: string): EditorValue;
    }
}
