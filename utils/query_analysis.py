import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

class Query_Analysis:
    def __init__(self, query, api_key=GEMINI_API_KEY):
        self.query = query
        self.api_key = api_key
        self.system_prompt = """
You are an expert virtual legal advocate assistant.
Your ONLY task is to analyze if a legal query is solvable or not.

Rules:
1. If the query is clear and legally solvable → return: {"status": "solvable", "message": "This legal query is solvable, please generate deadlines and documents required to keep track on your progress."}
2. If it is solvable but very hard/complex → return: {"status": "hard", "message": "This query is not easily solvable, but you can still try to solve it, please generate deadlines and documents required to keep track on your progress..Explore successful users with similar issues in our Find Users tab."}
3. If it is irrelevant or not a legal issue → return: {"status": "irrelevant", "message": "This query is not directly relevant. Explore successful users with similar issues in our Find Users tab."}

⚠️ Important: 
- Do NOT provide legal explanations, documents, or deadlines.
- Only return a JSON object with 'status' and 'message'.
"""

    def call_api(self):
        try:
            client = genai.Client(api_key=self.api_key)
            full_prompt = f"{self.system_prompt}\n\nUser Query: {self.query}"
            resp = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=[full_prompt]
            )
            
            response = resp.text.strip()
            start = response.find("{")
            end = response.rfind("}") + 1
            output = response[start:end]

            try:
                data = json.loads(output)
                return data
            except json.JSONDecodeError:
                return {"status": "error", "message": "Could not analyze query properly."}
                
        except Exception as e:
            return {"status": "error", "message": f"API call failed: {str(e)}"}
