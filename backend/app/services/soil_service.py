from app.schemas.soil import SoilAnalysisRequest

def analyze_soil(payload: SoilAnalysisRequest) -> dict:
    if payload.ph < 5.5:
        ph_status = "Acidic"
    elif payload.ph <= 7.5:
        ph_status = "Near-neutral range"
    else:
        ph_status = "Alkaline"

    nutrient_values = {
        "Nitrogen": payload.nitrogen,
        "Phosphorus": payload.phosphorus,
        "Potassium": payload.potassium,
    }
    low_values = [name for name, value in nutrient_values.items() if value < 20]
    summary = ("Low demo-range reading(s): " + ", ".join(low_values)
               if low_values else "No NPK value is below the demo threshold")

    return {
        "ph_status": ph_status,
        "nutrient_summary": summary,
        "soil_type": payload.soil_type.replace("_", " ").title(),
        "note": "Educational demo only. Interpret NPK using your lab report's units and local agricultural guidance; do not use these demo thresholds as fertilizer advice."
    }
