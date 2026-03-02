import os
import shutil
import traceback
import logging
from typing import Optional
from uuid import uuid4
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
# Try current dir, then parent dir
if not load_dotenv():
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph
from pydantic import BaseModel

try:
    from .utils import extract_text, parse_cv
    from .mapping import map_to_portfolio
    from .llm_enhancer import enhance_portfolio_content
    from .tools import (
        parse_cv_tool,
        store_user_state_tool,
        retrieve_user_state_tool,
        generate_site_tool,
        preview_site_tool,
        update_site_tool,
        deploy_site_tool
    )
except ImportError:
    from utils import extract_text, parse_cv
    from mapping import map_to_portfolio
    from llm_enhancer import enhance_portfolio_content
    from tools import (
        parse_cv_tool,
        store_user_state_tool,
        retrieve_user_state_tool,
        generate_site_tool,
        preview_site_tool,
        update_site_tool,
        deploy_site_tool
    )

app = FastAPI(title="Portfolio Agent API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LangGraph Setup
graph = StateGraph(state_schema=dict)

graph.add_node("parse_cv", lambda state: {"cv_data": parse_cv_tool.invoke(state["file_path"])})
graph.add_node("map_portfolio", lambda state: {"portfolio_data": map_to_portfolio(state["cv_data"])})
graph.add_node("confirm_cv", lambda state: state)
graph.add_node("generate_site", lambda state: {"site": {"repo_path": generate_site_tool.invoke({
    "portfolio_data": state["portfolio_data"],
    "theme": state.get("theme", "modern")
})}})
graph.add_node("preview_site", lambda state: {"preview": preview_site_tool.invoke({"repo_path": state["site"]["repo_path"]})})
graph.add_node("edit_site", lambda state: {"preview": update_site_tool.invoke({"repo_path": state["site"]["repo_path"], "updates": state["updates"]})})
graph.add_node("deploy_site", lambda state: {"deployment": deploy_site_tool.invoke({"repo_path": state["site"]["repo_path"]})})

graph.set_entry_point("parse_cv")
graph.add_edge("parse_cv", "map_portfolio")
graph.add_edge("map_portfolio", "confirm_cv")

# Note: Conditional edges in LangGraph usually require a function that returns the next node name
def check_confirmation(state):
    return "generate_site" if state.get("confirmed") else "confirm_cv"

graph.add_conditional_edges(
    "confirm_cv",
    check_confirmation,
    {
        "generate_site": "generate_site",
        "confirm_cv": "confirm_cv"
    }
)

graph.add_edge("generate_site", "preview_site")
graph.add_edge("preview_site", "edit_site")
graph.add_edge("edit_site", "preview_site")
graph.add_edge("preview_site", "deploy_site")

# Compile graph (optional, but good practice)
# runnable = graph.compile()

class StoreStateRequest(BaseModel):
    user_id: str
    state: dict


# Temporary directory for uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@app.post("/store-state")
async def store_state(payload: StoreStateRequest):
    """
    Store user CV/portfolio state for later site generation.
    This mirrors the behaviour of the LangChain store_user_state_tool.
    """
    try:
        store_user_state_tool.invoke(
            {
                "user_id": payload.user_id,
                "state": payload.state,
            }
        )
        return {"status": "success", "user_id": payload.user_id}
    except Exception as e:
        logger.error(f"Error storing state for user {payload.user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...), enhancement_mode: str = "off"):
    user_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        logger.info(f"Processing upload for user {user_id}: {file.filename} (Enhancement: {enhancement_mode})")
        
        # 1. PDF/DOCX Extraction
        text = extract_text(file_path)
        if not text.strip():
            raise ValueError("Empty CV text extracted")
            
        # 2. NLP Extractor + LLM Refinement + Schema Validator
        cv_data = parse_cv(text)
        
        # 3. Optional LLM Enhancement
        if enhancement_mode == "on":
            logger.info(f"Applying LLM enhancement for user {user_id}")
            cv_data = enhance_portfolio_content(cv_data)
        
        # 4. Portfolio Mapper
        portfolio_data = map_to_portfolio(cv_data)
        
        logger.info(f"Successfully processed CV for user {user_id}")
        
        # Store both raw CV data and mapped portfolio data
        store_user_state_tool.invoke({
            "user_id": user_id, 
            "state": {
                "cv_data": cv_data, 
                "portfolio_data": portfolio_data,
                "file_path": file_path
            }
        })
        
        return {
            "user_id": user_id, 
            "cv_data": cv_data,
            "portfolio_data": portfolio_data
        }
    except Exception as e:
        logger.error(f"Error processing CV for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-site")
async def generate_site(
    user_id: Optional[str] = None,
    theme: str = "modern",
    payload: Optional[dict] = Body(None),
):
    """
    Generate a site for a given user.

    Supports both:
    - Query params:  /generate-site?user_id=...&theme=...
    - JSON body:     { "user_id": "...", "theme": "..." }
    """
    # Prefer explicit JSON body if provided
    if payload:
        user_id = payload.get("user_id", user_id)
        theme = payload.get("theme", theme)

    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state:
        raise HTTPException(status_code=404, detail=state["error"])

    # Support both backend-stored keys (cv_data) and frontend-stored keys (cvData)
    cv_data = state.get("cv_data") or state.get("cvData")
    portfolio_data = state.get("portfolio_data") or state.get("portfolioData")

    if portfolio_data is None:
        raise HTTPException(status_code=404, detail="portfolio_data not found in stored state")

    repo_path = generate_site_tool.invoke({
        "portfolio_data": portfolio_data,
        "theme": theme
    })
    
    site = {"repo_path": repo_path}
    
    # Update state with site info
    state["site"] = site
    store_user_state_tool.invoke({"user_id": user_id, "state": state})
    
    preview = preview_site_tool.invoke({"repo_path": repo_path})
    return preview

@app.post("/edit-site")
async def edit_site(user_id: str, updates: dict):
    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state or "site" not in state:
        raise HTTPException(status_code=404, detail="Site or user state not found")
    
    repo_path = state["site"]["repo_path"]
    update_result = update_site_tool.invoke({"repo_path": repo_path, "updates": updates})
    preview = preview_site_tool.invoke({"repo_path": repo_path})
    return preview

@app.post("/deploy")
async def deploy(user_id: str):
    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state or "site" not in state:
        raise HTTPException(status_code=404, detail="Site or user state not found")
    
    return deploy_site_tool.invoke({"repo_path": state["site"]["repo_path"]})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
