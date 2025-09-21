import os
import json
import re
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

class GenerateDeadlines:
    def __init__(self, query, api_key=GEMINI_API_KEY):
        self.query = query
        self.api_key = api_key
        self.system_prompt = """
You are an expert legal assistant that generates realistic deadlines for legal cases.

Based on the user's legal query, generate 3-5 realistic deadlines with specific dates.

IMPORTANT: You MUST return ONLY a valid JSON object in this exact format:

{
  "deadlines": [
    {"task": "File initial petition", "due_date": "2025-09-15", "completed": false},
    {"task": "Discovery deadline", "due_date": "2025-10-20", "completed": false},
    {"task": "Mediation session", "due_date": "2025-11-10", "completed": false}
  ]
}

Rules:
- Return ONLY the JSON object, no other text
- Use YYYY-MM-DD date format
- Include 3-5 realistic deadlines
- All dates should be future dates (after 2025-09-01)
- Tasks should be relevant to the legal query
- Always set "completed": false
"""

    def call_api(self):
        try:
            print(f"=== GenerateDeadlines API Call ===")
            print(f"Query: {self.query}")
            
            client = genai.Client(api_key=self.api_key)
            full_prompt = f"{self.system_prompt}\n\nLegal Query: {self.query}\n\nGenerate deadlines:"
            
            print(f"Calling Gemini API...")
            resp = client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=[full_prompt],
                config={
                    "temperature": 0.3,
                    "max_output_tokens": 1024,
                }
            )

            raw_response = resp.text.strip()
            print(f"Raw AI Response: {raw_response}")
            
            
            json_data = self._extract_json(raw_response)
            
            if json_data:
                print(f"Parsed JSON: {json_data}")
                
                
                if "deadlines" in json_data and isinstance(json_data["deadlines"], list):
                    
                    valid_deadlines = []
                    for deadline in json_data["deadlines"]:
                        if (isinstance(deadline, dict) and 
                            "task" in deadline and 
                            "due_date" in deadline and
                            deadline["task"] and 
                            deadline["due_date"]):
                            
                            
                            if "completed" not in deadline:
                                deadline["completed"] = False
                                
                            valid_deadlines.append(deadline)
                    
                    if valid_deadlines:
                        result = {"deadlines": valid_deadlines}
                        print(f"Returning valid deadlines: {result}")
                        return result
                    else:
                        print("No valid deadlines found in response")
                        return {"deadlines": [], "error": "No valid deadlines in AI response"}
                else:
                    print("Invalid JSON structure - missing or invalid 'deadlines' field")
                    return {"deadlines": [], "error": "Invalid JSON structure from AI"}
            else:
                print("Could not extract JSON from response")
                return {"deadlines": [], "error": "Could not parse JSON from AI response"}
                
        except Exception as e:
            print(f"Exception in GenerateDeadlines: {str(e)}")
            return {"deadlines": [], "error": f"API call failed: {str(e)}"}

    def _extract_json(self, text):
        """Try multiple methods to extract JSON from AI response"""
        
        
        start = text.find("{")
        end = text.rfind("}") + 1
        
        if start != -1 and end > start:
            json_str = text[start:end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        
        json_pattern = r'\{[^{}]*\[[^\[\]]*\][^{}]*\}'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        
        code_block_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
        matches = re.findall(code_block_pattern, text, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue
        
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        return None