from sqlalchemy.orm import Session
from . import models

def evaluate_condition(field_val, operator, rule_val) -> bool:
    if field_val is None:
        return False
    
    # Standardize string formats for comparison
    field_str = str(field_val).strip().lower()
    rule_str = str(rule_val).strip().lower()

    if operator == "equals":
        return field_str == rule_str
    elif operator == "contains":
        return rule_str in field_str
    elif operator == "greater_than":
        try:
            return float(field_val) > float(rule_val)
        except ValueError:
            return False
    elif operator == "less_than":
        try:
            return float(field_val) < float(rule_val)
        except ValueError:
            return False
    return False

def calculate_lead_score(db: Session, lead_id: int) -> models.Lead:
    # 1. Fetch the lead, active rules, and the lead's events
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        return None
    
    rules = db.query(models.ScoringRule).filter(models.ScoringRule.is_active == True).all()
    events = db.query(models.BehavioralEvent).filter(models.BehavioralEvent.lead_id == lead_id).all()

    demographic_score = 0
    behavioral_score = 0

    # Separate demographic and behavioral rules
    demo_rules = [r for r in rules if r.rule_type == "demographic"]
    behav_rules = [r for r in rules if r.rule_type == "behavioral"]

    # 2. Evaluate demographic rules against Lead fields
    for rule in demo_rules:
        # Get corresponding field on lead model
        field_val = getattr(lead, rule.field, None)
        if field_val is not None:
            if evaluate_condition(field_val, rule.operator, rule.value):
                demographic_score += rule.points

    # 3. Evaluate behavioral rules against lead's events
    # We'll also update each event's score_delta so the UI database matches rules
    for event in events:
        event_score = 0
        for rule in behav_rules:
            # Behavioral rules compare fields from the event (e.g. event_type or event_details)
            field_val = getattr(event, rule.field, None)
            if field_val is not None:
                if evaluate_condition(field_val, rule.operator, rule.value):
                    event_score += rule.points
        
        event.score_delta = event_score
        behavioral_score += event_score
        db.add(event)

    # 4. Sum up and determine Category
    total_score = demographic_score + behavioral_score
    # Cap total score at 0 or let it be negative? Let's allow negative scores, but visually 0 is bottom.
    # We will just store the raw score.
    lead.score = total_score
    
    if total_score >= 70:
        lead.category = "Hot"
    elif total_score >= 35:
        lead.category = "Warm"
    else:
        lead.category = "Cold"

    lead.updated_at = lead.updated_at  # Trigger update time if needed, SQLAlchemy handle automatic update
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    return lead

def recalculate_all_leads(db: Session):
    leads = db.query(models.Lead).all()
    for lead in leads:
        calculate_lead_score(db, lead.id)
