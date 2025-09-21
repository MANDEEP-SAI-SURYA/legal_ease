import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

class Generate_Documents:
    def __init__(self, query, api_key=GEMINI_API_KEY):
        self.query = query
        self.api_key = api_key
        self.system_prompt = """
You are an expert virtual legal advocate assistant.
Your task is to generate comprehensive document information for solving a legal query.

Rules:
1. Output must be a valid JSON.
2. Structure:
   {
     "documents": [
       {
         "name": "Document Name",
         "required_elements": [
           "Element 1",
           "Element 2",
           ...
         ],
         "visual_reference": {
           "document_type": "ID Card/Certificate/Form",
           "layout_description": "Brief description of how the document should look",
           "key_visual_features": [
             "Feature 1",
             "Feature 2"
           ],
           "typical_sections": [
             "Section 1",
             "Section 2",
             "Reference_Link",
           ]
         }
       }
     ]
   }
3. Focus on Indian legal documents and requirements.
4. Be specific about what elements must be present in each document.
5. Provide clear visual references to help identify authentic documents.
6.Provide a visual reference link via image link or any direct navigation link available on the internet as a part of typical_sections itself
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
                return {"documents": ["Error: Could not generate documents properly."]}
                
        except Exception as e:
            return {"documents": [f"API call failed: {str(e)}"]}
