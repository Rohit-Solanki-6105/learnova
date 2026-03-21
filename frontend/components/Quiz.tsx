"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QuizQuestion {
    question: string;
    questionType: 'text' | 'photo';
    answerSelectionType: 'single' | 'multiple';
    answers: string[];
    correctAnswer: string | string[];
    messageForCorrectAnswer: string;
    messageForIncorrectAnswer: string;
    explanation: string;
    points: number;        // ← per-question points (default 1)
    questionPic?: string;  // for photo type
}

export interface QuizData {
    quizTitle: string;
    quizSynopsis: string;
    questions: QuizQuestion[];
}

export interface QuizComponentProps {
    status: 'editing' | 'attempting' | 'viewing';
    data?: QuizData;
    setData?: (data: QuizData) => void;
    onComplete?: (result: { correctPoints: number; totalPoints: number }) => void;
    /** Duration in minutes. 0 = no limit. Used as countdown timer in player. */
    duration?: number;
}

const DEFAULT_QUIZ: QuizData = {
    quizTitle: "New Interactive Quiz",
    quizSynopsis: "Provide a brief description of the quiz for your learners.",
    questions: []
};

// ─── Countdown Timer Hook ────────────────────────────────────────────────────

function useCountdown(totalSeconds: number, onExpire: () => void) {
    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const expired = useRef(false);

    useEffect(() => {
        if (totalSeconds <= 0) return;
        setTimeLeft(totalSeconds);
        expired.current = false;
        const id = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    if (!expired.current) {
                        expired.current = true;
                        onExpire();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalSeconds]);

    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    const isWarning = timeLeft > 0 && timeLeft <= 60;
    const isCritical = timeLeft > 0 && timeLeft <= 30;
    return { timeLeft, mins, secs, isWarning, isCritical };
}

// ─── Quiz Player ─────────────────────────────────────────────────────────────

const QuizPlayer = ({
    quiz,
    onComplete,
    duration = 0
}: {
    quiz: QuizData;
    onComplete?: (r: { correctPoints: number; totalPoints: number }) => void;
    duration?: number;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
    const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set());
    const [isAnswered, setIsAnswered] = useState(false);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const hasCompletedRef = useRef(false);

    const totalPoints = quiz.questions.reduce((s, q) => s + (q.points ?? 1), 0);

    const completeQuiz = useCallback((finalEarned: number) => {
        if (hasCompletedRef.current) return;
        hasCompletedRef.current = true;
        setShowResult(true);
        if (onComplete) onComplete({ correctPoints: finalEarned, totalPoints });
    }, [onComplete, totalPoints]);

    const { mins, secs, isWarning, isCritical } = useCountdown(
        duration > 0 ? duration * 60 : 0,
        () => completeQuiz(earnedPoints)
    );

    const question = quiz.questions[currentIndex];

    const isCorrect = () => {
        if (!question) return false;
        if (question.answerSelectionType === 'multiple') {
            const correct = (Array.isArray(question.correctAnswer)
                ? question.correctAnswer
                : JSON.parse(question.correctAnswer as string)
            ).map(String).sort().join(',');
            const selected = [...selectedAnswers].sort().join(',');
            return correct === selected;
        }
        return String(selectedAnswer) === String(question.correctAnswer);
    };

    const handleSubmit = () => {
        if (question.answerSelectionType === 'multiple' && selectedAnswers.size === 0) return;
        if (question.answerSelectionType === 'single' && selectedAnswer === null) return;
        const pts = question.points ?? 1;
        if (isCorrect()) setEarnedPoints(e => e + pts);
        setIsAnswered(true);
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < quiz.questions.length) {
            setCurrentIndex(nextIndex);
            setSelectedAnswer(null);
            setSelectedAnswers(new Set());
            setIsAnswered(false);
        } else {
            completeQuiz(earnedPoints + (isCorrect() ? (question.points ?? 1) : 0));
        }
    };

    const toggleMultiple = (idx: string) => {
        if (isAnswered) return;
        setSelectedAnswers(prev => {
            const n = new Set(prev);
            n.has(idx) ? n.delete(idx) : n.add(idx);
            return n;
        });
    };

    if (!question && !showResult) return null;

    // ─── Results screen ───────────────────────────────────────────────────────
    if (showResult) {
        const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = pct >= 60;
        return (
            <div className="text-center p-10 md:p-14 bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                    {passed
                        ? <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    }
                </div>
                <h2 className="text-3xl font-black mb-2 text-gray-900">{passed ? 'Well done!' : 'Keep practicing!'}</h2>
                <p className="text-gray-500 mb-6">{quiz.quizTitle}</p>
                <div className="inline-flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-2xl px-10 py-6 mb-6">
                    <span className={`text-6xl font-black ${passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</span>
                    <span className="text-sm text-gray-400 font-medium">{earnedPoints} / {totalPoints} points</span>
                </div>
                <p className="text-gray-400 text-sm">60% required to pass</p>
            </div>
        );
    }

    const answered = isAnswered;

    return (
        <div className="max-w-3xl mx-auto w-full space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{quiz.quizTitle}</h2>
                    <p className="text-gray-400 text-sm mt-0.5">{quiz.quizSynopsis}</p>
                </div>
                {/* Countdown timer */}
                {duration > 0 && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-black shrink-0 border-2 transition-colors ${
                        isCritical ? 'bg-red-50 border-red-400 text-red-600 animate-pulse'
                        : isWarning ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {mins}:{secs}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${((currentIndex + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }}
                />
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        Question {currentIndex + 1} / {quiz.questions.length}
                    </span>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                        {question.points ?? 1} {(question.points ?? 1) === 1 ? 'pt' : 'pts'}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">{question.question}</h3>

                {/* Answer options */}
                <div className="space-y-3 mb-6">
                    {question.answers.map((ans, i) => {
                        const idx = String(i + 1);
                        const letter = ['A', 'B', 'C', 'D', 'E'][i] ?? `${i + 1}`;

                        // multi-select
                        if (question.answerSelectionType === 'multiple') {
                            const isSelected = selectedAnswers.has(idx);
                            const correctArr = Array.isArray(question.correctAnswer)
                                ? question.correctAnswer.map(String)
                                : (() => { try { return JSON.parse(question.correctAnswer as string).map(String); } catch { return [String(question.correctAnswer)]; } })();
                            const isActuallyCorrect = correctArr.includes(idx);

                            let cls = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center gap-4 ";
                            if (!answered) {
                                cls += isSelected ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-indigo-200 bg-gray-50 text-gray-700";
                            } else {
                                if (isActuallyCorrect) cls += "border-green-500 bg-green-50 text-green-700";
                                else if (isSelected) cls += "border-red-500 bg-red-50 text-red-700";
                                else cls += "border-gray-100 bg-gray-50 text-gray-400 opacity-50";
                            }

                            return (
                                <button key={i} disabled={answered} onClick={() => toggleMultiple(idx)} className={cls}>
                                    <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${
                                        answered ? (isActuallyCorrect ? 'bg-green-200 text-green-800' : (isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500'))
                                        : (isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500')
                                    }`}>{letter}</span>
                                    {ans}
                                </button>
                            );
                        }

                        // single select
                        const isSelected = selectedAnswer === idx;
                        const isActuallyCorrect = String(question.correctAnswer) === idx;
                        let cls = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center gap-4 ";
                        if (!answered) {
                            cls += isSelected ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 hover:border-indigo-200 bg-gray-50 text-gray-700";
                        } else {
                            if (isActuallyCorrect) cls += "border-green-500 bg-green-50 text-green-700";
                            else if (isSelected) cls += "border-red-500 bg-red-50 text-red-700";
                            else cls += "border-gray-100 bg-gray-50 text-gray-400 opacity-50";
                        }

                        return (
                            <button key={i} disabled={answered} onClick={() => setSelectedAnswer(idx)} className={cls}>
                                <span className={`flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-xs font-black ${
                                    answered ? (isActuallyCorrect ? 'bg-green-200 text-green-800' : (isSelected ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500'))
                                    : (isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500')
                                }`}>{letter}</span>
                                {ans}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback */}
                {answered && (
                    <div className={`p-5 rounded-xl border mb-6 ${isCorrect() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <h4 className={`font-bold mb-1 ${isCorrect() ? 'text-green-800' : 'text-red-800'}`}>
                            {isCorrect() ? question.messageForCorrectAnswer : question.messageForIncorrectAnswer}
                        </h4>
                        {question.explanation && <p className="text-gray-600 text-sm">{question.explanation}</p>}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end border-t border-gray-100 pt-5">
                    {!answered ? (
                        <button
                            onClick={handleSubmit}
                            disabled={question.answerSelectionType === 'single' ? selectedAnswer === null : selectedAnswers.size === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all flex items-center gap-2"
                        >
                            {currentIndex + 1 < quiz.questions.length ? 'Next Question' : 'View Results'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function LearnovaQuiz({ status, data, setData, onComplete, duration = 0 }: QuizComponentProps) {
    const [internalData, setInternalData] = useState<QuizData>(data || DEFAULT_QUIZ);

    useEffect(() => {
        if (data && Object.keys(data).length > 0) setInternalData(data);
    }, [data]);

    const updateData = (newData: QuizData) => {
        setInternalData(newData);
        if (setData) setData(newData);
    };

    const handleAddQuestion = () => {
        const newQ: QuizQuestion = {
            question: "What is your new question?",
            questionType: "text",
            answerSelectionType: "single",
            answers: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "1",
            messageForCorrectAnswer: "Correct! Well done.",
            messageForIncorrectAnswer: "Incorrect. Please review.",
            explanation: "Provide an explanation for the correct answer.",
            points: 1,
        };
        updateData({ ...internalData, questions: [...internalData.questions, newQ] });
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const qs = [...internalData.questions];
        qs[index] = { ...qs[index], [field]: value };
        updateData({ ...internalData, questions: qs });
    };

    const handleAnswerChange = (qIdx: number, aIdx: number, value: string) => {
        const qs = [...internalData.questions];
        const ans = [...qs[qIdx].answers];
        ans[aIdx] = value;
        qs[qIdx] = { ...qs[qIdx], answers: ans };
        updateData({ ...internalData, questions: qs });
    };

    const handleAddAnswer = (qIdx: number) => {
        const qs = [...internalData.questions];
        qs[qIdx].answers.push(`Option ${qs[qIdx].answers.length + 1}`);
        updateData({ ...internalData, questions: qs });
    };

    const handleRemoveAnswer = (qIdx: number, aIdx: number) => {
        const qs = [...internalData.questions];
        qs[qIdx].answers.splice(aIdx, 1);
        updateData({ ...internalData, questions: qs });
    };

    const handleDeleteQuestion = (qIdx: number) => {
        const qs = [...internalData.questions];
        qs.splice(qIdx, 1);
        updateData({ ...internalData, questions: qs });
    };

    // ─── Preview / Attempt mode ───────────────────────────────────────────────
    if (status === 'attempting' || status === 'viewing') {
        if (!internalData || !internalData.questions || internalData.questions.length === 0) {
            return (
                <div className="p-8 text-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
                    No questions available for this quiz yet.
                </div>
            );
        }
        return (
            <div className="w-full">
                <QuizPlayer quiz={internalData} onComplete={onComplete} duration={duration} />
            </div>
        );
    }

    // ─── Edit mode ────────────────────────────────────────────────────────────
    const totalPts = internalData.questions.reduce((s, q) => s + (q.points ?? 1), 0);

    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Quiz Editor
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {internalData.questions.length} questions · {totalPts} total points
                        {duration > 0 && ` · ${duration} min time limit`}
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                {/* Quiz info */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quiz Title</label>
                        <input
                            type="text"
                            value={internalData.quizTitle}
                            onChange={e => updateData({ ...internalData, quizTitle: e.target.value })}
                            className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Synopsis (shown before starting)</label>
                        <textarea
                            value={internalData.quizSynopsis}
                            onChange={e => updateData({ ...internalData, quizSynopsis: e.target.value })}
                            className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-20 resize-none"
                        />
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900">Questions</h3>
                        <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{internalData.questions.length} total</span>
                    </div>

                    {internalData.questions.map((q, qIdx) => (
                        <div key={qIdx} className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm relative group hover:border-indigo-200 transition-colors">
                            {/* Delete */}
                            <button
                                onClick={() => handleDeleteQuestion(qIdx)}
                                title="Delete question"
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded-lg p-1.5 border border-gray-100 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>

                            {/* Question text */}
                            <div className="mb-5 pr-10">
                                <label className="block text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">Question {qIdx + 1}</label>
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                                    placeholder="e.g. What is the powerhouse of the cell?"
                                    className="w-full p-2 border-b-2 border-gray-200 bg-transparent focus:border-indigo-500 outline-none text-lg font-bold text-gray-900 placeholder-gray-300 transition-all"
                                />
                            </div>

                            {/* Meta row */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Type</label>
                                    <select
                                        value={q.questionType}
                                        onChange={e => handleQuestionChange(qIdx, 'questionType', e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="text">Text</option>
                                        <option value="photo">Photo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Selection</label>
                                    <select
                                        value={q.answerSelectionType}
                                        onChange={e => handleQuestionChange(qIdx, 'answerSelectionType', e.target.value)}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="single">Single Choice</option>
                                        <option value="multiple">Multiple Choice</option>
                                    </select>
                                </div>
                                {/* Points per question */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Points</label>
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={q.points ?? 1}
                                        onChange={e => handleQuestionChange(qIdx, 'points', Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-amber-400 font-bold text-amber-700"
                                    />
                                </div>
                            </div>

                            {/* Answers pool */}
                            <div className="mb-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Answer Options</label>
                                <div className="space-y-2.5">
                                    {q.answers.map((ans, aIdx) => (
                                        <div key={aIdx} className="flex gap-3 items-center group/ans">
                                            <span className="text-xs font-bold text-gray-300 w-5 text-right select-none">{aIdx + 1}.</span>
                                            <input
                                                type="text"
                                                value={ans}
                                                onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                                                className="flex-1 p-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            />
                                            {q.answers.length > 2 && (
                                                <button onClick={() => handleRemoveAnswer(qIdx, aIdx)} className="text-gray-300 hover:text-red-500 p-1.5 opacity-0 group-hover/ans:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="pl-8 pt-1">
                                        <button onClick={() => handleAddAnswer(qIdx)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                            Add Option
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Correct answer */}
                            <div className="mb-5 bg-green-50/50 p-5 rounded-xl border border-green-100">
                                <label className="block text-sm font-bold text-green-700 mb-1">Correct Answer</label>
                                <p className="text-xs text-green-500 mb-2">
                                    {q.answerSelectionType === 'single'
                                        ? "Enter the option number (e.g. '2')"
                                        : "Multiple: format as array (e.g. '[1, 3]')"}
                                </p>
                                <input
                                    type="text"
                                    value={typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer)}
                                    onChange={e => {
                                        let v: any = e.target.value;
                                        if (v.startsWith('[')) { try { v = JSON.parse(v); } catch { } }
                                        handleQuestionChange(qIdx, 'correctAnswer', v);
                                    }}
                                    className="w-full md:w-40 p-2.5 border border-green-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm"
                                />
                            </div>

                            {/* Messages + Explanation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-green-600 mb-1">✓ Correct message</label>
                                    <input type="text" value={q.messageForCorrectAnswer} onChange={e => handleQuestionChange(qIdx, 'messageForCorrectAnswer', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-red-500 mb-1">✗ Incorrect message</label>
                                    <input type="text" value={q.messageForIncorrectAnswer} onChange={e => handleQuestionChange(qIdx, 'messageForIncorrectAnswer', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-300" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">Explanation (shown after answering)</label>
                                    <textarea value={q.explanation} onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-300 resize-none min-h-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add question */}
                <button
                    onClick={handleAddQuestion}
                    className="w-full py-5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:text-white hover:border-indigo-600 hover:bg-indigo-600 font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <svg className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Add Question
                </button>
            </div>
        </div>
    );
}
