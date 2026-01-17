# Jonas Backend API

FastAPI backend for the Jonas German Language Learning Platform.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: A random secret key for JWT tokens

3. Create the database:
```bash
createdb jonas

sudo -u postgres psql

CREATE DATABASE jonas;
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Start the server:
```bash
uvicorn app.main:app --reload --port 8000
```

While adding columns to db
```bash
alembic revision --autogenerate -m "add phone_number to users"
```

The API will be available at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`
