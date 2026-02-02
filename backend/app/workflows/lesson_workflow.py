from typing import Annotated, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field 
from typing_extensions import TypedDict 
from app.schemas.agents_schema import State
from app.schemas.agents_schema import SitationOutput
from app.models.lesson_model import Lesson
from app.workflows.nodes.lesson_node import make_lesson
from app.workflows.nodes.questions_node import make_question
from app.workflows.nodes.vocabs_node import make_vocabs
from app.workflows.nodes.grammar_node import make_grammar
from fastapi import APIRouter

def build_workflow():
    workflow = StateGraph(State)

    workflow.add_node("lesson_maker", make_lesson)
    workflow.add_node("vocab_maker", make_vocabs)
    workflow.add_node("grammar_maker", make_grammar)
    workflow.add_node("question_maker", make_question)

    workflow.add_edge(START, "lesson_maker")
    workflow.add_edge("lesson_maker", "vocab_maker")
    workflow.add_edge("vocab_maker", "grammar_maker")
    workflow.add_edge("grammar_maker", "question_maker")
    workflow.add_edge("question_maker", END)

    return workflow.compile()



