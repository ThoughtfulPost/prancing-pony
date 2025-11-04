import os
import json
from datetime import datetime
from pathlib import Path


class LLMLogger:
    """Simple logger for LLM calls and responses."""

    def __init__(self, log_dir: str = "llm-logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)

    def log_call(
        self, prompt: str, response: str, model: str = "gpt-4o-mini", metadata: dict = None
    ) -> str:
        """
        Log an LLM call and response to a text file.

        Args:
            prompt: The prompt sent to the LLM
            response: The response from the LLM
            model: The model used
            metadata: Additional metadata to log

        Returns:
            The filename of the log file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{timestamp}_{model}.txt"
        filepath = self.log_dir / filename

        log_content = f"""{'='*80}
LLM CALL LOG
{'='*80}
Timestamp: {datetime.now().isoformat()}
Model: {model}
"""

        if metadata:
            log_content += f"\nMetadata:\n{json.dumps(metadata, indent=2)}\n"

        log_content += f"""
{'='*80}
PROMPT
{'='*80}
{prompt}

{'='*80}
RESPONSE
{'='*80}
{response}

{'='*80}
"""

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(log_content)

        return str(filename)


# Global logger instance
llm_logger = LLMLogger()
