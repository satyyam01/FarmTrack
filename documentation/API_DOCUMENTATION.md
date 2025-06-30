# FarmTrack API Documentation
## Animal Endpoints

### Base URL
`http://localhost:3000/api`

---

## Validation Rules

### General Rules
- All dates must be in YYYY-MM-DD format
- String fields have maximum length limits
- Required fields must be provided

### Checkup Specific Rules
- `animal_id`: Required, must reference existing animal
- `date`: Required, valid date format
- `vet_name`: Required, max 255 characters
- `notes`: Optional, max 1000 characters

---

### 1. Create Animal
**POST** `/animals`

**Request Body:**
```json
{
  "tag_number": "string (required, unique, max 255 chars)",
  "name": "string (required)",
  "type": "enum (Cow, Hen, Horse, Sheep, Goat)",
  "age": "integer (required, min 0)",
  "gender": "enum (Male, Female)",
  "last_pregnancy": "date (optional)",
  "yields": "array of Yield objects (optional)",
  "medications": "array of Medication objects (optional)",
  "checkups": "array of Checkup objects (optional)",
  "notes": "array of Note objects (optional)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "tag_number": "string",
  "name": "string",
  "type": "string",
  "age": "integer",
  "gender": "string",
  "last_pregnancy": "date",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "yields": "array",
  "medications": "array",
  "checkups": "array",
  "notes": "array"
}
```

---

### 2. Checkup Endpoints

#### Create Checkup
**POST** `/checkups`

**Request Body:**
```json
{
  "animal_id": "integer (required)",
  "date": "string (required, YYYY-MM-DD)",
  "vet_name": "string (required, max 255 chars)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "animal_id": "integer",
  "date": "string",
  "vet_name": "string",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "animal_id, date, and vet_name are required"
}

// Invalid date format
{
  "error": "Date must be in YYYY-MM-DD format"
}

// Vet name too long
{
  "error": "Vet name must be 255 characters or less"
}

// Notes too long
{
  "error": "Notes must be 1000 characters or less"
}

// Animal not found
{
  "error": "Animal not found"
}
```

---

### 3. Get All Animals
**GET** `/animals`

**Success Response (200 OK):**
```json
[
  {
    "id": "integer",
    "tag_number": "string",
    "name": "string",
    "type": "string",
    "age": "integer",
    "gender": "string",
    "last_pregnancy": "date",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "yields": "array",
    "medications": "array",
    "checkups": "array",
    "notes": "array"
  }
]
```

---

### 3. Get Single Animal
**GET** `/animals/:id`

**Success Response (200 OK):**
```json
{
  "id": "integer",
  "tag_number": "string",
  "name": "string",
  "type": "string",
  "age": "integer",
  "gender": "string",
  "last_pregnancy": "date",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "yields": "array",
  "medications": "array",
  "checkups": "array",
  "notes": "array"
}
```

---

### 4. Update Animal
**PUT** `/animals/:id`

**Request Body:**
```json
{
  "tag_number": "string (optional)",
  "name": "string (optional)",
  "type": "enum (optional)",
  "age": "integer (optional)",
  "gender": "enum (optional)",
  "last_pregnancy": "date (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "id": "integer",
  "tag_number": "string",
  "name": "string",
  "type": "string",
  "age": "integer",
  "gender": "string",
  "last_pregnancy": "date",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### 5. Delete Animal
**DELETE** `/animals/:id`

**Success Response (200 OK):**
```json
{
  "message": "Animal deleted"
}
```

---

### 4. Medication Endpoints

#### Create Medication
**POST** `/medications`

**Request Body:**
```json
{
  "animal_id": "integer (required)",
  "medicine_name": "string (required, max 255 chars)",
  "dosage": "string (required, format: 'number unit')",
  "start_date": "string (required, YYYY-MM-DD)",
  "end_date": "string (optional, YYYY-MM-DD)",
  "notes": "string (optional, max 1000 chars)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "animal_id": "integer",
  "medicine_name": "string",
  "dosage": "string",
  "start_date": "string",
  "end_date": "string",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/medications \
-H "Content-Type: application/json" \
-d '{
  "animal_id": 2,
  "medicine_name": "Antibiotic",
  "dosage": "5 mg",
  "start_date": "2025-04-06",
  "notes": "Administer with food"
}'
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "animal_id, medicine_name, dosage, and start_date are required"
}

// Invalid date format
{
  "error": "start_date must be in YYYY-MM-DD format"
}

// Medication name too long
{
  "error": "Medication name must be 255 characters or less"
}

// Invalid dosage format
{
  "error": "Dosage must be in format 'number unit' (e.g., '5 mg')"
}

// Animal not found
{
  "error": "Animal not found"
}
```

---

### 5. Yield Endpoints

#### Create Yield
**POST** `/yields`

**Request Body:**
```json
{
  "animal_id": "integer (required)",
  "yield_type": "string (required, e.g., 'Milk', 'Eggs', 'Wool')",
  "quantity": "number (required, positive)",
  "unit_type": "string (required, one of: 'liters', 'kilograms', 'units')",
  "date": "string (required, YYYY-MM-DD)",
  "notes": "string (optional)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "animal_id": "integer",
  "yield_type": "string",
  "quantity": "number",
  "unit_type": "string",
  "date": "string",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/yields \
-H "Content-Type: application/json" \
-d '{
  "animal_id": 2,
  "yield_type": "Milk",
  "quantity": 5.2,
  "unit_type": "liters",
  "date": "2025-04-06",
  "notes": "Morning yield"
}'
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "animal_id, yield_type, quantity, unit_type, and date are required"
}

// Invalid date format
{
  "error": "date must be in YYYY-MM-DD format"
}

// Invalid quantity
{
  "error": "quantity must be a positive number"
}

// Invalid unit_type
{
  "error": "unit_type must be one of: liters, kilograms, units"
}

// Animal not found
{
  "error": "Animal not found"
}
```

---

### 6. Note Endpoints

#### Create Note
**POST** `/notes`

**Request Body:**
```json
{
  "animal_id": "integer (required)",
  "content": "string (required, max 1000 chars)",
  "date": "string (optional, YYYY-MM-DD)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "animal_id": "integer",
  "content": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/notes \
-H "Content-Type: application/json" \
-d '{
  "animal_id": 2,
  "content": "Regular milk production observed",
  "date": "2025-04-06"
}'
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "animal_id and content are required"
}

// Content too long
{
  "error": "content must be 1000 characters or less"
}

// Animal not found
{
  "error": "Animal not found"
}
```

---

### 7. Return Log Endpoints

#### Create Return Log
**POST** `/return-logs`

**Request Body:**
```json
{
  "animal_id": "integer (required)",
  "return_date": "string (required, YYYY-MM-DD)",
  "return_reason": "string (required)",
  "notes": "string (optional)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "integer",
  "animal_id": "integer",
  "return_date": "string",
  "return_reason": "string",
  "notes": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/return-logs \
-H "Content-Type: application/json" \
-d '{
  "animal_id": 2,
  "return_date": "2025-04-06",
  "return_reason": "Completed treatment",
  "notes": "Animal returned to pasture"
}'
```

**Error Responses:**
```json
// Missing required fields
{
  "error": "animal_id, return_date, and return_reason are required"
}

// Invalid date format
{
  "error": "return_date must be in YYYY-MM-DD format"
}

// Animal not found
{
  "error": "Animal not found"
}
```

---

### 8. Error Responses
**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Animal not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error message"
}
