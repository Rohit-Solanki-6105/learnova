"use client";

import React, { useState } from 'react';
import LearnovaQuiz, { QuizData } from '@/components/Quiz';

const DUMMY_QUIZ: QuizData = {
  quizTitle: "React Fundamentals Mastery",
  quizSynopsis: "Test your knowledge of React hooks, components, and state management. Can you score 3/3?",
  questions: [
    {
      question: "What React hook should you use to manage local component state?",
      questionType: "text",
      answerSelectionType: "single",
      answers: [
        "useContext",
        "useEffect",
        "useState",
        "useReducer"
      ],
      correctAnswer: "3",
      messageForCorrectAnswer: "Correct! useState is the fundamental hook for keeping local state.",
      messageForIncorrectAnswer: "Incorrect. Think about the hook whose primary purpose is to hold state values.",
      explanation: "useState returns an array with the state value and a setter function, making it ideal for local memory."
    },
    {
      question: "Which hook is inherently best suited for executing side effects like fetching data from an API?",
      questionType: "text",
      answerSelectionType: "single",
      answers: [
        "useState",
        "useEffect",
        "useRef",
        "useMemo"
      ],
      correctAnswer: "2",
      messageForCorrectAnswer: "Spot on! useEffect handles all component side effects.",
      messageForIncorrectAnswer: "Not quite. Remember we need to interact with the component lifecycle.",
      explanation: "useEffect runs after the first render and after every update where dependencies change, making it perfect for API calls."
    },
    {
      question: "In React, how do you strictly pass data downwards from a parent component to a child component?",
      questionType: "text",
      answerSelectionType: "single",
      answers: [
        "Using State",
        "Using Props",
        "Using Context",
        "Using Redux"
      ],
      correctAnswer: "2",
      messageForCorrectAnswer: "Yes! Props are the fundamental way to pass data downwards.",
      messageForIncorrectAnswer: "Incorrect. What is the built-in React term for passing arguments into a component?",
      explanation: "Props (short for properties) allow you to pass read-only data from parent directly down to child in the component tree."
    }
  ]
};

export default function QuizTestPage() {
    const [mode, setMode] = useState<'editing' | 'attempting'>('attempting');
    const [quizData, setQuizData] = useState<QuizData>(DUMMY_QUIZ);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Engine Tester</h1>
                        <p className="text-gray-500 text-sm mt-1">Toggle between editing the JSON blocks and taking the Live Quiz.</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl">
                        <button 
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'editing' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setMode('editing')}
                        >
                            Instructor Mode
                        </button>
                        <button 
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'attempting' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                            onClick={() => setMode('attempting')}
                        >
                            Learner Mode
                        </button>
                    </div>
                </div>

                <LearnovaQuiz 
                    status={mode} 
                    data={quizData} 
                    setData={setQuizData} 
                    onComplete={(result) => {
                        console.log("Quiz Results:", result);
                        alert(`Quiz finished! You earned ${result.correctPoints} out of ${result.totalPoints} points.`);
                    }}
                />

            </div>
        </div>
    );
}
