from pydantic import BaseModel, Field
from datetime import datetime


# ---------- Subject ----------

class SubjectResult(BaseModel):
    subject_code: str
    credits: int
    grade: str
    grade_points: int


# ---------- Upload response ----------

class ParsedResult(BaseModel):
    subjects: list[SubjectResult]
    sgpa: float
    total_credits: int


# ---------- Save-result request ----------

class SaveResultRequest(BaseModel):
    user_id: int
    semester: int = Field(ge=1, le=8)
    sgpa: float
    total_credits: int
    subjects: list[SubjectResult]


# ---------- Result response ----------

class ResultOut(BaseModel):
    id: int
    user_id: int
    semester: int
    sgpa: float
    total_credits: int
    subjects: list[SubjectResult]
    uploaded_at: datetime

    model_config = {"from_attributes": True}


# ---------- User schemas ----------

class UserCreate(BaseModel):
    name: str
    usn: str
    email: str | None = None


class UserOut(BaseModel):
    id: int
    name: str
    usn: str
    email: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
