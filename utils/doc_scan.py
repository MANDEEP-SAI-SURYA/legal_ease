import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
class Image_Analyser:
    def __init__(self, query, doc_type, base64_data, required_elements=None, visual_reference=None, api_key=GEMINI_API_KEY):
        self.query = query
        self.doc_type = doc_type
        self.base64_data = base64_data
        self.required_elements = required_elements or []
        self.visual_reference = visual_reference or {}
        self.api_key = api_key
        
        self.system_prompt = f"""
You are an expert document verification assistant for Indian legal documents.

Document Type: {self.doc_type}
Legal Query Context: {self.query}

Required Elements to Check:
{json.dumps(self.required_elements, indent=2)}

Visual Reference Standards:
{json.dumps(self.visual_reference, indent=2)}

Your tasks:
1. Verify if this is a genuine {self.doc_type}
2. Check if ALL required elements are present and clearly visible
3. Validate against the visual reference standards
4. Assess document quality and authenticity markers

Provide your analysis in this JSON format:
{{
  "document_type_match": true/false,
  "authenticity_score": 0-100,
  "required_elements_check": {{
    "all_present": true/false,
    "missing_elements": ["list of missing elements"],
    "present_elements": ["list of present elements"]
  }},
  "visual_compliance": {{
    "matches_standard": true/false,
    "compliance_issues": ["list of issues"]
  }},
  "quality_assessment": {{
    "readability": "good/fair/poor",
    "image_quality": "high/medium/low",
    "potential_tampering": true/false
  }},
  "overall_validity": "valid/invalid/questionable",
  "detailed_analysis": "Comprehensive analysis text",
  "recommendations": ["list of recommendations if any issues found"]
}}
"""

    def analyze_legal_doc(self):
        try:
            
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")

            
            image_part = {
                "inline_data": {
                    "mime_type": "image/jpeg",  
                    "data": self.base64_data.split(",")[-1]  
                }
            }

            
            response = model.generate_content(
                [
                    {"text": self.system_prompt},
                    image_part
                ],
                generation_config={"response_mime_type": "application/json"}
            )

            
            if hasattr(response, "text"):
                output = response.text
            else:
                output = response.candidates[0].content.parts[0].text

            try:
                return json.loads(output)
            except json.JSONDecodeError:
                return {
                    "overall_validity": "error",
                    "detailed_analysis": f"Could not parse analysis result: {output}",
                    "error": True
                }

        except Exception as e:
            return {
                "overall_validity": "error",
                "detailed_analysis": f"Analysis failed: {str(e)}",
                "error": True
            }
