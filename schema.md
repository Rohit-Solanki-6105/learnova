User
- id (PK)
- name
- email
- password
- role (INT ENUM)  -- 1(admin),2(instructor),3(student)
- created_at
- updatedAt


Course
- id (PK)
- title
- description
- created_at
- updatedAt
- createdBy (FK to User)
- updatedBy (FK by user)
- visibility (INT ENUM) -- 1(everyone),2(only enrolled students)
- price (nullable)
- thumbnail (nullable)
- status (INT ENUM) -- 1(draft),2(published),3(archived)
- total_lesson
- total_duration
- responsible (FK by user)

Lessons
- id (PK)
- Courseid (FK by course)
- title
- data: json (using the editor.js)

attachment
- id (PK)
- lessonid (FK by lesson)
- file_url
- file_type (INT ENUM) -- 1(file),2(link)


Quiz
- id(PK)
- lessonid(FK by lesson)
- title
- description
- data: json (using the react quiz kit)

Quiz Reward
- id(PK)
- quizid(FK by quiz)
- attempt_no
- reward_points


Enrollment
- id(PK)
- userid(FK by user)
- courseid(FK by course)
- status(INT ENUM) -- 1(enrolled),2(in_progress),3(completed)
- completed_at
- created_at
- updated_at








User Progress
- id(PK)
- userid(FK by user)
- lessonid(FK by lesson)
- status(INT ENUM) -- 1(completed),2(not completed)
- completed_at
- created_at
- updated_at
- time_spent


User Quiz Attempt
- id(PK)
- userid(FK by user)
- quizid(FK by quiz)
- status(INT ENUM) -- 1,2,3
- completed_at
- created_at
- updated_at


User Quiz Answer
- id(PK)
- userid(FK by user)
- quizid(FK by quiz)
- lessonid(FK by lesson)
- status(INT ENUM) -- 1,2,3
- completed_at
- created_at
- updated_at





User Points
- id(PK)
- userid(FK by user)
- points
- created_at
- updated_at


User Points History
- id(PK)
- userid(FK by user)
- points
- created_at
- updated_at

Review
- id
- user_id
- course_id
- rating
- comment