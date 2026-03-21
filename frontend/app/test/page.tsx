'use client';
import TextEditor from '@/components/TextEditor';
import React, { useEffect, useState } from 'react'

function page() {
    const [text, setText] = useState<any>('');
    // const [counter, setCounter] = useState<number>(0);
    // useEffect(() => {
    //     console.log(counter);
    // }, [counter])
    return (
        <TextEditor text={text} setText={setText} />
    )
}

export default page