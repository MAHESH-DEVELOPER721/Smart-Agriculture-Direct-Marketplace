# AgriDirect - API Documentation

The **Smart Agriculture Direct Marketplace** backend is built on **FastAPI** and **SQLAlchemy** with **PostgreSQL**. It provides microservices and endpoints covering authentication, precision agronomy (soil & crops), climate & water management (drought & irrigation), and farm-direct commerce.

- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

---

## 1. Authentication & Administration (Lead: MAHESH)

### Register User
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Request Body**:
```json
{
  "name": "Mahesh Kumar",
  "email": "mahesh@example.com",
  "password": "Password123!",
  "role": "farmer"
}
```
*(Roles: `"farmer"`, `"consumer"`, `"admin"`)*
- **Response** (`201 Created`):
```json
{
  "id": 1,
  "name": "Mahesh Kumar",
  "email": "mahesh@example.com",
  "role": "farmer",
  "created_at": "2026-11-09T10:00:00"
}
```

### User Login
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Request Body**:
```json
{
  "email": "mahesh@example.com",
  "password": "Password123!"
}
```
- **Response** (`200 OK`):
```json
{
  "access_token": "<jwt_bearer_token>",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Mahesh Kumar",
    "email": "mahesh@example.com",
    "role": "farmer",
    "created_at": "2026-11-09T10:00:00"
  }
}
```

### Current User Profile
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`): User profile object.

### Admin Community Overview
- **Method**: `GET`
- **Endpoint**: `/auth/admin/overview`
- **Headers**: `Authorization: Bearer <admin_access_token>`
- **Response** (`200 OK`):
```json
{
  "total_users": 15,
  "farmers": 8,
  "consumers": 6,
  "admins": 1
}
```

### Admin User Directory
- **Method**: `GET`
- **Endpoint**: `/auth/admin/users`
- **Headers**: `Authorization: Bearer <admin_access_token>`
- **Response** (`200 OK`): Array of registered user profiles.

---

## 2. Soil & Crop Intelligence (Lead: ROHIT)

### Get Soil Analysis
- **Method**: `GET`
- **Endpoint**: `/soil/analysis?location=north-field`
- **Response** (`200 OK`):
```json
{
  "location": "north-field",
  "moisture_pct": 62.0,
  "ph": 6.4,
  "nitrogen": 52.0,
  "phosphorus": 41.0,
  "potassium": 58.0,
  "ph_status": "Optimal",
  "moisture_status": "Optimal",
  "nutrient_status": "Balanced",
  "health_score": 100,
  "recommendation": "Add compost and maintain drip irrigation to keep moisture stable."
}
```

### Submit Field Soil Test
- **Method**: `POST`
- **Endpoint**: `/soil/analysis`
- **Request Body**:
```json
{
  "location": "North Basin Plot B",
  "moisture_pct": 38.5,
  "ph": 5.4,
  "nitrogen": 32.0,
  "phosphorus": 24.0,
  "potassium": 45.0
}
```
- **Response** (`200 OK`): Diagnosed soil health index, status alerts, and customized amendment instructions.

### Get Crop Recommendations
- **Method**: `GET`
- **Endpoint**: `/crop/recommendations?region=north-field&season=kharif&soil_type=loamy`
- **Response** (`200 OK`):
```json
{
  "region": "north-field",
  "season": "kharif",
  "soil_type": "loamy",
  "recommendations": [
    {
      "crop": "Maize",
      "match": 93,
      "category": "Grains",
      "water_requirement": "Moderate (500 - 800 mm)",
      "soil_ph_range": "5.8 - 7.0",
      "season": "Kharif / Monsoon",
      "duration_days": 110,
      "expected_yield": "4.5 - 6.0 tons/ha",
      "reason": "Good moisture retention in the selected region."
    }
  ]
}
```

### Crop Calendar
- **Method**: `GET`
- **Endpoint**: `/crop/calendar?crop=Maize`
- **Response** (`200 OK`): Sowing window, harvest window, growth timeline stages, and agronomic tasks.

---

## 3. Drought & Smart Irrigation (Lead: SUNDAR)

### Drought Risk Monitor
- **Method**: `GET`
- **Endpoint**: `/drought/monitor?region=North+Basin`
- **Response** (`200 OK`):
```json
{
  "region": "North Basin",
  "severity": "moderate",
  "rainfall_mm": 28.0,
  "rainfall_deficit_pct": 34.5,
  "soil_moisture_pct": 39.0,
  "trend": "drying",
  "temperature_c": 32.5,
  "reservoir_level_pct": 46.0,
  "drought_index": 2.8,
  "risk_level": "Moderate Watch",
  "recommendation": "Delay non-essential watering and prioritize drip irrigation for high-value crops."
}
```

### Regional Drought Alerts
- **Method**: `GET`
- **Endpoint**: `/drought/alerts?severity=high`
- **Response** (`200 OK`): Array of regional alerts and emergency advisories.

### Create Drought Bulletin (Admin)
- **Method**: `POST`
- **Endpoint**: `/drought/alerts`
- **Request Body**:
```json
{
  "region": "East Valley",
  "severity": "high",
  "rainfall_mm": 12.0,
  "soil_moisture_pct": 22.0,
  "recommendation": "Enforce groundwater rationing and drip line check."
}
```

### Active Irrigation Schedule
- **Method**: `GET`
- **Endpoint**: `/irrigation/schedule?zone=Field+A`
- **Response** (`200 OK`):
```json
{
  "zone": "Field A",
  "frequency_days": 3,
  "duration_minutes": 35,
  "water_target_mm": 16.0,
  "best_time": "05:30 AM - 08:00 AM (Low Evaporative Window)",
  "system_type": "Precision Drip Irrigation",
  "adjustment": "Increase frequency by one day if temperatures remain above 33°C."
}
```

### Calculate Field Water Dosage
- **Method**: `POST`
- **Endpoint**: `/irrigation/calculate`
- **Request Body**:
```json
{
  "crop": "Tomato",
  "field_area_acres": 2.5,
  "soil_type": "loamy",
  "temperature_c": 34.0,
  "irrigation_method": "drip"
}
```
- **Response** (`200 OK`): Water volume in liters, cycle frequency, duration in minutes, and efficiency score.

---

## 4. Direct Farm Marketplace (Lead: MANGA)

### List Products Catalog
- **Method**: `GET`
- **Endpoint**: `/marketplace/products?category=vegetables&search=tomato`
- **Response** (`200 OK`):
```json
{
  "products": [
    {
      "id": 1,
      "name": "Fresh Organic Tomato Crate",
      "category": "vegetables",
      "price": 32.5,
      "unit": "crate (20kg)",
      "stock": 45,
      "farm": "Sunny Valley Farms",
      "farm_name": "Sunny Valley Farms",
      "description": "Pesticide-free greenhouse tomatoes.",
      "is_featured": true
    }
  ]
}
```

### List Produce (Farmers / Admins)
- **Method**: `POST`
- **Endpoint**: `/marketplace/products`
- **Request Body**:
```json
{
  "name": "Organic Red Chili Box",
  "category": "vegetables",
  "price": 22.0,
  "unit": "box (5kg)",
  "stock": 30,
  "farm_name": "Highland Agro",
  "description": "Sun-dried natural organic chilies.",
  "is_featured": false
}
```
- **Response** (`201 Created`): Created product record.

### Place Customer Order
- **Method**: `POST`
- **Endpoint**: `/marketplace/orders`
- **Request Body**:
```json
{
  "customer_name": "Sarah Connor",
  "customer_email": "sarah@example.com",
  "customer_phone": "+1 555-0192",
  "shipping_address": "100 Green St, Apt 4B",
  "payment_method": "cod",
  "items": [
    {
      "product_id": 1,
      "product_name": "Fresh Organic Tomato Crate",
      "price": 32.5,
      "quantity": 2,
      "unit": "crate (20kg)"
    }
  ]
}
```
- **Response** (`201 Created`):
```json
{
  "id": "ORD-48192",
  "order_code": "ORD-48192",
  "status": "confirmed",
  "total": 65.0,
  "customer_name": "Sarah Connor",
  "shipping_address": "100 Green St, Apt 4B",
  "message": "Order successfully placed and confirmed with farmers!"
}
```

### Get Order Dispatches
- **Method**: `GET`
- **Endpoint**: `/marketplace/orders`
- **Response** (`200 OK`): Array of customer orders with delivery progress and item breakdowns.

---

## 5. Payments & Notifications

### Create Payment for an Order
- **Method**: `POST`
- **Endpoint**: `/payments/create`
- **Request Body**:
```json
{
  "order_id": 5,
  "amount": 128.5,
  "payment_method": "upi"
}
```
- **Response** (`201 Created`): Payment record with a unique transaction ID and pending status.

### Process a Payment
- **Method**: `POST`
- **Endpoint**: `/payments/{payment_id}/process`
- **Request Body**:
```json
{
  "payment_status": "succeeded",
  "gateway_payment_id": "GW-654321",
  "reason": "Sandbox payment approved"
}
```
- **Response** (`200 OK`): Updated payment record and payment notification.

### Get Payment History
- **Method**: `GET`
- **Endpoint**: `/payments/history?customer_id=3`
- **Response** (`200 OK`): List of payment records for the authenticated user or admin.

### List Notifications
- **Method**: `GET`
- **Endpoint**: `/notifications`
- **Response** (`200 OK`): All notifications for the current user, including unread counts and type filters.

### Mark Notification as Read
- **Method**: `POST`
- **Endpoint**: `/notifications/{notification_id}/read`
- **Response** (`200 OK`): Updated notification status.

### Mark All Notifications as Read
- **Method**: `POST`
- **Endpoint**: `/notifications/read-all`
- **Response** (`200 OK`): Count of marked notifications.

