from typing import Annotated, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field 
from typing_extensions import TypedDict 
from app.schemas.agents import State
from app.schemas.agents import SitationOutput
from app.models.lesson import Lesson
from app.api.v1.nodes.lesson import make_lesson
from app.api.v1.nodes.questions import make_question
from app.api.v1.nodes.vocabs import make_vocabs
from fastapi import APIRouter

def build_workflow():
    workflow = StateGraph(State)

    workflow.add_node("lesson_maker", make_lesson)
    workflow.add_node("question_maker", make_question)
    workflow.add_node('vocab_maker',make_vocabs)


    workflow.add_edge(START, "lesson_maker")
    workflow.add_edge("lesson_maker", "vocab_maker")  
    workflow.add_edge("vocab_maker", "question_maker")  
    workflow.add_edge("question_maker", END)

    return workflow.compile()



