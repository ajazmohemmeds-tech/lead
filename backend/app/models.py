import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, nullable=False)
    job_role = Column(String, nullable=False)
    company_size = Column(Integer, default=1)
    industry = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    status = Column(String, default="New")  # New, Contacted, Qualified, Unqualified
    category = Column(String, default="Cold")  # Hot, Warm, Cold
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    events = relationship("BehavioralEvent", back_populates="lead", cascade="all, delete-orphan")

class BehavioralEvent(Base):
    __tablename__ = "behavioral_events"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    event_type = Column(String, nullable=False)  # page_visit, form_submission, email_open, resource_download
    event_details = Column(String, nullable=False)  # URL or Form Name
    score_delta = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lead = relationship("Lead", back_populates="events")

class ScoringRule(Base):
    __tablename__ = "scoring_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False)  # demographic, behavioral
    field = Column(String, nullable=False)  # e.g., job_role, company_size, event_type, email
    operator = Column(String, nullable=False)  # equals, contains, greater_than, less_than
    value = Column(String, nullable=False)  # The value to compare against
    points = Column(Integer, nullable=False)  # Positive/Negative points
    is_active = Column(Boolean, default=True)
