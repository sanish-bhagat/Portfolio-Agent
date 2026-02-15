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
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph

# Fix relative import for running script directly
try:
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
graph.add_node("confirm_cv", lambda state: state)
graph.add_node("generate_site", lambda state: {"site": generate_site_tool.invoke({
    "cv_data": state["cv_data"], 
    "theme": state.get("theme", "modern"), 
    "layout": "default"
})})
graph.add_node("preview_site", lambda state: {"preview": preview_site_tool.invoke(state["site"]["repo_path"])})
graph.add_node("edit_site", lambda state: {"preview": update_site_tool.invoke(state["site"]["repo_path"], state["updates"])})
graph.add_node("deploy_site", lambda state: {"deployment": deploy_site_tool.invoke(state["site"]["repo_path"], "vercel")})

graph.set_entry_point("parse_cv")
graph.add_edge("parse_cv", "confirm_cv")

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

# Temporary directory for uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    user_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        logger.info(f"Processing upload for user {user_id}: {file.filename}")
        # Using the tool directly for now as per user snippet
        cv_data = parse_cv_tool.invoke(file_path)
        
        logger.info(f"Successfully parsed CV for user {user_id}")
        store_user_state_tool.invoke({"user_id": user_id, "state": {"cv_data": cv_data, "file_path": file_path}})
        
        return {"user_id": user_id, "cv_data": cv_data}
    except Exception as e:
        logger.error(f"Error processing CV for user {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-site")
async def generate_site(user_id: str, theme: str = "modern"):
    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state:
        raise HTTPException(status_code=404, detail=state["error"])
    
    site = generate_site_tool.invoke({"cv_data": state["cv_data"], "theme": theme, "layout": "default"})
    # Update state with site info
    state["site"] = site
    store_user_state_tool.invoke({"user_id": user_id, "state": state})
    
    preview = preview_site_tool.invoke(site["repo_path"])
    return preview

@app.post("/edit-site")
async def edit_site(user_id: str, updates: dict):
    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state or "site" not in state:
        raise HTTPException(status_code=404, detail="Site or user state not found")
    
    update_result = update_site_tool.invoke({"repo_path": state["site"]["repo_path"], "updates": updates})
    preview = preview_site_tool.invoke(state["site"]["repo_path"])
    return preview

@app.post("/deploy")
async def deploy(user_id: str):
    state = retrieve_user_state_tool.invoke(user_id)
    if "error" in state or "site" not in state:
        raise HTTPException(status_code=404, detail="Site or user state not found")
    
    return deploy_site_tool.invoke({"repo_path": state["site"]["repo_path"], "platform": "vercel"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
