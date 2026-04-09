from contextlib import asynccontextmanager
from fastapi import FastAPI
from db import engine
from tables import Base
from auth import router as auth_router
from prediction import router as prediction_router
from model_store import attach_models_to_app
from mcp_server import mcp


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    attach_models_to_app(app)

    async with mcp.session_manager.run():
        yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(prediction_router)
app.mount("/mcp", mcp.streamable_http_app())