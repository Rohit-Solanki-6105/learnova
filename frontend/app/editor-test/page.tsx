"use client"
import Editor from '@/components/Editor'
import React, { useState } from 'react'

function page() {
    const [file, setFile] = useState<any>();
    return (
        <Editor is_editting={true} file={file} setFile={setFile} />
    )
}

export default page
