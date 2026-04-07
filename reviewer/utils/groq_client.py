import json
import os
import re
from groq import Groq


def extract_json(text: str) -> dict:
    """
    Safely extract and parse JSON from LLM response
    """
    # Remove markdown fences if present
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    # Extract JSON object using regex
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON found in response")

    json_text = match.group(0)

    # Remove problematic control characters
    json_text = json_text.replace("\r", "")

    # Try parsing directly
    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        # Attempt to fix common issues
        json_text = json_text.replace("\n", "\\n")
        return json.loads(json_text)


def analyze_code(code: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {
            "error": "GROQ_API_KEY not configured. Please set your API key in .env file."
        }

    client = Groq(api_key=api_key)

    system_prompt = """You are a senior software engineer performing a deep code review.

Return ONLY valid JSON. No markdown. No explanation.

STRICT RULES:
- Escape all strings properly
- Do NOT include raw multiline code
- Replace newlines in code with \\n
- Ensure JSON is strictly valid

JSON format:
{
  "language": "",
  "summary": "",
  "bugs": [{"line": "", "issue": "", "severity": "critical|high|medium|low", "fix": ""}],
  "improvements": [{"area": "", "suggestion": "", "reason": ""}],
  "refactored_code": "",
  "score": {"readability": 0, "performance": 0, "best_practices": 0, "overall": 0},
  "complexity": {"time": "", "space": "", "notes": ""},
  "security": [{"issue": "", "severity": "", "fix": ""}],
  "top_priorities": []
}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=4096,
            temperature=0.2,  # 🔥 more deterministic output
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Code to review:\n\n{code}"}
            ]
        )

        response_text = response.choices[0].message.content.strip()

        # 🔥 Use safe extractor
        result = extract_json(response_text)

        # ✅ Normalize scores
        if "score" in result and isinstance(result["score"], dict):
            scores = result["score"]

            readability = int(scores.get("readability", 5))
            performance = int(scores.get("performance", 5))
            best_practices = int(scores.get("best_practices", 5))

            readability = max(0, min(10, readability))
            performance = max(0, min(10, performance))
            best_practices = max(0, min(10, best_practices))

            overall = (readability + performance + best_practices) // 3

            result["score"] = {
                "readability": readability,
                "performance": performance,
                "best_practices": best_practices,
                "overall": overall
            }

        return result

    except json.JSONDecodeError as e:
        return {
            "error": f"Failed to parse AI response as JSON: {str(e)}",
            "raw_response": response_text  # 🔥 helpful for debugging
        }

    except Exception as e:
        return {
            "error": f"Error communicating with Groq API: {str(e)}"
        }