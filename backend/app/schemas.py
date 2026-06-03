from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Scoring Rule Schemas
class ScoringRuleBase(BaseModel):
    name: str
    rule_type: str  # demographic, behavioral
    field: str      # e.g. job_role, company_size, event_type
    operator: str   # equals, contains, greater_than, less_than
    value: str
    points: int
    is_active: bool = True

class ScoringRuleCreate(ScoringRuleBase):
    pass

class ScoringRuleUpdate(BaseModel):
    name: Optional[str] = None
    rule_type: Optional[str] = None
    field: Optional[str] = None
    operator: Optional[str] = None
    value: Optional[str] = None
    points: Optional[int] = None
    is_active: Optional[bool] = None

class ScoringRule(ScoringRuleBase):
    id: int

    class Config:
        from_attributes = True


# Behavioral Event Schemas
class BehavioralEventBase(BaseModel):
    event_type: str
    event_details: str

class BehavioralEventCreate(BehavioralEventBase):
    lead_id: Optional[int] = None  # Optional when creating via lead creation flow

class BehavioralEvent(BehavioralEventBase):
    id: int
    lead_id: int
    score_delta: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Lead Schemas
class LeadBase(BaseModel):
    name: str
    email: str
    company: str
    job_role: str
    company_size: int = 1
    industry: str
    phone: Optional[str] = None

class LeadCreate(LeadBase):
    initial_events: Optional[List[BehavioralEventBase]] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    job_role: Optional[str] = None
    company_size: Optional[int] = None
    industry: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class Lead(LeadBase):
    id: int
    status: str
    category: str
    score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LeadDetail(Lead):
    events: List[BehavioralEvent] = []

    class Config:
        from_attributes = True


# Dashboard Statistics Schemas
class CategoryStats(BaseModel):
    hot: int
    warm: int
    cold: int

class StatusStats(BaseModel):
    new: int
    contacted: int
    qualified: int
    unqualified: int

class ActivityFeedItem(BaseModel):
    id: int
    lead_id: int
    lead_name: str
    event_type: str
    event_details: str
    score_delta: int
    timestamp: datetime

class DashboardStats(BaseModel):
    total_leads: int
    category_counts: CategoryStats
    status_counts: StatusStats
    recent_activity: List[ActivityFeedItem]
    average_score: float
