# Software Construction Exam Project

A full-stack movie discovery platform built with **Django REST Framework** (backend) and **Next.js** (frontend), powered by The Movie Database (TMDB) API.

## Project Structure

```
├── backend/          # Django REST API
│   ├── cinequest/    # Project settings & URLs
│   ├── movies/       # Movies app (models, views, TMDB service)
│   ├── users/        # Custom user model & auth
│   └── recommendations/  # Recommendation engine & watchlist
├── frontend/         # Next.js application
│   ├── src/app/      # Pages (home, search, movie detail, etc.)
│   ├── src/components/  # Reusable UI components
│   ├── src/lib/      # API client, auth context, utilities
│   └── src/types/    # TypeScript type definitions
```

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate # ModuleNotFoundError: No module named"movie"
python manage.py sync_movies --genres
python manage.py sync_movies --trending 2
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the `backend/` directory:
```
TMDB_API_KEY=your_tmdb_api_key_here
DJANGO_SECRET_KEY=your_secret_key_here
DEBUG=True
```

## TMDB API
Get your free API key at: https://www.themoviedb.org/settings/api
# project-based-exam
