from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    SessionCreate, SessionResponse,
    QuestionRequest, QuestionResponse,
    QuizResponse, QuizSubmission, QuizResult,
    UserDoubt, QuizQuestion
)
from app.services.transcript_service import TranscriptService
from app.services.vector_service import VectorService
from app.services.qa_service import QAService
from app.services.quiz_service import QuizService
from app.config import settings  # <--- Added this missing import
import uuid
from datetime import datetime

router = APIRouter()

# Initialize services
transcript_service = TranscriptService()
vector_service = VectorService()
qa_service = QAService()
quiz_service = QuizService()

# In-memory session storage (for MVP - use DB in production)
sessions_store = {}


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(session_data: SessionCreate):
    """
    Start a new learning session with a YouTube video
    - Extracts video ID
    - Fetches and indexes transcript if not already done
    - Returns session_id for subsequent requests
    """
    try:
        # Extract video ID
        video_id = transcript_service.extract_video_id(session_data.youtube_url)
        if not video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid YouTube URL"
            )

        # Generate session ID
        session_id = str(uuid.uuid4())

        # Check if transcript already indexed
        transcript_loaded = vector_service.check_video_exists(video_id)

        if not transcript_loaded:
            # Fetch transcript
            try:
                transcript = transcript_service.fetch_transcript(video_id)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Could not fetch transcript. Video may not have captions: {str(e)}"
                )

            # Chunk transcript
            chunks = transcript_service.chunk_transcript(transcript)

            # Store in vector DB
            vector_service.store_video_chunks(video_id, chunks)

            # Calculate duration
            duration = transcript_service.get_video_duration(transcript)
            transcript_loaded = True
        else:
            duration = None

        # Store session
        sessions_store[session_id] = {
            "session_id": session_id,
            "video_id": video_id,
            "created_at": datetime.utcnow(),
            "quiz_questions": None  # Store quiz here when generated
        }

        return SessionResponse(
            session_id=session_id,
            video_id=video_id,
            video_title=None,  # Could fetch from YouTube API if needed
            duration_seconds=duration,
            transcript_loaded=transcript_loaded
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.post("/sessions/{session_id}/questions", response_model=QuestionResponse)
async def ask_question(session_id: str, question_data: QuestionRequest):
    """
    Ask a question about the video content
    - Retrieves relevant context from transcript
    - Generates answer using LLM
    - Stores doubt for personalized quiz generation
    """
    try:
        # Validate session
        if session_id not in sessions_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session = sessions_store[session_id]
        video_id = session['video_id']

        # Search for relevant chunks
        context_chunks = vector_service.search_video_chunks(
            video_id=video_id,
            query=question_data.question,
            top_k=3
        )

        if not context_chunks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No relevant content found in video"
            )

        # Generate answer
        answer = qa_service.generate_answer(
            question=question_data.question,
            context_chunks=context_chunks
        )

        # Extract topic
        topic = qa_service.extract_topic(question_data.question, answer)

        # Store doubt
        doubt = UserDoubt(
            session_id=session_id,
            video_id=video_id,
            question=question_data.question,
            answer=answer,
            timestamp_sec=question_data.timestamp_sec,
            topic=topic
        )
        vector_service.store_user_doubt(doubt)

        # Return answer with most relevant timestamp
        relevant_timestamp = int(context_chunks[0]['start_time_sec']) if context_chunks else None

        return QuestionResponse(
            answer=answer,
            relevant_timestamp=relevant_timestamp,
            confidence=context_chunks[0]['score'] if context_chunks else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {str(e)}"
        )


@router.get("/sessions/{session_id}/quiz", response_model=QuizResponse)
async def generate_quiz(session_id: str, num_questions: int = 5):
    """
    Generate a personalized quiz based on user's doubts
    - Analyzes questions asked during the session
    - Identifies weak topics
    - Creates targeted quiz questions
    """
    try:
        # Validate session
        if session_id not in sessions_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session = sessions_store[session_id]
        video_id = session['video_id']

        # Get all doubts for this session
        doubts = vector_service.get_session_doubts(session_id)

        # Logic: If no doubts -> General Quiz (10 MCQs from video)
        #        If doubts    -> Personalized Quiz (Prioritize doubts + fill from video)

        if not doubts:
            # Case 1: No Doubts (General Quiz)


            # Context: Search for broad topics to get a summary view of the video
            video_chunks = vector_service.search_video_chunks(
                video_id=video_id,
                query="Summary of key concepts and main topics",
                top_k=num_questions*2  # Get enough context for 10 questions
            )
        else:
            # Case 2: Doubts Exist (Personalized Quiz)

            # Context: Focus on the doubts
            sample_chunk = doubts[0]
            video_chunks = vector_service.search_video_chunks(
                video_id=video_id,
                query=sample_chunk['question'],
                top_k=5
            )

        # Generate quiz
        quiz_data = quiz_service.generate_quiz(
            doubts=doubts,
            video_chunks=video_chunks,
            num_questions=num_questions
        )

        # Store quiz questions in session for evaluation
        sessions_store[session_id]['quiz_questions'] = quiz_data['questions']

        # Remove correct answers from response
        questions_for_response = [
            QuizQuestion(
                question_id=q['question_id'],
                question_text=q['question_text'],
                question_type=q['question_type'],
                options=q.get('options'),
                topic=q.get('topic')
            )
            for q in quiz_data['questions']
        ]

        return QuizResponse(
            session_id=session_id,
            video_id=video_id,
            questions=questions_for_response,
            total_questions=len(questions_for_response),
            weak_topics=quiz_data.get('weak_topics', [])
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


@router.post("/sessions/{session_id}/quiz/submit", response_model=QuizResult)
async def submit_quiz(session_id: str, submission: QuizSubmission):
    """
    Submit and evaluate quiz answers
    - Auto-grades MCQs
    - Uses LLM to evaluate short answers
    - Provides detailed feedback
    """
    try:
        # Validate session
        if session_id not in sessions_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session = sessions_store[session_id]

        # Get stored quiz questions
        if not session.get('quiz_questions'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No quiz found for this session. Generate a quiz first."
            )

        questions = session['quiz_questions']

        # Evaluate quiz
        result = quiz_service.evaluate_quiz(
            questions=questions,
            answers=[ans.dict() for ans in submission.answers]
        )

        return QuizResult(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate quiz: {str(e)}"
        )


@router.delete("/admin/reset-vectorstore", status_code=status.HTTP_200_OK)
async def reset_vectorstore():
    """
    Reset all Qdrant collections (DELETE ALL DATA)
    Use with caution - this will delete all transcripts and doubts
    """
    try:
        vector_service.reset_collections()

        # Also clear in-memory sessions
        sessions_store.clear()

        return {
            "message": "Vector store reset successfully",
            "collections_reset": [
                settings.VIDEO_CHUNKS_COLLECTION,
                settings.USER_DOUBTS_COLLECTION
            ],
            "sessions_cleared": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset vector store: {str(e)}"
        )