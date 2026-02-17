# 🗳️ Real-Time Poll Rooms

A full-stack web application that allows users to create polls, share them via a link, and collect votes with **real-time result updates** for all participants.

Built using **FastAPI (backend)**, **Next.js (frontend)**, **MongoDB (database)**, and **WebSockets** for live communication.

---

## 🚀 Features

- Create a poll with a question and multiple options  
- Generate a shareable link for each poll  
- Vote on polls (single choice)  
- See results update in **real time** without refreshing  
- Fairness mechanisms to prevent abuse  
- Persistent storage using MongoDB  
- Fully deployable (Render + Vercel)

---

## 🛠️ Tech Stack

### Frontend
- Next.js (React)
- Deployed on **Vercel**

### Backend
- FastAPI (Python)
- WebSockets for real-time updates
- Deployed on **Render**

### Database
- MongoDB (Atlas)
- Motor (async MongoDB driver)

---

## 🧠 System Architecture

```text
Next.js (Client)
     |
     | REST API (HTTP)
     |
FastAPI (Backend)
     |
     | WebSocket (Real-time)
     |
MongoDB (Database)
```
## API Endpoints
1. Create Poll

POST /poll/create

{
  "question": "Which language do you prefer?",
  "options": ["C++", "Java", "Python"]
}


Response:

{
  "poll_id": "a8f3k2",
  "share_link": "http://localhost:3000/poll/a8f3k2"
}

2. Get Poll

GET /poll/{poll_id}

Returns poll details and current votes.

3. Vote

POST /poll/vote

{
  "poll_id": "a8f3k2",
  "option_id": 2
}

4. WebSocket (Real-Time)

ws://backend-url/ws/poll/{poll_id}

## Clients receive:

{
  "poll_id": "a8f3k2",
  "results": [5, 3, 10]
}

##  Fairness / Anti-Abuse Mechanisms

We implemented two fairness controls:

1. IP-based restriction (Backend)

Each vote stores (poll_id, ip) in MongoDB

A unique compound index ensures:

One IP can vote only once per poll

2. Browser-based restriction (Frontend)

After voting, a key is stored in localStorage:

voted_<poll_id>


This disables the voting UI for that poll.

What this prevents:

Refresh spam

Multiple clicks

Basic bot abuse

Known limitations:

Users can use VPN to change IP

Users can clear browser storage

These are acceptable trade-offs for a college-level system.

# Database Schema
Collection: polls
{
  "_id": "a8f3k2",
  "question": "Which language do you prefer?",
  "options": ["C++", "Java", "Python"],
  "votes": [5, 3, 10]
}

Collection: votes
{
  "poll_id": "a8f3k2",
  "ip": "192.168.1.10"
}


Unique index:

db.votes.createIndex(
  { poll_id: 1, ip: 1 },
  { unique: true }
)

##  Running Locally
Backend
pip install -r requirements.txt
uvicorn main:app --reload

## Frontend
npm install
npm run dev

## requirements.txt
fastapi
uvicorn[standard]
motor
pydantic
python-dotenv
