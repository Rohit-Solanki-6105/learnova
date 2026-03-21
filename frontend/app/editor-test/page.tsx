"use client"
import Editor from '@/components/Editor'
import React, { useEffect, useState } from 'react'

function page() {
    const [file, setFile] = useState<any>();
    useEffect(() => {
        console.log(file)
    }, [file])
    return (
        <Editor is_editting={true} file={file} setFile={setFile} />
    )
}

export default page
