"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import LearnovaQuiz, { QuizData } from "@/components/Quiz";

const EMPTY_QUIZ: QuizData = {
    quizTitle: "",
    quizSynopsis: "",
    questions: []
};

// Mock data to demonstrate editing logic
const DUMMY_QUIZ: QuizData = {
    quizTitle: "Advanced Automation Quiz",
    quizSynopsis: "Test your learners on their understanding of complex automated workflows and triggers.",
    questions: [
        {
            question: "What is the primary trigger for an automated Sales Order?",
            questionType: "text",
            answerSelectionType: "single",
            answers: [
                "Manual Entry",
                "Quotation Confirmation",
                "Invoice Payment",
                "Lead Creation"
            ],
            correctAnswer: "2",
            messageForCorrectAnswer: "Correct! Confirming a quotation triggers a Sales Order.",
            messageForIncorrectAnswer: "Incorrect. Think about the standard conversion flow.",
            explanation: "In standard CRM flows, once a quotation is confirmed by the customer or salesperson, it automatically converts into a Sales Order."
        }
    ]
};

export default function QuizBuilderPage({ params }: { params: Promise<{ id: string, quizId: string }> }) {
    const resolvedParams = use(params);
    const { id, quizId } = resolvedParams;

    const isNew = quizId === "new";
    const [quizData, setQuizData] = useState<QuizData>(EMPTY_QUIZ);

    useEffect(() => {
        // Mock loading existing data from a database if we are editing
        if (!isNew) {
            setQuizData(DUMMY_QUIZ);
        }
    }, [isNew, quizId]);

    const handleSave = () => {
        // Here you would PUT/POST the `quizData` state to your Django backend APIs
        console.log("Saving quiz...", quizData);
        alert("Quiz saved successfully! Check the console for the JSON payload.");
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-[#2c2f30] font-sans pb-20 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Nav & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link
                            href={`/admin/courses/${id || 'demo'}`}
                            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#F43F5E] transition-colors mb-2"
                        >
                            <ArrowLeft size={16} /> Back to Course Configuration
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {isNew ? "Create New Quiz" : `Editing Quiz: ${quizData.quizTitle || 'Untitled'}`}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <Link
                            href={`/admin/courses/${id || 'demo'}`}
                            className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-full text-sm transition-colors shadow-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-[#F43F5E] hover:bg-[#BF517A] text-white font-semibold rounded-full text-sm shadow-sm transition-colors flex items-center gap-2"
                        >
                            <Save size={16} /> Save Quiz
                        </button>
                    </div>
                </div>

                {/* Main Editor Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    <div className="p-8 border-b border-gray-100 bg-rose-50/50">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Instructor Configuration</h2>
                        <p className="text-sm text-gray-500">
                            You are building the quiz logic and answers. Use the builder block below to add multiple-choice questions.
                            The system will grade the learners automatically based on your correct answer selections.
                        </p>
                    </div>

                    <div className="p-4 md:p-12 bg-zinc-50/50">
                        {/* We use LearnovaQuiz dynamically in 'editing' status */}
                        <LearnovaQuiz
                            status="editing"
                            data={quizData}
                            setData={setQuizData}
                            onComplete={() => { }} // Not needed in editing mode, but prop might be required
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
