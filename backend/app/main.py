from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import machine_routes, technician_routes, ticket_routes, dashboard_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Factory Maintenance Ticketing System",
    description="FastAPI backend for factory maintenance tickets with AI-assisted priority and root cause suggestion.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(machine_routes.router)
app.include_router(technician_routes.router)
app.include_router(ticket_routes.router)
app.include_router(dashboard_routes.router)


@app.get("/")
def root():
    return {
        "message": "AI-Powered Factory Maintenance Ticketing System API is running"
    }