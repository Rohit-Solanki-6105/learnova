"""
Django management command to seed the database with sample data.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, Lesson, Tag
from quizzes.models import Quiz, QuizReward
from enrollments.models import Enrollment

User = get_user_model()


# Sample Editor.js block structure for lessons
def make_lesson_blocks(title: str, paragraphs: list, list_items: list = None) -> dict:
    blocks = [
        {"id": "h1", "type": "header", "data": {"text": f"About {title}", "level": 2}},
    ]
    for i, p in enumerate(paragraphs):
        blocks.append({"id": f"p{i}", "type": "paragraph", "data": {"text": p}})
    if list_items:
        blocks.append({
            "id": "list1",
            "type": "list",
            "data": {"style": "unordered", "items": list_items},
        })
    return {"time": 0, "blocks": blocks, "version": "2.30.0"}


# Sample Quiz data (react-quiz-component format)
SAMPLE_QUIZ_DATA = {
    "quizTitle": "Module 1 Assessment: Design Systems Foundation",
    "quizSynopsis": "Test your knowledge on design tokens, component architecture, and documentation standards.",
    "questions": [
        {
            "question": "Which Gestalt principle describes the tendency to perceive objects that are close to each other as a single group?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": ["Similarity", "Proximity", "Continuity", "Closure"],
            "correctAnswer": "2",
            "messageForCorrectAnswer": "Correct!",
            "messageForIncorrectAnswer": "Incorrect.",
            "explanation": "Proximity groups elements that are near each other.",
        },
        {
            "question": "What is a design token in the context of design systems?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": [
                "A visual asset like an icon",
                "A named variable storing a design decision (color, spacing, etc.)",
                "A CSS class name",
                "A component library",
            ],
            "correctAnswer": "2",
            "messageForCorrectAnswer": "Correct!",
            "messageForIncorrectAnswer": "Incorrect.",
            "explanation": "Design tokens are named entities that store design decisions.",
        },
        {
            "question": "Which file format is commonly used for design token distribution?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": ["JPEG", "JSON", "MP4", "SVG"],
            "correctAnswer": "2",
            "messageForCorrectAnswer": "Correct!",
            "messageForIncorrectAnswer": "Incorrect.",
            "explanation": "JSON is the standard format for design token exchange.",
        },
    ],
}

SAMPLE_COURSES = [
    {
        "title": "Advanced Design Systems for Modern SaaS",
        "description": "Master the architecture of scalable component libraries and token management for enterprise-level platforms.",
        "tags": ["Design", "Popular"],
        "price": 49.00,
        "thumbnail": None,
        "lessons": [
            ("The Design Philosophy", 8, ["Design systems bridge creative vision and engineering reality.", "Learn how leading companies scale their UI."], ["Understanding design tokens", "Component architecture basics"]),
            ("Grid Systems & Asymmetry", 12, ["Break the traditional grid while maintaining integrity.", "Curated Chaos and intentional misalignment."], ["Mathematical perfection in layouts", "Negative space as design element"]),
            ("Visual Hierarchy Rules", 15, ["Guide user focus through typography and spacing.", "Establish clear content priority."], []),
        ],
        "quiz": ("Module 1 Assessment", "Test your knowledge on design systems.", 15),
    },
    {
        "title": "Full-Stack Development with Modern Architectures",
        "description": "From database design to frontend deployment. Learn the full lifecycle of a digital product.",
        "tags": ["Development", "Beginner"],
        "price": 89.00,
        "thumbnail": None,
        "lessons": [
            ("Introduction to Full-Stack", 10, ["Overview of modern full-stack development.", "Choosing the right tech stack."], []),
            ("Database Design", 20, ["Schema design, migrations, and indexing.", "Relational vs document databases."], []),
            ("API Development", 25, ["REST and GraphQL APIs.", "Authentication and authorization."], []),
        ],
        "quiz": ("Module 1 Quiz", "Validate your full-stack fundamentals.", 10),
    },
    {
        "title": "Creative Leadership & Product Management",
        "description": "Bridge the gap between design and business. Learn how to lead creative teams effectively.",
        "tags": ["Business", "New"],
        "price": 59.00,
        "thumbnail": None,
        "lessons": [
            ("Leading Creative Teams", 12, ["Fostering innovation and collaboration.", "Managing designers and developers."], []),
            ("Product Strategy", 18, ["From vision to roadmap.", "Stakeholder alignment."], []),
        ],
        "quiz": None,
    },
    {
        "title": "Mastering Next.js 14 and React Server Components",
        "description": "Build incredibly fast, SEO-friendly applications with the latest React framework features.",
        "tags": ["Development", "Advanced"],
        "price": 79.00,
        "thumbnail": None,
        "lessons": [
            ("React Server Components Deep Dive", 15, ["Understanding RSC architecture.", "When to use client vs server components."], []),
            ("Data Fetching Patterns", 20, ["Streaming, suspense, and loading states.", "Caching strategies."], []),
        ],
        "quiz": ("Next.js Assessment", "Test your RSC and data fetching knowledge.", 15),
    },
    {
        "title": "Digital Marketing Strategy Formulation",
        "description": "Learn how to build comprehensive marketing funnels that convert visitors into loyal customers.",
        "tags": ["Marketing"],
        "price": 0,
        "thumbnail": None,
        "lessons": [
            ("Marketing Funnel Fundamentals", 10, ["Awareness, consideration, decision.", "Mapping the customer journey."], []),
        ],
        "quiz": None,
    },
    {
        "title": "Data Visualization with D3.js",
        "description": "Bring your data to life with interactive, dynamic web-based charts and graphs.",
        "tags": ["Development"],
        "price": 55.00,
        "thumbnail": None,
        "lessons": [
            ("D3 Fundamentals", 14, ["Selections, data binding, scales.", "Enter, update, exit pattern."], []),
            ("Building Custom Charts", 18, ["Bar, line, and scatter plots.", "Animations and transitions."], []),
        ],
        "quiz": ("D3 Assessment", "Validate your D3.js skills.", 10),
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample users, tags, courses, lessons, quizzes, and enrollments"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding (except users)",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Enrollment.objects.all().delete()
            QuizReward.objects.all().delete()
            Quiz.objects.all().delete()
            Lesson.objects.all().delete()
            Course.objects.all().delete()
            Tag.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Cleared."))

        # ─── Users ─────────────────────────────────────────────────────────
        self.stdout.write("Creating users...")
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@learnova.com",
                "first_name": "Admin",
                "last_name": "User",
                "role": 1,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not admin_user.check_password("admin123"):
            admin_user.set_password("admin123")
            admin_user.save()

        instructor, _ = User.objects.get_or_create(
            username="Ramesh",
            defaults={
                "username": "instructor@learnova.com",
                "first_name": "Ramesh",
                "last_name": "Kumar",
                "role": 2,
            },
        )
        if not instructor.check_password("instructor123"):
            instructor.set_password("instructor123")
            instructor.save()

        learner, _ = User.objects.get_or_create(
            username="piyush",
            defaults={
                "email": "learner@learnova.com",
                "first_name": "Piyush",
                "last_name": "Patel",
                "role": 3,
            },
        )
        if not learner.check_password("learner123"):
            learner.set_password("learner123")
            learner.save()

        self.stdout.write(self.style.SUCCESS(f"  Users: admin@learnova.com, instructor@learnova.com, learner@learnova.com (passwords: admin123, instructor123, learner123)"))

        # ─── Tags ──────────────────────────────────────────────────────────
        self.stdout.write("Creating tags...")
        tag_names = ["Design", "Development", "Business", "Marketing", "Popular", "Beginner", "Advanced", "New"]
        tags_by_name = {}
        for name in tag_names:
            t, _ = Tag.objects.get_or_create(name=name)
            tags_by_name[name] = t
        self.stdout.write(self.style.SUCCESS(f"  Created {len(tag_names)} tags"))

        # ─── Courses, Lessons, Quizzes ──────────────────────────────────────
        self.stdout.write("Creating courses...")
        for i, cdata in enumerate(SAMPLE_COURSES):
            tags = [tags_by_name[t] for t in cdata["tags"] if t in tags_by_name]
            course, created = Course.objects.update_or_create(
                title=cdata["title"],
                defaults={
                    "description": cdata["description"],
                    "price": cdata["price"] if cdata["price"] else None,
                    "thumbnail": cdata["thumbnail"],
                    "status": 2,  # Published
                    "visibility": 1,
                    "created_by": instructor,
                    "updated_by": instructor,
                    "responsible": instructor,
                },
            )
            course.tags.set(tags)

            for seq, (ltitle, dur, paras, items) in enumerate(cdata["lessons"], 1):
                Lesson.objects.update_or_create(
                    course=course,
                    sequence=seq,
                    defaults={
                        "title": ltitle,
                        "data": make_lesson_blocks(ltitle, paras, items or None),
                        "duration": dur,
                    },
                )

            if cdata["quiz"]:
                qtitle, qdesc, qdur = cdata["quiz"]
                quiz_data = {
                    **SAMPLE_QUIZ_DATA,
                    "quizTitle": qtitle,
                    "quizSynopsis": qdesc,
                }
                quiz, _ = Quiz.objects.update_or_create(
                    course=course,
                    title=qtitle,
                    defaults={
                        "description": qdesc,
                        "data": quiz_data,
                        "duration": qdur,
                        "sequence": len(cdata["lessons"]) + 1,
                    },
                )
                QuizReward.objects.get_or_create(
                    quiz=quiz,
                    attempt_no=1,
                    defaults={"reward_points": 10},
                )
                QuizReward.objects.get_or_create(
                    quiz=quiz,
                    attempt_no=2,
                    defaults={"reward_points": 5},
                )
                QuizReward.objects.get_or_create(
                    quiz=quiz,
                    attempt_no=3,
                    defaults={"reward_points": 2},
                )

            self.stdout.write(f"  ✓ {course.title}")

        # ─── Enrollments ───────────────────────────────────────────────────
        self.stdout.write("Creating enrollments...")
        published = Course.objects.filter(status=2)
        for idx, course in enumerate(published[:3]):  # Enroll learner in first 3 courses
            Enrollment.objects.get_or_create(
                user=learner,
                course=course,
                defaults={"status": 2 if idx == 0 else 1},  # First one in progress
            )
        self.stdout.write(self.style.SUCCESS(f"  Enrolled learner in {min(3, published.count())} courses"))

        self.stdout.write(self.style.SUCCESS("\n✓ Database seeded successfully!"))
