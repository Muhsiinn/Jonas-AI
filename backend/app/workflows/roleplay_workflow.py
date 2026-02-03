from typing import Annotated, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field 
from typing_extensions import TypedDict 
from app.schemas.agents_schema import SitationOutput
from app.models.lesson_model import Lesson
from app.workflows.nodes.roleplay import chat
from app.schemas.roleplay_schema import RoleplayState
from app.workflows.nodes.roleplay import should_continue
from app.workflows.nodes.end_node import end_check_node

def build_workflow():
    workflow = StateGraph(RoleplayState)

    workflow.add_node("chat", chat)
    workflow.add_node("end_check", end_check_node)

    workflow.set_entry_point("chat")
    workflow.add_edge("chat", "end_check")
    workflow.add_conditional_edges(
        "end_check",
        should_continue,
        {
            "continue": "chat",
            "end": END
        }
    )

    app = workflow.compile()
    return app
