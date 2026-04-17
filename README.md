# Project README

## Profile Intelligence Service

**Purpose**  
A small RESTful service that accepts a name, enriches it using Genderize, Agify, and Nationalize, persists the processed profile, and exposes endpoints to create, retrieve, list, filter, and delete profiles. This README explains the API contract, data model, error handling, idempotency rules, setup, and examples so you can run and submit the task.

---

### Features

- **Integrates three external APIs**: Genderize, Agify, Nationalize (no API keys required).
- **Processes and normalizes** responses into a single profile record.
- **Persists** profiles in a database with **UUID v7** ids and **UTC ISO 8601** timestamps.
- **Idempotent creation** by name (case-insensitive).
- **Filtering** on gender, country_id, and age_group.
- **CORS header** `Access-Control-Allow-Origin: *` included for grading script access.
- **Consistent JSON responses** matching the required structure.

---

### Tech Stack

- **Language**: Node.js
- **Database**: PostgreSQL
- **HTTP**: Express
- **Deployment**: Vercel

---

### Data Model

**profiles** table (example columns)

- **id** — UUID v7 string, primary key
- **name** — string, original name submitted (stored lowercase for idempotency)
- **gender** — string or null
- **gender_probability** — decimal
- **sample_size** — integer
- **age** — integer
- **age_group** — string;
- **country_id** — ISO country code string (top probability from Nationalize)
- **country_probability** — decimal
- **created_at** — UTC ISO 8601 timestamp

**Idempotency rule**  
Profiles are unique by **name** (case-insensitive). If a name already exists, the POST returns the existing profile with a message `"Profile already exists"` and does not create a new record.

---

### API Endpoints

| Method | Endpoint           |                               Description | Success Code | Notes                                             |
| ------ | ------------------ | ----------------------------------------: | -----------: | ------------------------------------------------- |
| POST   | /api/profiles      | Create or return existing profile by name |   201 or 200 | Body: `{ "name": "ella" }`                        |
| GET    | /api/profiles/{id} |                  Retrieve a profile by id |          200 | Returns full profile                              |
| GET    | /api/profiles      |       List profiles with optional filters |          200 | Query params: `gender`, `country_id`, `age_group` |
| DELETE | /api/profiles/{id} |                          Delete a profile |          204 | No content on success                             |

---

### Request and Response Examples

## Create profile

Request:

```http
POST /api/profiles
Content-Type: application/json

{ "name": "ella" }
```

Success response when created (201):

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

Idempotent response when profile exists (200):

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "...existing profile..."
  }
}
```

## Get profile by id

Request:

```http
GET /api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12
```

Response (200):

```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

## List profiles with filters

Request:

```http
GET /api/profiles?gender=male&country_id=NG
```

Response (200):

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "sarah",
      "gender": "female",
      "age": 28,
      "age_group": "adult",
      "country_id": "US"
    }
  ]
}
```

## Delete profile

Request:

```http
DELETE /api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12
```

Response: `204 No Content`

---

### Error Handling and Edge Cases

All error responses follow:

```json
{ "status": "error", "message": "<error message>" }
```

- **400 Bad Request** — Missing or empty `name` in POST.
- **422 Unprocessable Entity** — Invalid type for `name` (non-string).
- **404 Not Found** — GET/DELETE for unknown `id`.
- **502 Bad Gateway** — External API returned invalid or incomplete data. Response structure:

```json
{ "status": "502", "message": "Genderize returned an invalid response" }
```

Possible 502 triggers:

- Genderize returns `gender: null` or `count: 0`.
- Agify returns `age: null`.
- Nationalize returns no country data.
- **500 Internal Server Error** — Unexpected server errors.

## Validation rules

- `name` must be a non-empty string.
- External API failures are surfaced as 502 with the external API name.

---

### Processing Rules Summary

1. Call all three APIs with the provided name.
2. From Genderize extract: `gender`, `probability` → **rename** `count` to `sample_size`.
3. From Agify extract: `age`. Compute `age_group`:
   - `0–12` → `child`
   - `13–19` → `teenager`
   - `20–59` → `adult`
   - `60+` → `senior`
4. From Nationalize extract country list; pick the country with the highest probability as `country_id` and include `country_probability`.
5. If any API returns invalid data per Edge Case rules, return 502 and do not store.
6. Store the processed result with **UUID v7** id and **UTC created_at** timestamp.

---

### Setup and Run Instructions

## Environment variables

- **DATABASE_URL** — connection string for your DB (Postgres/SQLite).
- **PORT** — port to run the server (default 3000).
- **NODE_ENV** — optional.

## Install and run (example Node.js)

```bash
git clone <repo-url>
cd <repo>
pnpm install
# set env vars, e.g. export DATABASE_URL=sqlite://./db.sqlite
pnpm dlx prisma migrate
pnpm start:dev
```
