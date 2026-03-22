import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_ai_response(question, course_title, course_description):
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
    You are an expert instructor.

    Course: {course_title}
    Description: {course_description}

    Student Question:
    {question}

    Explain clearly, step-by-step, in simple terms.
    """

    response = model.generate_content(prompt)

    return response.text