"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the quiz player to avoid Next.js Server Side Rendering (SSR) issues
const QuizPlayer = dynamic(() => import('react-quiz-component').then(mod => mod.default), { ssr: false });

export interface QuizData {
  quizTitle: string;
  quizSynopsis: string;
  questions: any[];
}

export interface QuizComponentProps {
  status: 'editing' | 'attempting' | 'viewing';
  data?: QuizData;
  setData?: (data: QuizData) => void;
  onComplete?: (result: any) => void;
}

const DEFAULT_QUIZ: QuizData = {
  quizTitle: "New Interactive Quiz",
  quizSynopsis: "Provide a brief description of the quiz for your learners.",
  questions: []
};

export default function LearnovaQuiz({ status, data, setData, onComplete }: QuizComponentProps) {
  const [internalData, setInternalData] = useState<QuizData>(data || DEFAULT_QUIZ);

  // Sync internal data if external data changes (e.g. loaded from API)
  useEffect(() => {
      if (data && Object.keys(data).length > 0) {
          setInternalData(data);
      }
  }, [data]);

  const updateData = (newData: QuizData) => {
    setInternalData(newData);
    if (setData) setData(newData);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "What is your new question?",
      questionType: "text",
      answerSelectionType: "single",
      answers: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "1",
      messageForCorrectAnswer: "Correct answer. Good job.",
      messageForIncorrectAnswer: "Incorrect answer. Please try again.",
      explanation: "Provide an explanation for the correct answer here."
    };
    updateData({ ...internalData, questions: [...internalData.questions, newQuestion] });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...internalData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    updateData({ ...internalData, questions: newQuestions });
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const newQuestions = [...internalData.questions];
    const newAnswers = [...newQuestions[qIndex].answers];
    newAnswers[aIndex] = value;
    newQuestions[qIndex] = { ...newQuestions[qIndex], answers: newAnswers };
    updateData({ ...internalData, questions: newQuestions });
  };

  const handleAddAnswer = (qIndex: number) => {
    const newQuestions = [...internalData.questions];
    newQuestions[qIndex].answers.push("New Option");
    updateData({ ...internalData, questions: newQuestions });
  };

  const handleRemoveAnswer = (qIndex: number, aIndex: number) => {
    const newQuestions = [...internalData.questions];
    newQuestions[qIndex].answers.splice(aIndex, 1);
    updateData({ ...internalData, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (qIndex: number, val: string) => {
    // Basic parser for "[1, 2]" style strings if they switch to multiple
    let parsedVal: any = val;
    if (val.startsWith('[') && val.endsWith(']')) {
        try {
            parsedVal = JSON.parse(val);
        } catch(e) {}
    }
    handleQuestionChange(qIndex, 'correctAnswer', parsedVal);
  }

  // ----------------------------------------------------
  // ATTEMPTING MODE (Learners taking the quiz)
  // ----------------------------------------------------
  if (status === 'attempting' || status === 'viewing') {
    if (!internalData || !internalData.questions || internalData.questions.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                No active questions available for this quiz yet.
            </div>
        );
    }
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-2 md:p-6 w-full overflow-hidden">
        {/* Key fix: react-quiz-component often acts strangely if unmounted, so we wrap it securely */}
        <div className="react-quiz-container w-full max-w-full">
            <QuizPlayer 
                quiz={internalData} 
                shuffle={false} 
                showInstantFeedback={true} 
                continueTillCorrect={false} 
                onComplete={onComplete} 
            />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EDITING MODE (Instructors building the Quiz)
  // ----------------------------------------------------
  return (
    <div className="w-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
         <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Quiz JSON Visual Editor
            </h2>
            <p className="text-xs text-gray-500 mt-1">Build interactive quizzes with instant UI feedback mapping explicitly to the react-quiz-component standard.</p>
         </div>
      </div>
      
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Quiz Metadata Config configures global settings */}
        <div className="space-y-4 bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Interactive Quiz Title</label>
                <input 
                    type="text" 
                    value={internalData.quizTitle} 
                    onChange={e => updateData({...internalData, quizTitle: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Synopsis (Intro text shown before starting)</label>
                <textarea 
                    value={internalData.quizSynopsis} 
                    onChange={e => updateData({...internalData, quizSynopsis: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm min-h-20"
                />
            </div>
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Questions</h3>
                <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">{internalData.questions.length} Total</span>
            </div>
            
            {internalData.questions.map((q, qIndex) => (
                <div key={qIndex} className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 shadow-sm relative group transition-all hover:border-indigo-300">
                    <button 
                        onClick={() => {
                            const nq = [...internalData.questions]; nq.splice(qIndex, 1); updateData({...internalData, questions: nq});
                        }}
                        title="Delete Question"
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded-lg p-1.5 shadow-sm border border-gray-100 dark:border-slate-800"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    
                    <div className="mb-5 pr-10">
                        <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Question {qIndex + 1}</label>
                        <input 
                            type="text" 
                            value={q.question} 
                            onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                            placeholder="e.g. What is the powerhouse of the cell?"
                            className="w-full p-2 border-b-2 border-gray-200 dark:border-slate-700 bg-transparent focus:border-indigo-500 outline-none text-lg font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Media Type</label>
                            <select 
                                value={q.questionType} 
                                onChange={e => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                                className="w-full p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="text">Text Based</option>
                                <option value="photo">Photo Based</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Answer Selection Mode</label>
                            <select 
                                value={q.answerSelectionType} 
                                onChange={e => handleQuestionChange(qIndex, 'answerSelectionType', e.target.value)}
                                className="w-full p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="single">Single Choice (Radio)</option>
                                <option value="multiple">Multiple Choice (Checkboxes)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Answer Options pool</label>
                        </div>
                        <div className="space-y-3">
                            {q.answers.map((ans: string, aIndex: number) => (
                                <div key={aIndex} className="flex gap-3 items-center group/ans">
                                    <span className="text-xs font-bold text-gray-400 w-6 text-right select-none">{aIndex + 1}.</span>
                                    <input 
                                        type="text" 
                                        value={ans} 
                                        onChange={e => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                        className="flex-1 p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all shadow-sm"
                                    />
                                    {q.answers.length > 2 && (
                                        <button onClick={() => handleRemoveAnswer(qIndex, aIndex)} className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover/ans:opacity-100 transition-opacity" title="Remove Option">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <div className="pl-9 pt-2">
                                <button 
                                    onClick={() => handleAddAnswer(qIndex)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg> Add Option
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6 bg-green-50/30 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30">
                        <label className="block text-sm font-bold text-green-700 dark:text-green-500 mb-1">Correct Answer Match Index</label>
                        <p className="text-xs text-green-600/70 dark:text-green-400/70 mb-3">
                            {q.answerSelectionType === 'single' 
                                ? "Enter the number of the correct option (e.g. '1', '2' or '3')." 
                                : "Multiple Choice Mode: strictly format as array (e.g. '[1, 3]' or '[2, 4]')."}
                        </p>
                        <input 
                            type="text" 
                            value={typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer)} 
                            onChange={e => handleCorrectAnswerChange(qIndex, e.target.value)}
                            className="w-full md:w-1/2 p-2.5 border border-green-300 dark:border-green-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm tracking-widest shadow-sm"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-indigo-600 mb-1">Success Message Header</label>
                            <input 
                                type="text" 
                                value={q.messageForCorrectAnswer} 
                                onChange={e => handleQuestionChange(qIndex, 'messageForCorrectAnswer', e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-amber-600 mb-1">Failure Message Header</label>
                            <input 
                                type="text" 
                                value={q.messageForIncorrectAnswer} 
                                onChange={e => handleQuestionChange(qIndex, 'messageForIncorrectAnswer', e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Detailed Explanation (Revealed after attempting)</label>
                            <textarea 
                                value={q.explanation} 
                                onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-gray-300 min-h-15"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <button 
            onClick={handleAddQuestion}
            className="w-full py-5 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:text-white hover:border-indigo-600 hover:bg-indigo-600 font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
        >
            <svg className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Add New Curriculum Question
        </button>

      </div>
    </div>
  );
}
