from langgraph.graph import StateGraph, START, END
from app.schemas.writing_schema import WritingState
from app.workflows.nodes.writing_node import writing
from app.workflows.nodes.vocabs_for_writing import make_vocabs


def build_workflow():
    workflow = StateGraph(WritingState)

    workflow.add_node("writing", writing)
    workflow.add_node("vocabs", make_vocabs)


    workflow.add_edge(START, "writing")
    workflow.add_edge("writing", "vocabs")
    workflow.add_edge("vocabs", END)

    return workflow.compile()
