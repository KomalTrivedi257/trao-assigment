# AI Interview Prep Kit

An AI-powered interview preparation platform that researches a company's public website, analyzes a job description, generates requirement-specific interview questions, creates flashcards, checks requirement coverage, and builds a day-wise preparation schedule.

## Live Demo

**Frontend:** https://trao-assigment.vercel.app/

**Backend:** https://trao-assigment.onrender.com

**GitHub:** https://github.com/KomalTrivedi257/trao-assigment

---

## Features

### Authentication

* User registration and login
* Password hashing with bcrypt
* JWT-based authentication
* Protected interview kit APIs
* Users can access only their own kits

### Interview Kit Generation

The application accepts:

* Job Description
* Company website URL
* Number of days until the interview

It then generates a structured preparation kit containing:

* Company brief
* Role information
* Extracted requirements
* Technical questions
* Behavioural questions
* System-design questions
* Company-fit questions
* Answer outlines
* Flashcards
* Requirement coverage
* Day-wise preparation schedule

### Company Research

The backend dynamically crawls the supplied company website.

It:

1. Fetches the provided company URL.
2. Extracts page content and links.
3. Ranks useful pages using relevance keywords.
4. Retrieves the most relevant pages.
5. Uses the collected content to create a company brief.

The crawler does not depend on hard-coded `/about`, `/careers`, or `/hiring` paths.

### Requirement Coverage

Each requirement receives a stable ID such as:

```text
r1
r2
r3
```

Questions reference the requirements they cover.

The application deterministically checks:

* Which requirements are covered
* Which requirements remain uncovered
* How many coverage passes were performed

If must-have requirements remain uncovered, another question-generation pass is triggered.

### Kit Builder

Users can edit generated content directly.

Supported actions include:

* Edit questions
* Edit answer outlines
* Change question category
* Pin questions
* Delete questions
* Reorder questions
* Edit flashcards
* Save changes
* Regenerate individual question categories

User edits are represented using question state information such as:

```json
{
  "generated": true,
  "edited": true,
  "pinned": false
}
```

This allows generated content and user modifications to remain distinguishable.

### Practice Mode

Practice Mode provides:

* One flashcard at a time
* Answer reveal
* Confidence score from 1–5
* Covered/uncovered tracking
* Progress tracking

Confidence is stored with each flashcard so future practice can prioritize weaker areas.

### Day-wise Schedule

The schedule is generated for exactly the requested number of days.

Each day contains:

```json
{
  "day": 1,
  "focus": "React and JavaScript fundamentals",
  "question_ids": ["q1", "q2"],
  "minutes": 60
}
```

Scheduling uses deterministic logic rather than asking the LLM to perform arithmetic.

---

# Generation Pipeline

The application intentionally uses multiple stages instead of sending one large prompt to the LLM.

```text
Job Description
      |
      v
Requirement Extraction
      |
      v
Company URL Retrieval
      |
      v
Relevant Page Ranking
      |
      v
Company Brief Generation
      |
      v
Question Generation
      |
      v
Coverage Check
      |
      v
Missing Requirement Questions
      |
      v
Flashcard Generation
      |
      v
Deterministic Schedule
      |
      v
Validation
      |
      v
Save Interview Kit
```

This sequencing makes the generated kit more controllable and easier to validate.

---

# Tech Stack

## Frontend

* Next.js
* React
* Tailwind CSS
* JavaScript

## Backend

* Node.js
* Express.js
* JavaScript

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT
* bcryptjs

## AI

* Groq API
* Model: `openai/gpt-oss-20b`

## Web Retrieval

* Axios
* Cheerio

## Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB Atlas — Database

---

# Project Structure

```text
trao-interview-prep/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── page.js
│   │   │
│   │   └── components/
│   │       ├── KitBuilder.js
│   │       └── PracticeMode.js
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# Local Setup

## 1. Clone the repository

```bash
git clone https://github.com/KomalTrivedi257/trao-assigment.git
cd trao-assigment
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Environment Variables

Never commit `.env` files or API keys to GitHub.

Required backend variables:

| Variable         | Purpose                  |
| ---------------- | ------------------------ |
| `PORT`           | Backend server port      |
| `MONGODB_URI`    | MongoDB Atlas connection |
| `JWT_SECRET`     | JWT signing secret       |
| `JWT_EXPIRES_IN` | JWT expiration           |
| `GROQ_API_KEY`   | Groq API authentication  |

---

# Interview Kit Structure

Generated kits follow a predictable structure.

```json
{
  "source": {
    "company": "",
    "company_url": "",
    "role": "",
    "location": "",
    "jd_chars": 0,
    "researched_at": "",
    "pages_used": []
  },
  "company_brief": {
    "summary": "",
    "what_they_do": "",
    "sources": []
  },
  "role": {
    "title": "",
    "seniority": "",
    "responsibilities": [],
    "requirements": []
  },
  "questions": [],
  "flashcards": [],
  "schedule": {},
  "coverage": {}
}
```

---

# Requirement Representation

Requirements are represented with stable IDs.

Example:

```json
{
  "id": "r1",
  "text": "5+ years with React",
  "kind": "technical",
  "priority": "must"
}
```

Supported requirement types:

* `technical`
* `behavioural`
* `domain`

Supported priorities:

* `must`
* `nice`

Questions store the requirement IDs they cover:

```json
{
  "id": "q1",
  "requirement_ids": ["r1"],
  "category": "technical",
  "prompt": "Explain how you would optimize a large React application.",
  "answer_outline": "Discuss memoization, rendering, code splitting...",
  "difficulty": 2
}
```

This makes coverage deterministic instead of relying on an LLM to decide whether the kit is complete.

---

# Scheduling Approach

The LLM is not responsible for calculating the schedule arithmetic.

The backend determines:

* Number of requested days
* Question distribution
* Minutes per day
* Requirement coverage

Priority is given to:

1. Must-have requirements
2. Higher difficulty questions
3. Important technical areas

The generated schedule always contains exactly the requested number of days.

---

# Robustness and Edge Cases

The application is designed to handle:

* Invalid company URLs
* 404 pages
* Request timeouts
* Missing company pages
* Thin job descriptions
* No useful public company information
* No public interview discussions
* Invalid LLM JSON
* LLM generation failures
* API rate limits
* Duplicate kit generation
* Very short preparation periods
* Long preparation periods

When research information is unavailable, the application prefers producing a smaller honest result rather than inventing company information.

---

# Security Considerations

* Passwords are hashed before database storage.
* Protected APIs require JWT authentication.
* Kit ownership is checked before accessing user data.
* API keys are stored in environment variables.
* External URLs are treated as untrusted input.
* Retrieved website content is treated as data, not as instructions to the LLM.
* Production deployments do not expose secrets in frontend code.

---

# Batch Evaluation

The backend supports batch evaluation using:

```bash
npm run evaluate -- --input <cases.json> --output <kits.json>
```

Input format:

```json
[
  {
    "id": "case-1",
    "jd": "React developer with JavaScript and REST API experience...",
    "company_url": "https://example.com",
    "days": 5
  }
]
```

The output contains:

* Generation version
* Generation time
* Successful kits
* Failed cases
* Structured error information

This makes the generation pipeline easier to test across multiple job descriptions.

---

# API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Interview Kits

```text
GET    /api/kits
POST   /api/kits
GET    /api/kits/:id
PUT    /api/kits/:id
```

## Regeneration

```text
PUT /api/kits/:id/regenerate-questions
```

## Practice

```text
GET /api/practice/:kitId
PUT /api/practice/:kitId/:flashcardId
```

---

# Design Decisions

### Why Next.js?

Next.js provides a simple React application structure and works well for deployment on Vercel.

### Why Express?

Express keeps the backend simple and makes it easy to separate authentication, retrieval, generation, validation, and persistence.

### Why MongoDB?

The generated interview kit has nested structures such as requirements, questions, flashcards, coverage and schedules. MongoDB fits this document-oriented structure naturally.

### Why Groq?

Groq provides a fast API and a model with a useful free/low-cost development path for the assignment.

### Why a Multi-step Pipeline?

A single prompt would make it difficult to:

* Validate requirements
* Check coverage
* Regenerate missing areas
* Preserve user edits
* Debug failures
* Control scheduling

Breaking the process into stages makes each part easier to reason about and test.

---

# Limitations

* Public interview discussion retrieval is limited by external website availability and access restrictions.
* Some websites may block automated retrieval.
* Free-tier AI and hosting services may have rate limits or cold starts.
* The quality of generated questions depends on the quality of the supplied JD and accessible company information.
* Advanced interview discussion sources may not always be available.

---

# Future Improvements

Possible future improvements include:

* Better public interview discussion search
* More advanced website crawling
* Source-level reliability scoring
* Resume-to-JD matching
* Weak Spots Report based on practice confidence
* Calendar integration
* Interview simulation with voice
* More detailed analytics
* HttpOnly cookie-based authentication
* Background job processing for long-running generations

---

# Author

**Komal Trivedi**

Frontend / Full-Stack Developer

GitHub: https://github.com/KomalTrivedi257

````

### Ab kya karna hai

Isko project ke **root** me save karo:

```text
trao-interview-prep/
│
├── README.md   ← yahan
├── frontend/
└── backend/
````

Phir terminal me root folder se:

```bash
git add README.md
git commit -m "Add project README"
git push
```

Uske baad GitHub par README update ho jayega.

**Important:** README me abhi raw URLs hain; GitHub README ke liye ye bilkul normal hai. Submission se pehle **Live Demo links open karke verify** kar lena.
