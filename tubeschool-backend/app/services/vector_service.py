from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import uuid
from app.config import settings
from app.models.schemas import VideoChunk, UserDoubt


class VectorService:
    def __init__(self):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )
        self.encoder = SentenceTransformer(settings.EMBEDDING_MODEL)
        self.vector_size = 384  # all-MiniLM-L6-v2 dimension

        # Initialize collections
        self._ensure_collections()

    def _ensure_collections(self):
        """Create collections if they don't exist"""
        from qdrant_client.models import PayloadSchemaType

        collections = [c.name for c in self.client.get_collections().collections]

        if settings.VIDEO_CHUNKS_COLLECTION not in collections:
            self.client.create_collection(
                collection_name=settings.VIDEO_CHUNKS_COLLECTION,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )
            # Create payload index for video_id filtering
            self.client.create_payload_index(
                collection_name=settings.VIDEO_CHUNKS_COLLECTION,
                field_name="video_id",
                field_schema=PayloadSchemaType.KEYWORD
            )
        else:
            # If collection exists, ensure index exists
            try:
                self.client.create_payload_index(
                    collection_name=settings.VIDEO_CHUNKS_COLLECTION,
                    field_name="video_id",
                    field_schema=PayloadSchemaType.KEYWORD
                )
            except:
                pass  # Index might already exist

        if settings.USER_DOUBTS_COLLECTION not in collections:
            self.client.create_collection(
                collection_name=settings.USER_DOUBTS_COLLECTION,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )
            # Create payload indexes for filtering
            self.client.create_payload_index(
                collection_name=settings.USER_DOUBTS_COLLECTION,
                field_name="session_id",
                field_schema=PayloadSchemaType.KEYWORD
            )
            self.client.create_payload_index(
                collection_name=settings.USER_DOUBTS_COLLECTION,
                field_name="video_id",
                field_schema=PayloadSchemaType.KEYWORD
            )
        else:
            # If collection exists, ensure indexes exist
            try:
                self.client.create_payload_index(
                    collection_name=settings.USER_DOUBTS_COLLECTION,
                    field_name="session_id",
                    field_schema=PayloadSchemaType.KEYWORD
                )
                self.client.create_payload_index(
                    collection_name=settings.USER_DOUBTS_COLLECTION,
                    field_name="video_id",
                    field_schema=PayloadSchemaType.KEYWORD
                )
            except:
                pass  # Indexes might already exist

    def reset_collections(self):
        """Delete and recreate collections (useful for development/testing)"""
        try:
            self.client.delete_collection(settings.VIDEO_CHUNKS_COLLECTION)
        except:
            pass

        try:
            self.client.delete_collection(settings.USER_DOUBTS_COLLECTION)
        except:
            pass

        self._ensure_collections()
        print("✅ Collections reset successfully!")

    def check_video_exists(self, video_id: str) -> bool:
        """Check if video transcript is already indexed"""
        try:
            results = self.client.scroll(
                collection_name=settings.VIDEO_CHUNKS_COLLECTION,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="video_id",
                            match=MatchValue(value=video_id)
                        )
                    ]
                ),
                limit=1
            )
            return len(results[0]) > 0
        except:
            return False

    def store_video_chunks(self, video_id: str, chunks: List[Dict]):
        """Store video transcript chunks in Qdrant"""
        points = []

        for chunk in chunks:
            text = chunk['text']
            vector = self.encoder.encode(text).tolist()

            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=vector,
                payload={
                    "video_id": video_id,
                    "chunk_index": chunk['chunk_index'],
                    "text": text,
                    "start_time_sec": chunk['start_time_sec'],
                    "end_time_sec": chunk['end_time_sec']
                }
            )
            points.append(point)

        self.client.upsert(
            collection_name=settings.VIDEO_CHUNKS_COLLECTION,
            points=points
        )

    def search_video_chunks(
            self,
            video_id: str,
            query: str,
            top_k: int = 3
    ) -> List[Dict]:
        """Search relevant chunks for a question"""
        from qdrant_client.models import QueryRequest

        query_vector = self.encoder.encode(query).tolist()

        results = self.client.query_points(
            collection_name=settings.VIDEO_CHUNKS_COLLECTION,
            query=query_vector,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="video_id",
                        match=MatchValue(value=video_id)
                    )
                ]
            ),
            limit=top_k,
            with_payload=True
        )

        return [
            {
                "text": point.payload['text'],
                "start_time_sec": point.payload['start_time_sec'],
                "end_time_sec": point.payload['end_time_sec'],
                "score": point.score
            }
            for point in results.points
        ]

    def store_user_doubt(self, doubt: UserDoubt):
        """Store user's question in doubts collection"""
        vector = self.encoder.encode(doubt.question).tolist()

        point = PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload=doubt.dict()
        )

        self.client.upsert(
            collection_name=settings.USER_DOUBTS_COLLECTION,
            points=[point]
        )

    def get_session_doubts(self, session_id: str) -> List[Dict]:
        """Retrieve all doubts for a session"""
        results = self.client.scroll(
            collection_name=settings.USER_DOUBTS_COLLECTION,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="session_id",
                        match=MatchValue(value=session_id)
                    )
                ]
            ),
            limit=100
        )

        return [point.payload for point in results[0]]

    def get_all_video_chunks(self, video_id: str) -> List[Dict]:
        """Retrieve all transcript chunks for a video, sorted by index"""
        chunks = []
        next_page_offset = None

        # Qdrant scroll API to fetch all records
        while True:
            results, next_page_offset = self.client.scroll(
                collection_name=settings.VIDEO_CHUNKS_COLLECTION,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="video_id",
                            match=MatchValue(value=video_id)
                        )
                    ]
                ),
                limit=100,  # Fetch 100 at a time
                offset=next_page_offset,
                with_payload=True
            )

            chunks.extend([point.payload for point in results])

            if next_page_offset is None:
                break

        # Sort by chunk_index to ensure order so the transcript is continuous
        return sorted(chunks, key=lambda x: x['chunk_index'])