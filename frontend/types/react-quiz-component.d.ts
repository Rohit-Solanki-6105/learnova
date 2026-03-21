declare module 'react-quiz-component' {
    import React from 'react';
    
    export interface QuizProps {
        quiz: any;
        shuffle?: boolean;
        showDefaultResult?: boolean;
        onComplete?: (obj: any) => void;
        customResultPage?: (obj: any) => React.ReactNode;
        showInstantFeedback?: boolean;
        continueTillCorrect?: boolean;
    }
    
    const Quiz: React.FC<QuizProps>;
    export default Quiz;
}
