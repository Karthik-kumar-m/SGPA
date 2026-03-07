from datetime import datetime
from sqlalchemy import Integer, String, Float, ForeignKey, DateTime, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    usn: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(150), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    results: Mapped[list["Result"]] = relationship("Result", back_populates="user", cascade="all, delete-orphan")


class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        UniqueConstraint('user_id', 'semester', name='unique_user_semester'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    sgpa: Mapped[float] = mapped_column(Float, nullable=False)
    total_credits: Mapped[int] = mapped_column(Integer, nullable=False)
    subjects: Mapped[dict] = mapped_column(JSON, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="results")


class CourseReference(Base):
    __tablename__ = "course_reference"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    course_title: Mapped[str] = mapped_column(String(200), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False)
    semester: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stream: Mapped[str | None] = mapped_column(String(50), nullable=True)
