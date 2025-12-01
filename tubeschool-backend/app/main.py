from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import sessions
import logging
import time

# Configure logging for debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TubeSchool API",
    description="Transform YouTube videos into personalized learning experiences",
    version="1.0.0",
    debug=True  # Enable debug mode
)


# Request logging middleware for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.debug(f"Request: {request.method} {request.url}")
    logger.debug(f"Headers: {request.headers}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.debug(f"Response status: {response.status_code}")
    logger.debug(f"Process time: {process_time:.4f}s")

    return response


# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sessions.router, prefix="/api/v1", tags=["sessions"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to TubeSchool API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}