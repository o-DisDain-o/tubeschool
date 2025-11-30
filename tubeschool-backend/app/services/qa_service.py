from typing import List, Dict, Optional
from app.config import settings
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

class QAService:
    def __init__(self):

        self.llm_provider = settings.LLM_PROVIDER

        if self.llm_provider == "google":
            self.model = ChatGoogleGenerativeAI(google_api_key=settings.GOOGLE_API_KEY,
                model=settings.GEMINI_MODEL,
                temperature=settings.TEMPERATURE,
                max_output_tokens=settings.MAX_TOKENS,
                convert_system_message_to_human=True)
        elif self.llm_provider == "huggingface":
            llm = HuggingFaceEndpoint(
                repo_id=settings.HUGGINGFACE_MODEL,
                huggingfacehub_api_token=settings.HUGGINGFACEHUB_API_TOKEN,
                temperature=settings.TEMPERATURE,
                max_new_tokens=settings.MAX_TOKENS
            )
            self.model = ChatHuggingFace(llm=llm)
        # Add other providers as needed

    def generate_answer(
            self,
            question: str,
            context_chunks: List[Dict]
    ) -> str:
        """Generate answer using LLM with retrieved context"""

        # Prepare context from chunks
        context = "\n\n".join([
            f"[{chunk['start_time_sec']:.0f}s - {chunk['end_time_sec']:.0f}s]\n{chunk['text']}"
            for chunk in context_chunks
        ])

        prompt = f"""You are an AI teaching assistant helping a student understand a YouTube video lecture.

Context from the video:
{context}

Student's question: {question}

Provide a clear, helpful answer based on the video content. If the context doesn't contain enough information to answer the question, say so politely and suggest what the student might look for in the video.

NOTE: 
- The answer should be in natural language like that of a human tutor, and can be said in conversations. 
- If the user asks from topic totally not related to video, respond with something witty and short. Example "Lets get back to the topics and not wander off with ...whatever the user asked for".
- if the user asks from topic related to video but answer is not found in context, respond with sentence implying that this is out of scope and mayeb we can study that in an advanced video later. Example 
    "The video does not cover this topic in detail, but you might want to explore more about it from other resources."
- Keep the answer concise and to the point.
    
Answer:"""

        response = self.model.invoke(prompt)
        return response.content


    def extract_topic(self, question: str, answer: str) -> Optional[str]:
        """Extract the main topic/concept from Q&A"""
        prompt = f"""Extract the main topic or concept being discussed in this Q&A exchange. 
Respond with just the topic name (2-4 words maximum).

Question: {question}
Answer: {answer}

Topic:"""

        try:
            response = self.model.invoke(prompt)
            return response.content.strip()
        except:
            return None
