import datetime
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from . import models, scoring

def seed_db():
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear existing data to ensure clean seed
        db.query(models.BehavioralEvent).delete()
        db.query(models.ScoringRule).delete()
        db.query(models.Lead).delete()
        db.commit()

        print("Cleared existing database records.")

        # 1. Create Default Scoring Rules
        rules = [
            # Demographic Rules
            models.ScoringRule(
                name="Job Role: Executive/C-Level/VP/Founder",
                rule_type="demographic",
                field="job_role",
                operator="contains",
                value="ceo,founder,vp,president,executive,director,c-level,cfo,cto",
                points=30,
                is_active=True
            ),
            models.ScoringRule(
                name="Job Role: Manager/Lead",
                rule_type="demographic",
                field="job_role",
                operator="contains",
                value="manager,lead,head",
                points=15,
                is_active=True
            ),
            models.ScoringRule(
                name="Company Size: Enterprise (>500)",
                rule_type="demographic",
                field="company_size",
                operator="greater_than",
                value="500",
                points=25,
                is_active=True
            ),
            models.ScoringRule(
                name="Company Size: Mid-Market (100-500)",
                rule_type="demographic",
                field="company_size",
                operator="greater_than",
                value="100",
                points=10,
                is_active=True
            ),
            models.ScoringRule(
                name="Email Domain: Generic Personal (Gmail)",
                rule_type="demographic",
                field="email",
                operator="contains",
                value="@gmail.com",
                points=-10,
                is_active=True
            ),
            models.ScoringRule(
                name="Email Domain: Generic Personal (Yahoo/Outlook)",
                rule_type="demographic",
                field="email",
                operator="contains",
                value="@yahoo.com,@outlook.com,@hotmail.com",
                points=-10,
                is_active=True
            ),
            models.ScoringRule(
                name="Industry: Target Sector (Technology/Finance)",
                rule_type="demographic",
                field="industry",
                operator="contains",
                value="technology,software,finance,banking",
                points=10,
                is_active=True
            ),

            # Behavioral Rules
            models.ScoringRule(
                name="Visit: Pricing Page",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="/pricing",
                points=15,
                is_active=True
            ),
            models.ScoringRule(
                name="Visit: Demo Page",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="/demo",
                points=20,
                is_active=True
            ),
            models.ScoringRule(
                name="Download: Case Study",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="case study",
                points=20,
                is_active=True
            ),
            models.ScoringRule(
                name="Download: Whitepaper",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="whitepaper",
                points=15,
                is_active=True
            ),
            models.ScoringRule(
                name="Form Submit: Request Sales Callback",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="contact sales",
                points=35,
                is_active=True
            ),
            models.ScoringRule(
                name="Form Submit: Newsletter Signup",
                rule_type="behavioral",
                field="event_details",
                operator="contains",
                value="newsletter",
                points=5,
                is_active=True
            ),
            models.ScoringRule(
                name="Email Engagement: Opened Email",
                rule_type="behavioral",
                field="event_type",
                operator="equals",
                value="email_open",
                points=5,
                is_active=True
            )
        ]
        db.add_all(rules)
        db.commit()
        print(f"Seeded {len(rules)} scoring rules.")

        # 2. Create Mock Leads
        leads_data = [
            # Sarah Connor - Hot Enterprise Lead
            {
                "lead": models.Lead(
                    name="Sarah Connor",
                    email="sconnor@cyberdyne.com",
                    company="Cyberdyne Systems",
                    job_role="VP of Security Operations",
                    company_size=1200,
                    industry="Technology",
                    phone="+1 (555) 901-2029",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /pricing page", "hours_ago": 48},
                    {"event_type": "resource_download", "event_details": "Downloaded 'AI Threat Assessment Case Study'", "hours_ago": 24},
                    {"event_type": "form_submission", "event_details": "Submitted 'Contact Sales' Callback Form", "hours_ago": 2}
                ]
            },
            # Tony Stark - Hot Enterprise Lead
            {
                "lead": models.Lead(
                    name="Tony Stark",
                    email="tony@starkindustries.com",
                    company="Stark Industries",
                    job_role="Chief Innovation Officer",
                    company_size=5500,
                    industry="Technology",
                    phone="+1 (555) 300-3000",
                    status="Qualified"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /demo page", "hours_ago": 12},
                    {"event_type": "resource_download", "event_details": "Downloaded 'Arc Reactor Integration Whitepaper'", "hours_ago": 6},
                    {"event_type": "form_submission", "event_details": "Submitted 'Request Demo' Form", "hours_ago": 1}
                ]
            },
            # Bruce Wayne - Warm Enterprise Lead
            {
                "lead": models.Lead(
                    name="Bruce Wayne",
                    email="bruce.wayne@waynecorp.com",
                    company="Wayne Enterprises",
                    job_role="Chairman & Owner",
                    company_size=15000,
                    industry="Finance",
                    phone="+1 (555) 888-9999",
                    status="Contacted"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /pricing page", "hours_ago": 72},
                    {"event_type": "email_open", "event_details": "Opened Outreach Campaign Email #1", "hours_ago": 36}
                ]
            },
            # Diana Prince - Warm Mid-Market Lead
            {
                "lead": models.Lead(
                    name="Diana Prince",
                    email="diana.prince@louvre.fr",
                    company="Louvre Museum",
                    job_role="Director of Antiquities",
                    company_size=350,
                    industry="Education",
                    phone="+33 1 40 20 53 17",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /pricing page", "hours_ago": 24},
                    {"event_type": "resource_download", "event_details": "Downloaded 'Archival Preservation Case Study'", "hours_ago": 12}
                ]
            },
            # Hal Jordan - Warm Mid-Market Lead
            {
                "lead": models.Lead(
                    name="Hal Jordan",
                    email="hal.jordan@ferrisaircraft.com",
                    company="Ferris Aircraft",
                    job_role="Chief Test Pilot",
                    company_size=450,
                    industry="Aerospace",
                    phone="+1 (555) 473-3687",
                    status="Contacted"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /demo page", "hours_ago": 120},
                    {"event_type": "email_open", "event_details": "Opened Product Announcement Email", "hours_ago": 96},
                    {"event_type": "email_open", "event_details": "Opened Follow-up Email #1", "hours_ago": 24}
                ]
            },
            # Clark Kent - Warm SME Lead (Gmail)
            {
                "lead": models.Lead(
                    name="Clark Kent",
                    email="clark.kent.reporter@gmail.com",
                    company="Daily Planet Newspaper",
                    job_role="Senior Investigative Reporter",
                    company_size=120,
                    industry="Media",
                    phone="+1 (555) 767-3787",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /pricing page", "hours_ago": 18},
                    {"event_type": "resource_download", "event_details": "Downloaded 'Publishing Systems Case Study'", "hours_ago": 12},
                    {"event_type": "email_open", "event_details": "Opened Welcoming Email", "hours_ago": 8}
                ]
            },
            # Barry Allen - Warm Enterprise Lead
            {
                "lead": models.Lead(
                    name="Barry Allen",
                    email="ballen@centralcity.gov",
                    company="Central City Police Dept",
                    job_role="Lead Forensic Scientist",
                    company_size=850,
                    industry="Government",
                    phone="+1 (555) 786-7860",
                    status="New"
                ),
                "events": [
                    {"event_type": "resource_download", "event_details": "Downloaded 'Chemical Analysis Case Study'", "hours_ago": 120},
                    {"event_type": "email_open", "event_details": "Opened Welcome Email", "hours_ago": 96}
                ]
            },
            # John Doe - Cold SME Lead (Gmail)
            {
                "lead": models.Lead(
                    name="John Doe",
                    email="johndoe1995@gmail.com",
                    company="SmallTech Inc",
                    job_role="Software Engineer",
                    company_size=12,
                    industry="Technology",
                    phone="+1 (555) 123-4567",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited HomePage", "hours_ago": 200}
                ]
            },
            # Peter Parker - Cold SME Lead (Gmail)
            {
                "lead": models.Lead(
                    name="Peter Parker",
                    email="peter.parker.photo@gmail.com",
                    company="Daily Bugle",
                    job_role="Freelance Photographer",
                    company_size=45,
                    industry="Media",
                    phone="+1 (555) 927-7433",
                    status="Unqualified"
                ),
                "events": [
                    {"event_type": "form_submission", "event_details": "Submitted 'Newsletter' Signup Form", "hours_ago": 72}
                ]
            },
            # Selina Kyle - Cold Micro Lead (Yahoo)
            {
                "lead": models.Lead(
                    name="Selina Kyle",
                    email="selina_kyle@yahoo.com",
                    company="Gotham Consulting",
                    job_role="Independent Security Consultant",
                    company_size=1,
                    industry="Security",
                    phone="+1 (555) 228-9662",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited HomePage", "hours_ago": 150}
                ]
            },
            # Arthur Curry - Cold Mid-Market Lead
            {
                "lead": models.Lead(
                    name="Arthur Curry",
                    email="acurry@atlantis.org",
                    company="Atlantis Aquaculture",
                    job_role="Manager of Deep Sea Operations",
                    company_size=250,
                    industry="Aquaculture",
                    phone="+1 (555) 732-2326",
                    status="New"
                ),
                "events": [
                    {"event_type": "page_visit", "event_details": "Visited /features page", "hours_ago": 100}
                ]
            }
        ]

        now = datetime.datetime.utcnow()

        # Seed leads and events
        for item in leads_data:
            lead = item["lead"]
            db.add(lead)
            db.commit()  # commit to generate ID
            
            for event_info in item["events"]:
                event_time = now - datetime.timedelta(hours=event_info["hours_ago"])
                db_event = models.BehavioralEvent(
                    lead_id=lead.id,
                    event_type=event_info["event_type"],
                    event_details=event_info["event_details"],
                    timestamp=event_time
                )
                db.add(db_event)
            db.commit()
            
            # Recalculate each lead score to trigger proper categorization
            scoring.calculate_lead_score(db, lead.id)

        print(f"Seeded {len(leads_data)} mock leads and their behavioral event histories.")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
