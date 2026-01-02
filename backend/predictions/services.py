from datetime import date
from django.db.models import Sum, Count
from tasks.models import Task
from health.models import DailyHealthLog

def analyze_risk(user):
    """
    Analyzes user data to predict burnout risk and provide insights.
    """
    today = date.today()
    
    # Fetch Health Data
    try:
        health_log = DailyHealthLog.objects.get(user=user, date=today)
        sleep_hours = health_log.sleep_hours
        energy_level = health_log.energy_level
    except DailyHealthLog.DoesNotExist:
        # Default/Fallback values if no log exists yet
        sleep_hours = 7.0 
        energy_level = 5

    # Fetch Task Data
    active_tasks_count = Task.objects.filter(user=user, status='ACTIVE').count()
    
    # Logic Heuristics
    risk_score = 0
    insights = []

    # 1. Sleep Analysis
    if sleep_hours < 5:
        risk_score += 4
        insights.append("Sleep is critically low. Focus on recovery.")
    elif sleep_hours < 7:
        risk_score += 2
        insights.append("Sleep is suboptimal. Avoid heavy mental load.")
    else:
        insights.append("Sleep is good. Great day for productivity.")

    # 2. Energy Analysis
    if energy_level < 4:
        risk_score += 3
        insights.append("Energy is low. Stick to easy tasks.")
    elif energy_level > 8:
        insights.append("High energy detected! Tackle your hardest project.")

    # 3. Workload Analysis
    if active_tasks_count > 8:
        risk_score += 3
        insights.append(f"High workload ({active_tasks_count} tasks). Prioritize top 3.")
    
    # Determine Risk Level
    if risk_score >= 6:
        risk_level = "HIGH"
        main_message = "⚠️ High Burnout Risk: Take it easy today."
    elif risk_score >= 3:
        risk_level = "MEDIUM"
        main_message = "⚖️ Moderate Load: Pace yourself."
    else:
        risk_level = "LOW"
        main_message = "✅ All Systems Go: You are primed for success."

    return {
        'risk_level': risk_level,
        'risk_score': risk_score, # 0-10 scale
        'main_message': main_message,
        'details': insights
    }
