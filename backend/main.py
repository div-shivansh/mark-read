import fitz  # PyMuPDF
import google.generativeai as genai
import json
import uuid
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# --- CONFIGURATION ---
genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
# Note: Ensure you are using a model you have access to. 
# If 'preview' fails, switch back to 'gemini-1.5-flash' or 'gemini-2.0-flash'
model = genai.GenerativeModel('models/gemini-3-flash-preview')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods= ["*"],
    allow_headers= ["*"],
)

# FIX 1: Renamed function to match the call below
def analyze_pdf_logic(input_path, context, study_goal):
    """The Brain (Gemini) and Hand (PyMuPDF) logic"""
    
    # 1. Read the PDF Text
    try:
        doc = fitz.open(input_path)
        full_text = ""
        for page in doc:
            full_text += page.get_text()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []

    # 2. Ask Gemini (The Brain)
    # UPDATED PROMPT: We explicitly ask for substrings to make matching easier
    prompt = f"""
    You are a study assistant.
    Context: The user is Studying "{context}".
    Goal: They want highlights suitable for "{study_goal}".

    Read the text below.
    Identify the most critical sentences or phrases.
    
    CRITICAL INSTRUCTION: 
    1. Return ONLY a raw JSON list of strings. 
    2. The strings must match the source text EXACTLY. 
    3. If a sentence is very long, just return the first unique 10-15 words of it.
    
    Text:
    {full_text[:30000]} 
    """
    
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        highlights = json.loads(clean_json)
        print("Gemini found these highlights:", highlights)
    except Exception as e:
        print(f"Error getting highlights from Gemini: {e}")
        return []
    
    structured_highlights = []

    for phrase in highlights:
        match_found = False # Track if we found this phrase
        
        # --- ROBUST SEARCH LOGIC ---
        # 1. Create a "clean" version (single spaces, no newlines)
        clean_phrase = " ".join(phrase.split())

        for page_num, page in enumerate(doc):
            # Attempt 1: Exact Match (Best)
            quads = page.search_for(phrase, quads=True)
            
            # Attempt 2: Clean Match (If exact failed)
            if not quads:
                quads = page.search_for(clean_phrase, quads=True)
            
            # Attempt 3: Substring Match (If strictly necessary, try first 50 chars)
            if not quads and len(clean_phrase) > 50:
                 quads = page.search_for(clean_phrase[:50], quads=True)

            if quads:
                match_found = True
                rects_data = []
                for q in quads:
                    rects_data.append({
                        "x1": q.ul.x, "y1": q.ul.y,
                        "x2": q.lr.x, "y2": q.lr.y,
                        "width": page.rect.width,
                        "height": page.rect.height
                    })

                structured_highlights.append({
                    "id": str(uuid.uuid4()),
                    "content": { "text": phrase },
                    "position": {
                        "pageNumber": page_num + 1,
                        "rects": rects_data
                    },
                    "comment": { "text": f"AI Suggested ({study_goal})", "emoji": "🤖" }
                })
                # If we found it on this page, stop searching other pages for this specific phrase 
                # (Prevents highlighting the same common phrase 50 times)
                break 
        
        if not match_found:
            print(f"Warning: Could not find match for phrase: '{phrase[:30]}...'")

    return structured_highlights

@app.post("/analyze-pdf")
async def analyze_pdf_endpoint(
    file: UploadFile = File(...),
    context: str = Form(...),
    studyGoal: str = Form(...)
):
    # 1. Save uploaded file temporarily
    temp_input = f"temp_{file.filename}"
    
    with open(temp_input, "wb") as buffer:
        buffer.write(await file.read())

    # 2. Run our logic (Function name now matches)
    highlights_data = analyze_pdf_logic(temp_input, context, studyGoal)

    # 3. Return the result
    # FIX 5: Check 'highlights_data', not 'success'
    if highlights_data is not None:
        return JSONResponse(content={"highlights": highlights_data})
    else:
        return {"error": "Failed to process PDF"}