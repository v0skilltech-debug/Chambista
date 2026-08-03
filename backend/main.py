from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, ai, conversations, clientes, users, providers, search, bookings, reviews, payments, notifications, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chambista API Modular")

import os

# Determinar los orígenes permitidos. Permitimos localhost y cualquier URL de frontend configurada
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    FRONTEND_URL
]
# Si quieres permitir todos temporalmente, descomenta la siguiente línea y comenta la de arriba.
allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(providers.router, prefix="/api/providers", tags=["providers"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["clientes"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(conversations.router, prefix="/api/chat", tags=["chat"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Chambista API Modular"}
