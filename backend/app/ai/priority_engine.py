def predict_priority(issue_title: str, issue_description: str, issue_category: str | None = None) -> str:
    text = f"{issue_title} {issue_description} {issue_category or ''}".lower()

    critical_keywords = [
        "production stopped",
        "line stop",
        "machine down",
        "smoke",
        "burning smell",
        "fire",
        "overheat",
        "electrical trip",
        "safety issue",
        "emergency",
    ]

    high_keywords = [
        "abnormal noise",
        "vibration",
        "leakage",
        "motor fault",
        "pressure low",
        "sensor fault",
        "cannot start",
        "jammed",
    ]

    medium_keywords = [
        "unstable",
        "slow",
        "intermittent",
        "warning",
        "minor fault",
    ]

    if any(keyword in text for keyword in critical_keywords):
        return "Critical"

    if any(keyword in text for keyword in high_keywords):
        return "High"

    if any(keyword in text for keyword in medium_keywords):
        return "Medium"

    return "Low"