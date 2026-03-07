from pydantic import BaseModel, Field, field_validator
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
    password: str = Field(min_length=6)

    @field_validator('email')
    @classmethod
    def empty_string_to_none(cls, v: str | None) -> str | None:
        """Convert empty strings to None for proper UNIQUE constraint handling"""
        if v is not None and not v.strip():
            return None
        return v


class UserLogin(BaseModel):
    usn: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    name: str
    usn: str
    email: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
