# StudyHub

> Developed by [Nickolas Bleykhman, Akksharvan Senthilkumar, Kamal Deep Vasireddy, Joseph Zheng]() for COMP 426: Modern Web Programming at UNC-Chapel Hill.


![TypeScript](https://img.shields.io/badge/-TypeScript-05122A?style=flat&logo=typescript)
![Next.js](https://img.shields.io/badge/-Next.js-05122A?style=flat&logo=nextdotjs)
![Shadcn/ui](https://img.shields.io/badge/-Shadcn_UI-05122A?style=flat&logo=shadcnui)
![Tailwind](https://img.shields.io/badge/-Tailwind-05122A?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/-Supabase-05122A?style=flat&logo=supabase)

<img width="700" alt="message 2 sent" src="https://github.com/user-attachments/assets/fb86a644-e40b-44b4-9ffc-bb713e00e816" />

---

### Welcome, <br>
to the new frontier of studying.

## 🚀 Features

### 🔍 Collaborative Study Rooms

We wish for students to interact more with their peers. Collaborative study rooms would fulfill this much needed role in the education space. 

Collaborative study rooms are like group chat rooms on popular social media platforms, however education-oriented. Students are encouraged to share thoughts, collaborate, and post helpful material to their peers in these rooms.

#### Intended User: Students

---

### 📚 Resource Repository

Ever felt lost in a class before? The student-ran resource repository will have all the resources you’ll ever need to catch up.  

The resource repository is intended to serve as a helpful guide to students in a variety of courses. Whether it be math or biology, students can upload study material for their peers to view.

Moreover, it is clear that sources of study material on designated sites have become rare, where most of them are locked behind a paywall. With StudyHub’s resource repository, we hope to allow more freedom to our students.

#### Intended User: Students

---

### 👩🏫 Peer-to-Peer Tutoring

Are office-hours not fitting to your schedule, or maybe you’re not understanding EVERY concept your professor is yapping about? The peer-to-peer tutoring service on StudyHub is intended to guide students with the help of student-educators.

We not only want to provide a hub for students to collaborate, but also a place for educators to thrive as well. It’s a perfect opportunity for educators to enhance their teaching ability and students to achieve better understanding of course materials.

#### Intended User: Students, Educators

---

### 💬 Discussion Forums

Want an impromptu chat room where you can stay anonymous? Discussion forums are the perfect gateway to ask questions and share thoughts and ideas about course material, lecture, etc.

These forums would be an easy way to give questions and answers without needing to log or sign in to StudyHub, making it a convenient way to join and collaborate on whatever it might be.

#### Intended User: Students

---

### 🤖 In-App Chatbot

Maybe you don’t want to talk to anyone, but have questions you desperately want answered. StudyHub will host an in-app chatbot to help out with homework, conceptual; or any question in general.

We desire an environment that coalesces learning, so what better way than to host a permanent buddy to answer your questions.

#### Intended User: Students

---

## 🗄️ Backend Data Schema

Our database structure:

![comp426schema1](https://github.com/user-attachments/assets/99960707-61c7-4b7c-ae3f-258de5a799aa)

![comp426schema2](https://github.com/user-attachments/assets/414b5e49-8640-4cc8-8c62-afc4dd6eec7c)

![comp426schema3](https://github.com/user-attachments/assets/94c45976-b4b6-4f80-86ae-38cc7670ed29)

## 🎨 High-Fidelity Prototype

We've used Figma to create a basic mock-up of three of our features:

Our template:

<img width="700" alt="template" src="https://github.com/user-attachments/assets/6a81cb3d-5782-4695-a999-bd8cfc4e06aa" />


### Collaborative Study Rooms

<img width="700" alt="Untitled" src="https://github.com/user-attachments/assets/4ef0380d-4ca6-4310-a7b4-c39d4bde29c0" />


1. Here, 'user' clicks 'Project Help' channel under COMP426-SP25's course drop-down.
<br>

<img width="700" alt="input" src="https://github.com/user-attachments/assets/1a5c5492-0f1e-457f-8718-a2da41e6cfe6" />


2. 'user' sends in a message, which shows to every user in the channel, shown on the right.
<br>

<img width="700" alt="message 1 sent" src="https://github.com/user-attachments/assets/e4c282c3-4056-4551-b9ca-064a9b95f901" />


3. Underneath the chatbox, you can see another person, 'user2' typing.
<br>

<img width="700" alt="message 2 sent" src="https://github.com/user-attachments/assets/ba17d4e4-88fa-4e18-9322-c63c214ed88d" />


4. When 'user2' finishes typing, they upload their message in realtime, allowing 'user' to get live-updates from the channel.
<br>

<img width="700" alt="join new group" src="https://github.com/user-attachments/assets/a594c9c5-4fed-4c7e-ab5b-6e9f58b73e52" />


5. 'user' wants to join another channel. A form pops up, allowing 'user' to choose a course subject, its number, and a room code to join a specific channel. Finally, 'user' can mark the checkbox to be declared as an educator.
<br>

<img width="700" alt="new group added" src="https://github.com/user-attachments/assets/6c4cbd25-6d9e-4e6e-8bd3-65742e85e717" />


6. 'user' then joins a new channel.
<br>

<img width="700" alt="message 3 sent" src="https://github.com/user-attachments/assets/5a45ac7e-d78c-4127-90a6-4b8c01454c15" />


7. Here, functionality extends across different channels.


### Resource Repository
** make instructions for resource repo here **


### Peer-to-Peer Tutoring

<img width="700" alt="template" src="https://github.com/user-attachments/assets/486c7ce7-5c7a-43b1-8d6c-ff83a54928e2" />


1. This is 'user's screen.
<br>

<img width="700" alt="add tutoring" src="https://github.com/user-attachments/assets/886c257f-e921-4f43-93f7-306be9f9b134" />


2. 'user' clicks the '+' button beside tutoring to request a tutor, where a form pops up.
<br>

<img width="700" alt="tutoring request confirm" src="https://github.com/user-attachments/assets/41c94cab-6d52-4dd1-9cc7-e43fb20413db" />


3. After filling out the form, 'user' is prompted with a resolution form.
<br>

<img width="700" alt="user2 portal" src="https://github.com/user-attachments/assets/c88e2560-003e-4b99-beda-29c752f7355c" />


4. Switching to 'user2', they receive a request under 'Tutoring Requests"
<br>

<img width="700" alt="user2 clicked request" src="https://github.com/user-attachments/assets/2bd801ec-415e-41be-88f5-371eaeb23ead" />


5. After 'user2' clicks on it, they are displayed two choices, to either accept or deny it.
<br>

<img width="700" alt="user2 accepted request" src="https://github.com/user-attachments/assets/6ddb9300-6579-4c2a-9984-f1ac78b2e5fc" />


6. 'user2' accepts the request, guiding them to a newly created two-person channel. There's also a note for the tutor to refer back to 'user's original request.
<br>

<img width="700" alt="user2 raise question" src="https://github.com/user-attachments/assets/4bea47aa-4d3c-47f1-a85a-beafe5c28984" />


7. 'user' is proceeding to type their message.
<br>

<img width="700" alt="user message" src="https://github.com/user-attachments/assets/8484b034-686c-4b6b-bfc1-2cbc61f1d0f4" />


8. Like a regular channel, 'user2' can see 'user's message after posting. If the educator decides to end the conversation, they can hit the 'Close Request' button underneath the user board to the right.
<br>

<img width="700" alt="user2 closing request" src="https://github.com/user-attachments/assets/df6ab4ee-b2a7-4109-911d-dc88ff6c0d6c" />


9. A warning screen appears for 'user2' when closing this conversation.
<br>

<img width="700" alt="user2 portal after closing" src="https://github.com/user-attachments/assets/4a267d7b-4e32-4a2e-b171-b04f540d1e24" />


10. After hitting 'Continue', user2 is then greeted with their StudyHub portal, where no requests lie in 'Tutoring Requests' on the left sidebar.
