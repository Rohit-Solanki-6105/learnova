```

Build a responsive eLearning platform with two sides:

```

1\. \*\*Instructor/Admin (Backoffice)\*\* : create and manage c ourses, lessons, quizzes,

&#x20;   attendees, publish c ourses to the website, and track learn er progress.

2\. \*\*Learner (Website/App)\*\* : bro wse/join courses, learn in a full-screen p la yer,

&#x20;   attempt quizzes (one q uestion p er page), earn p oints/badges, and post

&#x20;   ratings/reviews.



```

Create a complete learn ing e xperience where:

```

```

● In structors can b uild courses made of video/document/image/quiz lessons.

● Learners can start/continue learning, track progress , and complete a course.

● Quizzes support multiple attempts and a ward points based on the attempt

number.

● Learners get badges based o n total points.

● In structors can see course-wise learn er progress through reporting.

```

\### A) Admin



```

● Full access to b ack-office features.

● Can manage courses, reporting, and s ettings.

```

\### B) Instructor / Course Manager



\## Learnova (eLearning Platform)



\# 1) Objective



\# 2) Roles





```

● Creates and edits courses

● Adds lessons and q uizzes

● Publishes/unpublishes courses

● Adds attendees (invites users)

● Vie ws reporting

```

\### C) Learner (User)



```

● Vie w p ublished courses (based on course rules)

● Purc hase/Starts/continues lessons

● Attempts quizzes

● Earns points and b adges

● Adds ratings and reviews

```

```

Guests (not logged in) can view courses only if allowed, but must log in to

start learnin g.

```

\## Module A — Instructor/Admin Backoffice



\### A1) Courses Dashboard (Kanban/List)



A dashboard that lists all courses.



\*\*Must have\*\*



```

● Two views: Kanban a nd List

● Search c ourses by name

● For each course show:

○ Course title

○ Tags

○ Vie ws count

```

\# 3) What you need to build





```

○ Total lessons count

○ Total duration

○ Published b adge (if published o n website)

● Actions on e ach course:

○ Edit (open c ourse form)

○ Share (copy/generate course link)

● Create course:

○ + button o pens a small pop-up to enter the course name and c re ate it.

```

\### A2) Course Form (Edit Course)



This is the main p age to c onfigure a course.



\*\*Header actions\*\*



```

● Publish on website toggle (ON/OFF)

● Preview (open learner view)

● Add Attendees (opens wizard to directly a dd the learner to the c ourse b y

sending email)

● Contact Attendees ( opens wizard to contact the attendees by mail)

● Course image upload

```

\*\*Course fields\*\*



```

● Title (required)

● Tags

● Website (required when published)

● Responsible / Course A dmin (select a user)

```

\*\*Tabs\*\*



1\. \*\*Content\*\* (lessons list)

2\. \*\*Description\*\* (course-level description shown to learn ers)

3\. \*\*Options\*\* (visibility/access rules + course admin )

4\. \*\*Quiz\*\* (list of quizzes for this course)





\### A3) Lessons / Content Management



In side the \*\*Content\*\* tab:



```

● Show a list of lessons with:

○ Lesson title

○ Type (Video / Document / Image / Quiz)

○ 3-dot menu: Edit / Delete (dele te needs confirmation)

● Button: Add content (opens lesson e ditor popup)

```

\### A4) Lesson/content Editor (Add/Edit Lesson)



Popup e ditor with 3 tabs:



\*\*1) Content tab\*\*



```

● Lesson title (required)

● Lesson type s electo r: Video / Document / Image

● Responsible (optional)

● Type-specific fields:

○ Video : URL (YouTube/Drive link) + d uration

○ Document : upload file + Allow Download toggle

○ Image : upload image + Allow Download toggle

```

\*\*2) Description tab\*\*



```

● Text area o r rich e ditor: lesson d escription shown to learners.

```

\*\*3) Additional attachment tab\*\*



```

● Add extra resourc es as:

○ File upload, OR

○ External link (URL)

```



These attachments must appear on learn er's side under the lesson.



\### A5) Course Options (Access Rules)



In the \*\*Options\*\* tab c onfigure:



\*\*Visibility (“Show course to”)\*\*



```

● Everyone

● Signed In

```

\*\*Access rule\*\*



```

● Open

● On Invitation

● On Payment ( Display ‘Price’ field when Payment access rule is selected)

```

\#### Course Admin



```

● Select course admin /responsible person

```

\*\*Meaning\*\*



```

● Visibility decides who can see the course.

● Access rule decides who c an start/learn the c ourse.

```

\### A6) Quizzes (Instructor side)



In the \*\*Quiz\*\* tab:



```

● Show list of quizzes linked to the course.

● Each q uiz has Edit/Delete (with c onfirmation).

● Button: Add Quiz → o pens quiz b uilder.

```



\### A7) Quiz Builder (Instructor)



A page to create q uiz q uestions.



\*\*Left panel\*\*



```

● Question list (Question 1, Question 2, ...)

● Buttons:

○ Add Question

○ Rewards

```

\*\*Question editor\*\*



```

● Question text

● Multiple options (add n ew o ption)

● Mark correct option(s)

```

\*\*Rewards\*\*

Set points based o n a ttempt number:



```

● First try → X p oints

● Second try → Y p oints

● Third try → Z poin ts

● Fourth try and more → W p oints

```

\### A8) Reporting Dashboard (Instructor/Admin)



Reporting shows course-wise learner progress.



\*\*Overview cards\*\*



```

● Total Participants

● Yet to S tart

● In P ro gress

● Comple ted

```



Clicking a card filters the table below.



\*\*Users table\*\*

Each row s hows one learner’s p ro gre ss in one course:



```

● Sr no.

● Course name

● Participant name

● Enro lled d ate

● Start date

● Time spent

● Comple tion p ercentage

● Comple ted d ate

● Status (Yet to Start / In Progress / Completed)

```

\*\*Customizable columns\*\*

A side panel allows show/hid e columns using checkboxes.



\## Module B — Learner Website/App



\### B1) Website Navbar → Courses



A basic website layout with a \*\*Courses\*\* menu in n avbar.



```

● Clicking it shows all published c ourses (based o n visibility rules).

```

\### B2) My Courses Page (Learner Dashboard)



This page shows course cards and learn er pro file info.



\*\*Course cards show\*\*



```

● Cover image

```



```

● Title

● Short description

● Tags

● Button changes based on state:

○ Join Course (user not logged in)

○ Start (logged in, not started)

○ Continue (course in p ro gress)

○ Buy course (when the course is paid )

```

\*\*Search\*\*



```

● Search c ours es by name.

```

\*\*My Profile panel (only on My Courses page)\*\*



```

● Total points

● Badge levels (based on p oints):

○ Newbie (20 points)

○ Explorer (40 points)

○ Achiever (60 p oints)

○ Specialist (80 p oints)

○ Expert (100 points)

○ Maste r (120 points)

```

\### B3) Course Detail Page



Shows cours e details and progre ss.



\*\*Course Overview tab\*\*



```

● Course title, image, short description

● Progress bar (% comple te d)

● Total lessons count

● Comple ted count

● In complete count

● Lessons list with status icons:

```



```

○ In p ro gress state

○ Comple ted s tate (blue tick)

● Search lesson by name

● Clicking a lesson opens the full-screen p la yer.

```

\### B4) Ratings \& Reviews Tab



In side the cours e page:



```

● Average rating (stars)

● Reviews list (avatar + n ame + review text)

● Button: Add Review

○ Logged-in u ser can a dd rating + review text

```

\### B5) Full-Screen Lesson Player



A focused learn ing v iew.



\*\*Left sidebar\*\*



```

● Course title

● % completed

● Lesson list + status icons

● Show a dditional attachments under lesson n ame

● Button/icon to show/hid e sidebar

```

\*\*Main area\*\*



```

● Lesson title

● Lesson description (shown a t top)

● Vie wer area:

○ Vid eo p la yer / Document viewer / Image viewer / Quiz intro/questions

```

\*\*Buttons\*\*





```

● Back (go b ack to My Cours es page)

● Next Content (move to next lesson)

```

\### B6) Quiz on Learner Side



Quiz is done inside the full-screen p layer.



\*\*Quiz intro screen\*\*



```

● Shows total questions

● Shows “Multiple a ttempts”

● Button: Start Quiz

```

\*\*Question pages\*\*



```

● One question per page

● User selects an option a nd clicks Proceed

● Last question b utton b ecomes Proceed and Complete Quiz

```

After completing q uiz:



```

● Quiz b ecomes completed (tick in sidebar)

● User earns points b ased o n attempt reward rules

```

\### B7) Points Popup + Course Completion



When learn er earn s points (usually a fter quiz):



```

● Show p opup: “You h ave earned X p oints”

● Show p rogress to n ext rank

```

When a ll lessons are comple ted:



```

● Show b utton: Complete this course

● Clicking it marks the course a s completed.

```



\### Publishing



```

● Only p ublished courses appear on the website/app.

```

\### Visibility



```

● Everyone: course v isible to all

● Signed In: only logged-in users can see

```

\### Access



```

● Open: user can start normally

● On Invitation: only invited/enrolled u sers can a ccess lessons

```

\### Progress



```

● Track lesson c ompletion a nd show:

○ completed/incomplete status per lesson

○ course % completion

```

\### Quiz attempts \& points



```

● Multiple attempts a llowed

● Points reduce with more attempts based o n the rewards settings

● Total points decide badge level

```

\## Why This Hackathon Problem is Important



\# 4) Rules (Simple and Clear)





\*\*Real-world learning workflow:\*\* Shows how a comple te learning p latform work s

end-to-end (Course setup → P ublish → Enro llment/Access → Learning player →

Quiz → C ompletion → R evie ws → R eporting).



\*\*Business logic focus:\*\* Teaches handling real product rules like v isibility vs invitation

access, progress calculation, attempt-based scoring, points/badges, and reporting

accuracy — n ot just UI screens.



\*\*Industry-ready system thinking:\*\* Builds a p ro duction-like solution with role-based

permissions, structured c onte nt management, downloadable resources control,

gamification, and a naly tics dashboards that reflect actual user behavior.



\#### Mockup: https://link.excalidraw.com/l/65VNwvy7c4X/1lPnE6enQuF







