from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Qdrant Configuration
    QDRANT_URL: str
    QDRANT_API_KEY: str

    # LLM API Keys
    HUGGINGFACEHUB_API_TOKEN: str = ""
    GOOGLE_API_KEY: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_ENDPOINT: str = ""

    # Qdrant Collections
    VIDEO_CHUNKS_COLLECTION: str = "video_chunks"
    USER_DOUBTS_COLLECTION: str = "user_doubts"

    # Embedding Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50

    # LLM Configuration
    LLM_PROVIDER: str = "huggingface"  # Options: google, huggingface, azure
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    HUGGINGFACE_MODEL: str = "openai/gpt-oss-20b"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()