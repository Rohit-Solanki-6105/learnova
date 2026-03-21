"use client";

import React, { useState, useEffect } from 'react';

export interface QuizData {
    quizTitle: string;
    quizSynopsis: string;
    questions: any[];
}

export interface QuizComponentProps {
    status: 'editing' | 'attempting' | 'viewing';
    data?: QuizData;
    setData?: (data: QuizData) => void;
    onComplete?: (result: { correctPoints: number, totalPoints: number }) => void;
}

const DEFAULT_QUIZ: QuizData = {
    quizTitle: "New Interactive Quiz",
    quizSynopsis: "Provide a brief description of the quiz for your learners.",
    questions: []
};

// ------------------------------------------------------------------------------------------------
// Native Quiz Player (Replaces external buggy React libraries and resolves React 19 hook crashes)
// ------------------------------------------------------------------------------------------------
const QuizPlayer = ({ quiz, onComplete }: { quiz: QuizData, onComplete?: (r: any) => void }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const question = quiz.questions[currentQuestionIndex];

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null) return;

        const isCorrect = String(selectedAnswer) === String(question.correctAnswer);
        if (isCorrect) setScore(s => s + 1);

        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex + 1 < quiz.questions.length) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
            if (onComplete) onComplete({ correctPoints: score, totalPoints: quiz.questions.length });
        }
    };

    if (!question) return null;

    if (showResult) {
        return (
            <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-black mb-2 text-gray-900 dark:text-white">Quiz Completed!</h2>
                <div className="text-6xl font-black text-rose-600 dark:text-rose-400 my-6">{score} <span className="text-2xl text-gray-400">/ {quiz.questions.length}</span></div>
                <p className="text-gray-500 font-medium">You have completed the assessment for <b>{quiz.quizTitle}</b>.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto w-full">
            <div className="mb-6 px-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.quizTitle}</h2>
                <p className="text-gray-500 mt-1">{quiz.quizSynopsis}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-xs font-bold text-gray-400">Current Score: {score}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
                    {question.question}
                </h3>

                <div className="space-y-4 mb-8">
                    {question.answers.map((ans: string, i: number) => {
                        const answerIndex = String(i + 1);
                        const isSelected = selectedAnswer === answerIndex;
                        const isActuallyCorrect = String(question.correctAnswer) === answerIndex;

                        let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm md:text-base ";

                        if (!isAnswered) {
                            btnClass += isSelected
                                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 shadow-sm"
                                : "border-gray-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 bg-gray-50/50 dark:bg-slate-950 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-900";
                        } else {
                            if (isActuallyCorrect) {
                                btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                            } else if (isSelected && !isActuallyCorrect) {
                                btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                            } else {
                                btnClass += "border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950 text-gray-400 dark:text-gray-600 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={i}
                                disabled={isAnswered}
                                onClick={() => setSelectedAnswer(answerIndex)}
                                className={btnClass}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${isAnswered
                                            ? (isActuallyCorrect ? 'bg-green-200 text-green-800' : (isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500'))
                                            : (isSelected ? 'bg-rose-600 text-white' : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400')
                                        }`}>
                                        {['A', 'B', 'C', 'D'][i] || (i + 1)}
                                    </span>
                                    {ans}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {isAnswered && (
                    <div className={`p-6 rounded-xl border mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ${String(selectedAnswer) === String(question.correctAnswer)
                            ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50"
                            : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50"
                        }`}>
                        <h4 className={`text-lg font-bold mb-2 ${String(selectedAnswer) === String(question.correctAnswer) ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                            }`}>
                            {String(selectedAnswer) === String(question.correctAnswer) ? question.messageForCorrectAnswer : question.messageForIncorrectAnswer}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                            {question.explanation}
                        </p>
                    </div>
                )}

                <div className="flex justify-end border-t border-gray-100 dark:border-slate-800 pt-6">
                    {!isAnswered ? (
                        <button
                            disabled={selectedAnswer === null}
                            onClick={handleAnswerSubmit}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            {currentQuestionIndex + 1 < quiz.questions.length ? 'Next Question' : 'View Results'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ------------------------------------------------------------------------------------------------
// Main Wrapper Form Tool
// ------------------------------------------------------------------------------------------------

export default function LearnovaQuiz({ status, data, setData, onComplete }: QuizComponentProps) {
    const [internalData, setInternalData] = useState<QuizData>(data || DEFAULT_QUIZ);

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
        let parsedVal: any = val;
        if (val.startsWith('[') && val.endsWith(']')) {
            try { parsedVal = JSON.parse(val); } catch (e) { }
        }
        handleQuestionChange(qIndex, 'correctAnswer', parsedVal);
    }

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
            <div className="w-full">
                <QuizPlayer quiz={internalData} onComplete={onComplete} />
            </div>
        );
    }

    // ----------------------------------------------------
    return (
        <div className="w-full bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col font-sans">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Quiz JSON Visual Editor
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Build interactive quizzes with instant UI feedback mapping explicitly to the react-quiz-component standard.</p>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">

                <div className="space-y-4 bg-gray-50 dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Interactive Quiz Title</label>
                        <input
                            type="text"
                            value={internalData.quizTitle}
                            onChange={e => updateData({ ...internalData, quizTitle: e.target.value })}
                            className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Synopsis (Intro text shown before starting)</label>
                        <textarea
                            value={internalData.quizSynopsis}
                            onChange={e => updateData({ ...internalData, quizSynopsis: e.target.value })}
                            className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-sm min-h-20"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Questions</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-md">{internalData.questions.length} Total</span>
                    </div>

                    {internalData.questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 shadow-sm relative group transition-all hover:border-rose-300">
                            <button
                                onClick={() => {
                                    const nq = [...internalData.questions]; nq.splice(qIndex, 1); updateData({ ...internalData, questions: nq });
                                }}
                                title="Delete Question"
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded-lg p-1.5 shadow-sm border border-gray-100 dark:border-slate-800"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>

                            <div className="mb-5 pr-10">
                                <label className="block text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Question {qIndex + 1}</label>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
                                    placeholder="e.g. What is the powerhouse of the cell?"
                                    className="w-full p-2 border-b-2 border-gray-200 dark:border-slate-700 bg-transparent focus:border-rose-500 outline-none text-lg font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Media Type</label>
                                    <select
                                        value={q.questionType}
                                        onChange={e => handleQuestionChange(qIndex, 'questionType', e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
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
                                        className="w-full p-2.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-gray-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
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
                                                className="flex-1 p-2.5 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all shadow-sm"
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
                                            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg> Add Option
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
                                    <label className="block text-xs font-bold text-rose-600 mb-1">Success Message Header</label>
                                    <input
                                        type="text"
                                        value={q.messageForCorrectAnswer}
                                        onChange={e => handleQuestionChange(qIndex, 'messageForCorrectAnswer', e.target.value)}
                                        className="w-full p-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
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
                    className="w-full py-5 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-800 text-rose-600 hover:text-white hover:border-rose-600 hover:bg-rose-600 font-bold transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                    <svg className="w-6 h-6 text-rose-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Add New Curriculum Question
                </button>

            </div>
        </div>
    );
}
