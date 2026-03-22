from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services import generate_ai_response

@api_view(['POST'])
def ai_doubt_solver(request):
    question = request.data.get("question")
    course_title = request.data.get("course_title")
    course_description = request.data.get("course_description")

    answer = generate_ai_response(
        question,
        course_title,
        course_description
    )

    return Response({
        "answer": answer
    })