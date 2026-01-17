# Jonas - Setup Guide

Complete setup guide for the Jonas German Language Learning Platform.

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (or Docker for PostgreSQL)
- npm or yarn

## Backend Setup

### Option 1: Automated Setup (Recommended)

```bash
cd backend
./setup.sh
```

This script will:
- Create a virtual environment
- Install dependencies
- Create `.env` file with secure secret key
- Start PostgreSQL with Docker
- Run database migrations

### Option 2: Manual Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create `.env` file:**
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL`: PostgreSQL connection string (default: `postgresql://postgres:postgres@localhost:5432/jonas`)
- `SECRET_KEY`: Generate a secure random key:
  ```bash
  python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
  ```

5. **Start PostgreSQL:**
```bash
docker-compose up -d postgres
```

Or use your own PostgreSQL instance and update `DATABASE_URL` in `.env`.

6. **Run migrations:**
```bash
alembic upgrade head
```

7. **Start the server:**
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env.local` file:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. **Start the development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Testing Authentication

1. **Start both servers:**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Test signup:**
   - Go to `http://localhost:3000/signup`
   - Create an account
   - You should be redirected to `/dashboard`

3. **Test login:**
   - Log out from dashboard
   - Go to `http://localhost:3000/login`
   - Log in with your credentials
   - You should be redirected to `/dashboard`

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires auth)

### Users

- `GET /api/v1/users/me` - Get current user profile (requires auth)

## Database Schema

The initial migration creates:
- `users` table with: id, email, hashed_password, full_name, is_active, created_at, updated_at

## Troubleshooting

### Backend Issues

1. **Database connection error:**
   - Ensure PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Verify database `jonas` exists

2. **Migration errors:**
   - Drop and recreate database: `dropdb jonas && createdb jonas`
   - Run migrations again: `alembic upgrade head`

3. **Import errors:**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

1. **API connection error:**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend is running on port 8000
   - Check CORS settings in backend

2. **Authentication not working:**
   - Check browser console for errors
   - Verify token is stored in localStorage
   - Check network tab for API responses

## Next Steps

- Add user profile management
- Implement daily situations
- Add AI conversation endpoints
- Set up LangChain/LangGraph integration
- Add vector embeddings for mistake tracking
