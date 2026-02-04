from typing import Annotated, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field 
from typing_extensions import TypedDict 
from app.schemas.agents_schema import SitationOutput
from app.models.lesson_model import Lesson
from app.workflows.nodes.roleplay import chat
from app.schemas.roleplay_schema import RoleplayState
from app.workflows.nodes.check_db_end_node import check_db_end_status
from app.workflows.nodes.roleplay_evaluation_node import evaluate_roleplay

def should_evaluate(state: RoleplayState):
    if state.done:
        return "evaluate"
    return "end"

def build_workflow():
    workflow = StateGraph(RoleplayState)

    workflow.add_node("chat", chat)
    workflow.add_node("check_db_end", check_db_end_status)
    workflow.add_node("evaluate", evaluate_roleplay)

    workflow.set_entry_point("chat")
    workflow.add_edge("chat", "check_db_end")
    workflow.add_conditional_edges(
        "check_db_end",
        should_evaluate,
        {
            "evaluate": "evaluate",
            "end": END
        }
    )
    workflow.add_edge("evaluate", END)

    app = workflow.compile()
    return app
