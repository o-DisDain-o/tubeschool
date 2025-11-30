from youtube_transcript_api import YouTubeTranscriptApi
from typing import List, Dict, Optional
import re
from app.config import settings


class TranscriptService:
    def __init__(self):
        """Initialize the YouTube Transcript API client"""
        self.api = YouTubeTranscriptApi()

    @staticmethod
    def extract_video_id(youtube_url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
            r'youtube\.com\/embed\/([^&\n?#]+)',
            r'youtube\.com\/v\/([^&\n?#]+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        return None

    def fetch_transcript(self, video_id: str, languages: List[str] = None) -> List[Dict]:
        """
        Fetch transcript from YouTube using the new API

        :param video_id: YouTube video ID
        :param languages: List of language codes in priority order (default: ['en'])
        :return: List of transcript segments
        """
        if languages is None:
            languages = ['en']

        try:
            # Use the new fetch() method with language preference
            transcript = self.api.fetch(
                video_id=video_id,
                languages=languages,
                preserve_formatting=False
            )
            return transcript
        except Exception as e:
            # Try alternative: list all transcripts and pick the first available
            try:
                transcript_list = self.api.list(video_id)
                # Try to find transcript in preferred languages
                transcript = transcript_list.find_transcript(languages)
                return transcript.fetch()
            except Exception as inner_e:
                raise Exception(f"Failed to fetch transcript: {str(e)}. Alternative attempt: {str(inner_e)}")

    @staticmethod
    def chunk_transcript(
            transcript: List[Dict],
            chunk_size: int = None,
            chunk_overlap: int = None
    ) -> List[Dict]:
        """
        Split transcript into chunks with time boundaries
        """
        if chunk_size is None:
            chunk_size = settings.CHUNK_SIZE
        if chunk_overlap is None:
            chunk_overlap = settings.CHUNK_OVERLAP

        chunks = []
        current_chunk = ""
        current_start = None
        chunk_index = 0

        for i, entry in enumerate(transcript):
            text = entry.text
            start = entry.start
            duration = entry.duration

            if current_start is None:
                current_start = start

            current_chunk += " " + text

            # Check if chunk size is reached
            if len(current_chunk) >= chunk_size:
                chunks.append({
                    "chunk_index": chunk_index,
                    "text": current_chunk.strip(),
                    "start_time_sec": current_start,
                    "end_time_sec": start + duration
                })

                # Start new chunk with overlap
                overlap_text = current_chunk[-chunk_overlap:] if chunk_overlap > 0 else ""
                current_chunk = overlap_text
                current_start = start
                chunk_index += 1

        # Add remaining text as last chunk
        if current_chunk.strip():
            last_end = transcript[-1].start + transcript[-1].duration
            chunks.append({
                "chunk_index": chunk_index,
                "text": current_chunk.strip(),
                "start_time_sec": current_start,
                "end_time_sec": last_end
            })

        return chunks

    @staticmethod
    def get_video_duration(transcript: List[Dict]) -> int:
        """Calculate total video duration from transcript"""
        if not transcript:
            return 0
        last_entry = transcript[-1]
        return int(last_entry.start + last_entry.duration)