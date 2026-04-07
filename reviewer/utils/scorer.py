def get_badge_color(score: int) -> str:
    if score >= 8:
        return 'green'
    elif score >= 5:
        return 'orange'
    else:
        return 'red'

def get_severity_color(severity: str) -> str:
    severity_lower = severity.lower()
    
    if severity_lower == 'critical':
        return '#dc2626'
    elif severity_lower == 'high':
        return '#ea580c'
    elif severity_lower == 'medium':
        return '#ca8a04'
    elif severity_lower == 'low':
        return '#16a34a'
    else:
        return '#6b7280'
