import json
from pathlib import Path
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate

from app.config import settings
from app.services.llm_logger import llm_logger


class LLMService:
    """Service for LLM operations."""

    def __init__(self):
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.openai_api_key,
            temperature=0.0,  # Deterministic for consistent summaries
        )
        self.prompts_dir = Path("prompts")

    def load_prompt(self, prompt_name: str) -> str:
        """Load a prompt template from the prompts directory."""
        prompt_path = self.prompts_dir / f"{prompt_name}.txt"
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()

    def extract_participants(self, transcript: str) -> str:
        """
        Extract participants from a meeting transcript using LLM.

        Args:
            transcript: The meeting transcript

        Returns:
            Comma-separated string of participant names
        """
        # Load prompt template
        prompt_template_str = self.load_prompt("extract_participants")
        prompt_template = PromptTemplate(
            input_variables=["transcript"], template=prompt_template_str
        )

        # Format prompt with transcript
        formatted_prompt = prompt_template.format(transcript=transcript)

        # Call LLM
        response = self.model.invoke(formatted_prompt)
        response_text = response.content.strip()

        # Log the call
        llm_logger.log_call(
            prompt=formatted_prompt,
            response=response_text,
            model="gpt-4o-mini",
            metadata={"operation": "extract_participants"},
        )

        return response_text

    def summarize_meeting(self, transcript: str, meeting_id: int = None) -> dict:
        """
        Summarize a meeting transcript using LLM.

        Args:
            transcript: The meeting transcript
            meeting_id: Optional meeting ID for logging

        Returns:
            Dictionary with summary data: {tldr, action_items, sentiment, sentiment_explanation}
        """
        # Load prompt template
        prompt_template_str = self.load_prompt("meeting_summary")
        prompt_template = PromptTemplate(
            input_variables=["transcript"], template=prompt_template_str
        )

        # Format prompt with transcript
        formatted_prompt = prompt_template.format(transcript=transcript)

        # Call LLM
        response = self.model.invoke(formatted_prompt)
        response_text = response.content

        # Log the call
        metadata = {"meeting_id": meeting_id} if meeting_id else {}
        llm_logger.log_call(
            prompt=formatted_prompt,
            response=response_text,
            model="gpt-4o-mini",
            metadata=metadata,
        )

        # Parse JSON response
        try:
            # Clean up response if it has markdown code blocks
            if response_text.startswith("```"):
                # Remove markdown code block markers
                response_text = response_text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                elif response_text.startswith("```"):
                    response_text = response_text[3:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()

            summary_data = json.loads(response_text)
            return summary_data
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return error structure
            return {
                "tldr": "Error: Could not parse LLM response",
                "action_items": [],
                "sentiment": "amber",
                "sentiment_explanation": f"JSON parsing error: {str(e)}",
                "raw_response": response_text,
            }


# Global LLM service instance
llm_service = LLMService()
