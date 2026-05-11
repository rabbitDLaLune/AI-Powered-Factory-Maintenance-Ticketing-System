def suggest_root_cause_and_action(issue_title: str, issue_description: str, issue_category: str | None = None):
    text = f"{issue_title} {issue_description} {issue_category or ''}".lower()

    if "overheat" in text or "hot" in text or "burning smell" in text:
        return {
            "root_cause": "Possible motor overload, cooling fan failure, blocked ventilation, or electrical fault.",
            "action": "Stop the machine if unsafe, inspect motor temperature, check cooling fan, clean ventilation area, and verify electrical load.",
            "estimated_hours": 2.5,
        }

    if "vibration" in text or "abnormal noise" in text:
        return {
            "root_cause": "Possible bearing wear, shaft misalignment, loose mounting, or unbalanced rotating component.",
            "action": "Inspect bearings, check alignment, tighten mounting bolts, and perform vibration check.",
            "estimated_hours": 3.0,
        }

    if "leak" in text or "leakage" in text or "hydraulic" in text:
        return {
            "root_cause": "Possible worn seal, loose fitting, cracked hose, or low hydraulic oil level.",
            "action": "Inspect hoses and seals, check fittings, refill oil if needed, and test pressure after repair.",
            "estimated_hours": 2.0,
        }

    if "sensor" in text:
        return {
            "root_cause": "Possible sensor misalignment, damaged cable, dirty sensor surface, or faulty sensor unit.",
            "action": "Clean sensor, inspect wiring, check sensor alignment, and replace sensor if required.",
            "estimated_hours": 1.5,
        }

    if "jam" in text or "jammed" in text:
        return {
            "root_cause": "Possible material blockage, mechanical misalignment, worn roller, or incorrect feeding.",
            "action": "Clear blockage, inspect feeding path, check rollers, and test machine movement.",
            "estimated_hours": 1.8,
        }

    return {
        "root_cause": "Possible mechanical, electrical, or process-related issue. Further inspection is required.",
        "action": "Inspect the machine condition, check recent alarms, review maintenance history, and record findings.",
        "estimated_hours": 2.0,
    }