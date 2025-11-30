from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from app.config import settings


class NoteService:
    def __init__(self):
        self.llm_provider = settings.LLM_PROVIDER

        if self.llm_provider == "google":
            self.model = ChatGoogleGenerativeAI(
                google_api_key=settings.GOOGLE_API_KEY,
                model=settings.GEMINI_MODEL,
                temperature=settings.TEMPERATURE,
                max_output_tokens=settings.MAX_TOKENS,
                convert_system_message_to_human=True
            )
        elif self.llm_provider == "huggingface":
            llm = HuggingFaceEndpoint(
                repo_id=settings.HUGGINGFACE_MODEL,
                huggingfacehub_api_token=settings.HUGGINGFACEHUB_API_TOKEN,
                temperature=settings.TEMPERATURE,
                max_new_tokens=settings.MAX_TOKENS
            )
            self.model = ChatHuggingFace(llm=llm)

    def generate_notes(self, video_chunks: List[Dict], doubts: List[Dict]) -> str:
        """
        Generate comprehensive study notes including:
        1. Full video summary (point-wise)
        2. Specific review of weak areas (based on user doubts), ONLY if doubts exist.
        """

        # 1. Prepare full transcript text
        transcript_text = "\n".join([chunk['text'] for chunk in video_chunks])

        # 2. Prepare doubt context (Conditional)
        weak_areas_instruction = ""

        if doubts:
            questions = [f"- {d['question']}" for d in doubts]
            doubt_list = "\n".join(questions)

            weak_areas_instruction = f"""
## 3. 💡 Weak Areas Review
(Review the video content to address the following student doubts:
{doubt_list}
IMPORTANT: Only address doubts that are actually relevant to the provided video transcript. If a doubt is unrelated to the video, ignore it. If no doubts are relevant, omit this entire section.)
"""

        # 3. Construct Prompt
        prompt = f"""You are an expert AI tutor creating study notes for a student.

Based on the provided Video Transcript, create a set of high-quality study notes.

The notes must follow this exact Markdown structure:

# 📚 Study Notes

## 1. 📝 Executive Summary
(A concise 3-5 sentence summary of the entire video)

## 2. 🔑 Key Concepts & Summary
(A detailed, point-wise summary of the video content. Break down complex topics into bullet points.)
{weak_areas_instruction}

---
**Video Transcript:**
{transcript_text}

**Constraint:** Return ONLY the raw Markdown content. Do not wrap it in markdown code blocks (```markdown). Do not include any conversational text like "Here are your notes".
"""

        try:
            response = self.model.invoke(prompt)
            content = response.content.strip()

            # Post-processing to ensure clean Markdown
            if content.startswith("```markdown"):
                content = content.split("```markdown")[1]
            if content.startswith("```"):
                content = content.split("```")[1]
            if content.endswith("```"):
                content = content.rsplit("```", 1)[0]

            return content.strip()

        except Exception as e:
            return f"# Error\nCould not generate notes: {str(e)}"