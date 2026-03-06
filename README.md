# SGPA Vault

A full-stack web application for VTU students to upload result PDFs, calculate SGPA, and track semester performance on a dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS, Recharts, Lucide React |
| Backend | Python (FastAPI), pdfplumber, Pydantic |
| Database | PostgreSQL + SQLAlchemy ORM |

## Project Structure

```
SGPA/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── config.py        # Environment / DB config
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models (users, results)
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── routes.py        # API endpoints
│   │   └── pdf_parser.py    # VTU PDF parsing + SGPA logic
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FileUpload.jsx   # Drag-and-drop PDF uploader
    │   │   └── Dashboard.jsx    # Charts + results table
    │   ├── services/
    │   │   └── api.js           # API service layer
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL

# Start the API server
uvicorn app.main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users` | Create a student profile |
| `GET` | `/api/users/{id}` | Get user by ID |
| `POST` | `/api/upload` | Upload PDF, returns parsed SGPA |
| `POST` | `/api/save-result` | Save SGPA result to DB |
| `GET` | `/api/results/{user_id}` | Fetch all results for a user |

## Grading System (VTU 2022/24 Scheme)

| Grade | Description | Points |
|-------|-------------|--------|
| O | Outstanding | 10 |
| A+ | Excellent | 9 |
| A | Very Good | 8 |
| B+ | Good | 7 |
| B | Above Average | 6 |
| C | Average | 5 |
| P | Pass | 4 |
| F | Fail | 0 |

SGPA = sum(Credits × Grade Points) / sum(Credits)
