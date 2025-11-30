from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace
from app.config import settings
import json
import uuid
import re


class QuizService:
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

    def _sanitize_and_parse_json(self, text: str) -> Dict[str, Any]:
        """
        Robustly parses JSON even if it is truncated or contains markdown.
        Tries to salvage valid questions from a cut-off response.
        """
        text = text.strip()

        # 1. Remove Markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        text = text.strip()

        # 2. Try direct parsing
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass  # Continue to repair logic

        # 3. Handle Truncated JSON
        # If the string ends abruptly, we try to find the last complete object in the "questions" array.
        try:
            # Find the start of the questions array
            start_idx = text.find('[')
            if start_idx == -1:
                return {"questions": []}

            # Find the last "}," pattern which typically indicates the end of a valid question object
            last_object_end = text.rfind('},')

            if last_object_end != -1:
                # Construct a valid JSON string by closing the array and object
                # text[:last_object_end+1] gives us "... }"
                # Then we add "]}" to close the array and root object
                repaired_text = text[:last_object_end + 1] + "]}"
                return json.loads(repaired_text)

            # If we only have one object and it's cut off, or weird structure
            return {"questions": []}

        except Exception:
            # If repair fails, return empty to trigger fallback
            return {"questions": []}

    def generate_quiz(
            self,
            doubts: List[Dict],
            video_chunks: List[Dict],
            num_questions: int = 5
    ) -> Dict[str, Any]:
        """
        Generate personalized quiz.
        If doubts exist: Generate num_questions MCQs while prioritising the topics with doubts.
        If no doubts: Generate num_questions MCQs from general video content.
        """

        # Extract weak topics from doubts (if any)
        weak_topics = list(set([
            doubt.get('topic', 'general')
            for doubt in doubts
            if doubt.get('topic')
        ]))

        # Prepare context from video chunks
        context_text = "\n".join([
            chunk['text']
            for chunk in video_chunks
        ])

        if not doubts:
            # --- CASE 1: No Doubts (General Quiz) ---
            prompt = f"""Generate a quiz based on the following video lecture content.

Video content context:
<VideoContentContext>
{context_text}
</VideoContentContext>

Generate {num_questions} Multiple Choice Questions (MCQ) that cover the key concepts and main topics of the video.

Requirements:
- All questions must be Multiple Choice Questions (MCQ).
- Do NOT generate Short Answer questions.
- Cover a diverse range of topics from the provided text.
- Provide 4 options (A, B, C, D) for each question.

Return ONLY a valid JSON object with this exact structure:
{{
    "questions": [
        {{
            "question_id": "unique_id",
            "question_text": "question here",
            "question_type": "mcq",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "correct option text",
            "topic": "topic name"
        }}
    ]
}}

Generate the quiz now:"""

        else:
            # --- CASE 2: Doubts Exist (Personalized Quiz) ---
            doubt_summary = "\n".join([
                f"- {doubt['question']}"
                for doubt in doubts
            ])

            prompt = f"""Generate a personalized quiz for a student who has been learning from a video lecture.

Video content context:
<VideoContentContext>
{context_text}
</VideoContentContext>

The student asked these questions during the video (Weak Areas), ONLY AND ONLY IF THEY ARE RELEVANT TO THE VIDEO CONTENT:
<WeakTopics>
{weak_topics}
</WeakTopics>

Generate {num_questions} Multiple Choice Questions (MCQ).
1. Prioritize questions that test the concepts related to the student's doubts (Weak Areas).
2. Fill the remaining questions with other key concepts from the video context.

Requirements:
- All questions must be Multiple Choice Questions (MCQ).
- Do NOT generate Short Answer questions.
- Prioritize weak topics with atleast 50% of questions from these areas.
- Cover a diverse range of topics from the provided text.
- Provide 4 options (A, B, C, D) for each question.

Return ONLY a valid JSON object with this exact structure:
{{
    "questions": [
        {{
            "question_id": "unique_id",
            "question_text": "question here",
            "question_type": "mcq",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "correct option text",
            "topic": "topic name"
        }}
    ]
}}

Generate the quiz now:"""

        try:
            response = self.model.invoke(prompt)
            quiz_text = response.content.strip()

            # Use robust parser
            quiz_data = self._sanitize_and_parse_json(quiz_text)

            # Check if we got any questions, if not, fallback
            if not quiz_data.get('questions'):
                return self._generate_fallback_quiz(doubts, num_questions, context_text)

            # Add unique IDs if missing
            for q in quiz_data['questions']:
                if 'question_id' not in q:
                    q['question_id'] = str(uuid.uuid4())

            return {
                "questions": quiz_data['questions'],
                "weak_topics": weak_topics
            }

        except Exception as e:
            print(f"Quiz Generation Error: {e}")
            return self._generate_fallback_quiz(doubts, num_questions, context_text)

    def _generate_fallback_quiz(self, doubts: List[Dict], num_questions: int, context_text: str) -> Dict:
        """Generate a simple fallback quiz if LLM fails"""
        questions = []

        if doubts:
            for i, doubt in enumerate(doubts[:num_questions]):
                questions.append({
                    "question_id": str(uuid.uuid4()),
                    "question_text": f"Explain: {doubt['question']}",
                    "question_type": "short_answer",
                    "correct_answer": doubt['answer'][:200],
                    "topic": doubt.get('topic', 'general')
                })
        else:
            # Simple fallback question when no doubts exist
            questions.append({
                "question_id": str(uuid.uuid4()),
                "question_text": "We encountered an error generating the quiz. Please try again.",
                "question_type": "short_answer",
                "correct_answer": "N/A",
                "topic": "system"
            })

        return {
            "questions": questions,
            "weak_topics": []
        }

    def evaluate_quiz(
            self,
            questions: List[Dict],
            answers: List[Dict]
    ) -> Dict[str, Any]:
        """Evaluate quiz submission"""

        # Create answer map
        answer_map = {ans['question_id']: ans['answer'] for ans in answers}

        feedback = []
        correct_count = 0

        for question in questions:
            q_id = question['question_id']
            user_answer = answer_map.get(q_id, "")
            correct_answer = question['correct_answer']

            if question['question_type'] == 'mcq':
                # Improved matching: remove punctuation and case
                clean_user = re.sub(r'[^\w\s]', '', user_answer.strip().lower())
                clean_correct = re.sub(r'[^\w\s]', '', correct_answer.strip().lower())

                # Check for "Option A" vs "A" vs "A. Option Text"
                # Simple heuristic: check if the first letter matches
                is_correct = False
                if clean_user == clean_correct:
                    is_correct = True

                if is_correct:
                    correct_count += 1

                feedback.append({
                    "question_id": q_id,
                    "question_text": question['question_text'],
                    "is_correct": is_correct,
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "explanation": f"The correct answer is: {correct_answer}"
                })

            else:  # short_answer - use LLM to evaluate
                is_correct, explanation = self._evaluate_short_answer(
                    question['question_text'],
                    user_answer,
                    correct_answer
                )

                if is_correct:
                    correct_count += 1

                feedback.append({
                    "question_id": q_id,
                    "question_text": question['question_text'],
                    "is_correct": is_correct,
                    "user_answer": user_answer,
                    "explanation": explanation
                })

        total = len(questions)
        score = (correct_count / total * 100) if total > 0 else 0

        return {
            "score": round(score, 2),
            "total_questions": total,
            "correct_answers": correct_count,
            "feedback": feedback
        }

    def _evaluate_short_answer(
            self,
            question: str,
            user_answer: str,
            expected_answer: str
    ) -> tuple[bool, str]:
        """Evaluate short answer using LLM"""

        prompt = f"""Evaluate this student's answer:

Question: {question}
Expected Answer: {expected_answer}
Student's Answer: {user_answer}

Determine if the student's answer demonstrates understanding of the concept.
Respond with a JSON object:
{{
    "is_correct": true/false,
    "explanation": "brief feedback for the student"
}}"""

        try:
            response = self.model.invoke(prompt)
            result_text = response.content.strip()

            result = self._sanitize_and_parse_json(result_text)
            return result.get('is_correct', False), result.get('explanation', "Could not evaluate.")

        except:
            # Fallback: simple string matching
            is_correct = user_answer.lower() in expected_answer.lower() or \
                         expected_answer.lower() in user_answer.lower()
            return is_correct, "Answer evaluated based on keyword matching."