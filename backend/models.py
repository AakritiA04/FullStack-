# models.py
from sqlalchemy import Column, Integer, String, Text
from backend.database import Base   # ✅ correct import

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
