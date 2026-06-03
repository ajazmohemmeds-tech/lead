from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from . import models, schemas, scoring

# --- Lead Operations ---

def get_lead(db: Session, lead_id: int):
    return db.query(models.Lead).filter(models.Lead.id == lead_id).first()

def get_leads(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    search: str = "", 
    status: str = "", 
    category: str = "",
    sort_by: str = "score",
    sort_order: str = "desc"
):
    query = db.query(models.Lead)

    # Filtering
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Lead.name.ilike(search_filter),
                models.Lead.email.ilike(search_filter),
                models.Lead.company.ilike(search_filter),
                models.Lead.job_role.ilike(search_filter),
                models.Lead.industry.ilike(search_filter)
            )
        )
    
    if status:
        query = query.filter(models.Lead.status == status)
        
    if category:
        query = query.filter(models.Lead.category == category)

    # Sorting
    sort_column = getattr(models.Lead, sort_by, models.Lead.score)
    if sort_order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(sort_column)

    return query.offset(skip).limit(limit).all()

def create_lead(db: Session, lead_in: schemas.LeadCreate):
    # Check if lead already exists
    db_lead = db.query(models.Lead).filter(models.Lead.email == lead_in.email).first()
    if db_lead:
        return db_lead

    db_lead = models.Lead(
        name=lead_in.name,
        email=lead_in.email,
        company=lead_in.company,
        job_role=lead_in.job_role,
        company_size=lead_in.company_size,
        industry=lead_in.industry,
        phone=lead_in.phone
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)

    # Add initial events if provided
    if lead_in.initial_events:
        for event in lead_in.initial_events:
            db_event = models.BehavioralEvent(
                lead_id=db_lead.id,
                event_type=event.event_type,
                event_details=event.event_details
            )
            db.add(db_event)
        db.commit()

    # Recalculate score immediately
    scoring.calculate_lead_score(db, db_lead.id)
    return db_lead

def update_lead(db: Session, lead_id: int, lead_in: schemas.LeadUpdate):
    db_lead = get_lead(db, lead_id)
    if not db_lead:
        return None
    
    update_data = lead_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lead, key, value)
    
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    
    # Recalculate score after profile update
    scoring.calculate_lead_score(db, db_lead.id)
    return db_lead

def delete_lead(db: Session, lead_id: int):
    db_lead = get_lead(db, lead_id)
    if db_lead:
        db.delete(db_lead)
        db.commit()
        return True
    return False


# --- Behavioral Event Operations ---

def create_behavioral_event(db: Session, event_in: schemas.BehavioralEventCreate):
    db_event = models.BehavioralEvent(
        lead_id=event_in.lead_id,
        event_type=event_in.event_type,
        event_details=event_in.event_details
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Recalculate score for the lead
    scoring.calculate_lead_score(db, event_in.lead_id)
    return db_event


# --- Scoring Rules Operations ---

def get_rules(db: Session):
    return db.query(models.ScoringRule).all()

def get_rule(db: Session, rule_id: int):
    return db.query(models.ScoringRule).filter(models.ScoringRule.id == rule_id).first()

def create_rule(db: Session, rule_in: schemas.ScoringRuleCreate):
    db_rule = models.ScoringRule(**rule_in.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    
    # Recalculate all leads since a rule was added
    scoring.recalculate_all_leads(db)
    return db_rule

def update_rule(db: Session, rule_id: int, rule_in: schemas.ScoringRuleUpdate):
    db_rule = get_rule(db, rule_id)
    if not db_rule:
        return None
    
    update_data = rule_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rule, key, value)
        
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    
    # Recalculate all leads since rules have changed
    scoring.recalculate_all_leads(db)
    return db_rule

def delete_rule(db: Session, rule_id: int):
    db_rule = get_rule(db, rule_id)
    if db_rule:
        db.delete(db_rule)
        db.commit()
        # Recalculate all leads
        scoring.recalculate_all_leads(db)
        return True
    return False


# --- Dashboard Operations ---

def get_dashboard_stats(db: Session) -> schemas.DashboardStats:
    total_leads = db.query(models.Lead).count()
    
    # Category counts
    hot_count = db.query(models.Lead).filter(models.Lead.category == "Hot").count()
    warm_count = db.query(models.Lead).filter(models.Lead.category == "Warm").count()
    cold_count = db.query(models.Lead).filter(models.Lead.category == "Cold").count()
    
    # Status counts
    new_count = db.query(models.Lead).filter(models.Lead.status == "New").count()
    contacted_count = db.query(models.Lead).filter(models.Lead.status == "Contacted").count()
    qualified_count = db.query(models.Lead).filter(models.Lead.status == "Qualified").count()
    unqualified_count = db.query(models.Lead).filter(models.Lead.status == "Unqualified").count()
    
    # Average score
    avg_score = db.query(func.avg(models.Lead.score)).scalar() or 0.0
    
    # Recent activity feed
    # Join BehavioralEvent and Lead to construct feed items
    recent_events = (
        db.query(models.BehavioralEvent, models.Lead.name)
        .join(models.Lead, models.BehavioralEvent.lead_id == models.Lead.id)
        .order_by(desc(models.BehavioralEvent.timestamp))
        .limit(15)
        .all()
    )
    
    activity_feed = []
    for event, lead_name in recent_events:
        activity_feed.append(
            schemas.ActivityFeedItem(
                id=event.id,
                lead_id=event.lead_id,
                lead_name=lead_name,
                event_type=event.event_type,
                event_details=event.event_details,
                score_delta=event.score_delta,
                timestamp=event.timestamp
            )
        )
        
    return schemas.DashboardStats(
        total_leads=total_leads,
        category_counts=schemas.CategoryStats(hot=hot_count, warm=warm_count, cold=cold_count),
        status_counts=schemas.StatusStats(
            new=new_count,
            contacted=contacted_count,
            qualified=qualified_count,
            unqualified=unqualified_count
        ),
        recent_activity=activity_feed,
        average_score=float(round(avg_score, 1))
    )
