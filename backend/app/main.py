from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from .database import engine, Base, get_db
from . import models, schemas, crud, seed

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lead Qualification System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Lead Qualification API is running. Access documentation at /docs"}
@app.get("/api/test-db")
def test_db():
    import os
    try: return {"db_url": os.getenv("DATABASE_URL"), "write_success": open("/tmp/test_write.txt", "w").write("hello") or True, "cwd": os.getcwd(), "exists": os.path.exists("/tmp")}
    except Exception as e: return {"db_url": os.getenv("DATABASE_URL"), "write_success": str(e), "cwd": os.getcwd(), "exists": os.path.exists("/tmp")}

# --- Leads Endpoints ---

@app.get("/api/leads", response_model=List[schemas.Lead])
def read_leads(
    search: Optional[str] = Query("", description="Search term for name, email, company, job role"),
    status: Optional[str] = Query("", description="Filter by status (New, Contacted, Qualified, Unqualified)"),
    category: Optional[str] = Query("", description="Filter by category (Hot, Warm, Cold)"),
    sort_by: Optional[str] = Query("score", description="Field to sort by (score, name, company, created_at)"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_leads(
        db, 
        skip=skip, 
        limit=limit, 
        search=search, 
        status=status, 
        category=category, 
        sort_by=sort_by, 
        sort_order=sort_order
    )

@app.get("/api/leads/{lead_id}", response_model=schemas.LeadDetail)
def read_lead(lead_id: int, db: Session = Depends(get_db)):
    db_lead = crud.get_lead(db, lead_id)
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead

@app.post("/api/leads", response_model=schemas.Lead, status_code=status.HTTP_201_CREATED)
def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    return crud.create_lead(db, lead)

@app.put("/api/leads/{lead_id}", response_model=schemas.Lead)
def update_lead(lead_id: int, lead: schemas.LeadUpdate, db: Session = Depends(get_db)):
    db_lead = crud.update_lead(db, lead_id, lead)
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return db_lead

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    success = crud.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": f"Lead {lead_id} successfully deleted"}

@app.post("/api/leads/{lead_id}/events", response_model=schemas.BehavioralEvent, status_code=status.HTTP_201_CREATED)
def create_behavioral_event(lead_id: int, event: schemas.BehavioralEventBase, db: Session = Depends(get_db)):
    db_lead = crud.get_lead(db, lead_id)
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    event_create = schemas.BehavioralEventCreate(
        lead_id=lead_id,
        event_type=event.event_type,
        event_details=event.event_details
    )
    return crud.create_behavioral_event(db, event_create)


# --- Scoring Rules Endpoints ---

@app.get("/api/rules", response_model=List[schemas.ScoringRule])
def read_rules(db: Session = Depends(get_db)):
    return crud.get_rules(db)

@app.post("/api/rules", response_model=schemas.ScoringRule, status_code=status.HTTP_201_CREATED)
def create_rule(rule: schemas.ScoringRuleCreate, db: Session = Depends(get_db)):
    return crud.create_rule(db, rule)

@app.put("/api/rules/{rule_id}", response_model=schemas.ScoringRule)
def update_rule(rule_id: int, rule: schemas.ScoringRuleUpdate, db: Session = Depends(get_db)):
    db_rule = crud.update_rule(db, rule_id, rule)
    if not db_rule:
        raise HTTPException(status_code=404, detail="Scoring rule not found")
    return db_rule

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_db)):
    success = crud.delete_rule(db, rule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scoring rule not found")
    return {"message": f"Scoring rule {rule_id} successfully deleted"}


# --- Dashboard Stats Endpoints ---

@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def read_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


# --- Admin Seed Endpoints ---

@app.post("/api/seed")
def seed_database():
    try:
        seed.seed_db()
        return {"status": "success", "message": "Database successfully seeded with default rules and mock leads"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seed failed: {str(e)}")
