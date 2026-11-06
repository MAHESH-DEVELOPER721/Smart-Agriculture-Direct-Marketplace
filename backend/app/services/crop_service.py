from app.schemas.soil import CropRecommendationRequest

def recommend_crops(payload: CropRecommendationRequest) -> dict:
    suggestions = []
    soil = payload.soil_type.lower()

    if 20 <= payload.temperature_c <= 35 and payload.rainfall_mm >= 500:
        suggestions.append({"name": "Maize", "reason": "Demo rule: warm temperature and moderate seasonal rainfall."})
    if payload.rainfall_mm >= 900 and 20 <= payload.temperature_c <= 32:
        suggestions.append({"name": "Rice", "reason": "Demo rule: higher seasonal rainfall and warm temperature."})
    if soil in {"black", "clay"} and 18 <= payload.temperature_c <= 35:
        suggestions.append({"name": "Cotton", "reason": "Demo rule: selected soil type and warm temperature."})
    if 6.0 <= payload.ph <= 7.5 and payload.rainfall_mm < 900:
        suggestions.append({"name": "Pulses", "reason": "Demo rule: near-neutral pH and moderate rainfall."})
    if payload.rainfall_mm < 500 and payload.temperature_c >= 20:
        suggestions.append({"name": "Millets", "reason": "Demo rule: lower rainfall and warm conditions."})
    if not suggestions:
        suggestions.append({"name": "Consult local crop guidance", "reason": "The sample rules did not find a suggestion for these values."})

    return {
        "recommendations": suggestions[:4],
        "note": "These are illustrative student-project rules, not a validated agronomic model. Consider season, irrigation, region, and local agricultural advice."
    }
