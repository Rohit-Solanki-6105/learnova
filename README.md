# Learnova 🎓

Learnova is a modern, comprehensive, and responsive eLearning platform designed for seamless learning and efficient course management. It provides a multi-role experience for Administrators, Instructors, and Learners.

---

## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
    - [Instructor / Admin Panel](#instructor-admin-panel)
    - [Learner Experience](#learner-experience)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [User Journey & Flow](#user-journey--flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [Using Docker](#using-docker)
- [Documentation & Resources](#documentation--resources)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview
Learnova bridges the gap between knowledge creators and seekers. It allows instructors to build rich, interactive courses using a variety of content types, while providing learners with a focused, gamified learning environment.

---

## ✨ Key Features

### 🛠️ Instructor / Admin Panel
- **Course Dashboard**: Manage courses via Kanban or List views.
- **Rich Content Builder**: Create lessons using Video (YouTube/Drive), Documents, and Images.
- **Quiz System**: Build comprehensive quizzes with the React Quiz Kit and set points based on attempt numbers.
- **Reporting & Analytics**: Track participant progress, enrollment dates, time spent, and completion percentages.
- **Enrollment Management**: Invite learners via email or manage paid enrollments.

### 🎓 Learner Experience
- **Interactive Player**: Full-screen, distraction-free learning interface with progress tracking.
- **Gamification**: Earn points for quiz attempts and unlock badges (Newbie to Master levels).
- **Course Discovery**: Browse and search through a catalog of published courses.
- **Reviews & Ratings**: Share feedback and see what others are saying about courses.
- **Resource Downloads**: Access supplemental files and attachments for lessons.

---

## 💻 Technology Stack

### **Frontend** (Next.js)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Editor**: [Editor.js](https://editorjs.io/) (for rich content creation)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Radix UI, React Kanban Kit

### **Backend** (Django)
- **Framework**: [Django 6.0](https://www.djangoproject.com/)
- **API**: [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
- **Authentication**: JWT (SimpleJWT)
- **Database**: MySQL
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/) (via generativeai SDK)
- **Static Assets**: WhiteNoise

---

## 🏗️ System Architecture
Learnova follows a decoupled architecture:
1.  **Frontend**: A modern React/Next.js application communicating with the backend via RESTful APIs.
2.  **Backend**: A robust Django-powered API server handling business logic, database management, and AI interactions.
3.  **Media/Storage**: Handles course thumbnails, lesson videos, and document attachments.

---

## 🔄 User Journey & Flow
1.  **Registration/Auth**: Users sign up and log in (Admin, Instructor, or Learner).
2.  **Course Creation (Instructor)**: Build modules -> Add Lessons -> Configure Quizzes -> Publish.
3.  **Discovery (Learner)**: Browse courses -> View details -> Enroll (Open/Invite/Paid).
4.  **Learning**: Complete lessons -> Pass Quizzes -> Earn Points -> Finish Course.
5.  **Analytics (Instructor)**: View learner stats and refine course content.

---

## 📂 Project Structure
```text
learnova/
├── frontend/             # Next.js Client application
│   ├── app/              # Routes and Pages (Admin, Instructor, Learner)
│   ├── components/       # Reusable UI components
│   └── public/           # Static assets
├── learnova/             # Django Server application
│   ├── courses/          # Course management logic
│   ├── quizzes/          # Quiz and Rewards modules
│   ├── enrollments/      # User enrollment and progress tracking
│   ├── users/            # Custom User model and Auth
│   └── ai_assitant/      # AI features
├── docker-compose.yaml   # Docker orchestration
├── Learnova.md           # Detailed Project Specification
└── schema.md             # Database Relationship Schema
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd learnova
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Linux/macOS:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in `learnova/` with your database and AI settings.
5.  Run migrations:
    ```bash
    python manage.py migrate
    ```
6.  Start the development server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### Using Docker
You can also spin up the entire stack using Docker:
```bash
docker-compose up --build
```

---

## 📄 Documentation & Resources
- **Project Requirements**: [Learnova.md](./Learnova.md)
- **Database Schema**: [schema.md](./schema.md)

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
