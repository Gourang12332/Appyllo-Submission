from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = "mongodb+srv://Gourang:Gourang321@cluster0.ezmqnxi.mongodb.net/?appName=Cluster0"
client = AsyncIOMotorClient(MONGO_URI)
db = client["poll_app"]
polls_col = db["polls"]
votes_col = db["votes"]

connections = {}

class CreatePoll(BaseModel):
    question: str
    options: list[str]

class Vote(BaseModel):
    poll_id: str
    option_id: int

@app.post("/poll/create")
async def create_poll(data: CreatePoll):
    poll_id = str(uuid.uuid4())[:6]
    poll = {
        "_id": poll_id,
        "question": data.question,
        "options": data.options,
        "votes": [0] * len(data.options)
    }
    await polls_col.insert_one(poll)
    return {
        "poll_id": poll_id,
        "share_link": f"https://appyllo-submission.vercel.app/{poll_id}"
    }

@app.get("/poll/{poll_id}")
async def get_poll(poll_id: str):
    poll = await polls_col.find_one({"_id": poll_id})
    if poll:
        poll["poll_id"] = poll["_id"]
        del poll["_id"]
    return poll

@app.post("/poll/vote")
async def vote(data: Vote, request: Request):
    ip = request.client.host

    already = await votes_col.find_one({
        "poll_id": data.poll_id,
        "ip": ip
    })

    if already:
        return {"message": "Already voted"}

    await votes_col.insert_one({
        "poll_id": data.poll_id,
        "ip": ip
    })

    await polls_col.update_one(
        {"_id": data.poll_id},
        {"$inc": {f"votes.{data.option_id}": 1}}
    )

    poll = await polls_col.find_one({"_id": data.poll_id})

    if data.poll_id in connections:
        for ws in connections[data.poll_id]:
            await ws.send_json({
                "poll_id": data.poll_id,
                "results": poll["votes"]
            })

    return {"message": "Vote recorded"}

@app.websocket("/ws/poll/{poll_id}")
async def websocket_endpoint(ws: WebSocket, poll_id: str):
    await ws.accept()
    connections.setdefault(poll_id, []).append(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        connections[poll_id].remove(ws)
