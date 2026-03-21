'use client';
import React, { useEffect, useState } from 'react'

function page() {
    const [counter, setCounter] = useState<number>(0);
    useEffect(() => {
        console.log(counter);
    }, [counter])
    return (
        <div>
            <button
                onClick={() => {
                    setCounter(counter + 1);
                }}>
                increment
            </button>
            <br />
            <button
                onClick={() => {
                    setCounter(counter - 1);
                }}>
                decrement
            </button>
            <h1>
                {counter}
            </h1>
        </div>
    )
}

export default page