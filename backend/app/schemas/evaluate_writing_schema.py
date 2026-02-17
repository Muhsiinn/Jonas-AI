from pydantic import BaseModel, Field


class WritingEvaluationRequest(BaseModel):
    user_input: str = Field(min_length=1)


class WritingEvaluation(BaseModel):
    score: int = Field(ge=0, le=100)
    strengths: str
    improvements: str
    review: str


class WritingEvaluationResponse(BaseModel):
    goal: str
    evaluation: WritingEvaluation
