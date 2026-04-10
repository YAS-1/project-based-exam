import logging
from typing import Optional
from django.conf import settings
from django.core.cache import cache
from django.utils.text import slugify

import requests

logger = logging.getLogger(__name__)

CACHE_TTL_SHORT = 600      # 10 min for trending/search
CACHE_TTL_MEDIUM = 3600    # 1 hour for movie details
CACHE_TTL_LONG = 86400     # 24 hours for genres/people


class TMDBService:
    """Client for the TMDB REST API v3."""

    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_API_BASE_URL
        self.session = requests.Session()
        self.session.params = {"api_key": self.api_key}

    ### class helper functions

    def _get(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Make Get request to TMDB with caching."""
        cache_key = f"tmdb:{endpoint}:{params}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        url = f"{self.base_url}/{endpoint}"
        try:
            response = self.session.get(url, params=params or {}, timeout=10)
            response.raise_for_status()
            data = response.json()
            cache.set(cache_key, data, CACHE_TTL_MEDIUM)
            return data
        except requests.RequestException as e:
            logger.error(f"TMDB API error for {endpoint}: {e}")
            return {}


    def search_movies(self, query: str, page: int = 1) -> dict:
        """searching movies by title."""
        return self._get("search/movie", {"query": query, "page": page})

    def get_movie_details(self, tmdb_id: int) -> dict:
        """getting  full movie details with credits, videos, and recommendations."""
        return self._get(
            f"movie/{tmdb_id}",
            {"append_to_response": "credits,videos,recommendations,similar,watch/providers"},
        )

    def get_trending_movies(self, time_window: str = "week", page: int = 1) -> dict:
        """getting  trending movies (day or week)."""
        return self._get(f"trending/movie/{time_window}", {"page": page})

    def get_popular_movies(self, page: int = 1) -> dict:
        """getting  popular movies."""
        return self._get("movie/popular", {"page": page})

    def get_top_rated_movies(self, page: int = 1) -> dict:
        """getting  top-rated movies."""
        return self._get("movie/top_rated", {"page": page})

    def get_now_playing(self, page: int = 1) -> dict:
        """getting  movies currently in theatres."""
        return self._get("movie/now_playing", {"page": page})

    def get_upcoming_movies(self, page: int = 1) -> dict:
        """getting  upcoming movies."""
        return self._get("movie/upcoming", {"page": page})

    def get_movie_recommendations(self, tmdb_id: int, page: int = 1) -> dict:
        """getting  TMDB-powered recommendations for a movie."""
        return self._get(f"movie/{tmdb_id}/recommendations", {"page": page})

    def get_similar_movies(self, tmdb_id: int, page: int = 1) -> dict:
        """getting  similar movies."""
        return self._get(f"movie/{tmdb_id}/similar", {"page": page})

    def discover_movies(self, **kwargs) -> dict:
        """
        Discover movies with flexible filters.
        Supports: with_genres, sort_by, primary_release_year,
                  vote_average.gte, with_people, etc.
        """
        return self._get("discover/movie", kwargs)


    def get_genres(self) -> list:
        """getting  all movie genres."""
        cache_key = "tmdb:genres:movie"
        cached = cache.get(cache_key)
        if cached:
            return cached

        data = self._get("genre/movie/list")
        genres = data.get("genres", [])
        cache.set(cache_key, genres, CACHE_TTL_LONG)
        return genres

    def get_movies_by_genre(self, genre_id: int, page: int = 1, sort_by: str = "popularity.desc") -> dict:
        """getting  movies filtered by genre."""
        return self.discover_movies(with_genres=genre_id, page=page, sort_by=sort_by)


    def get_person_details(self, person_id: int) -> dict:
        """getting  person (director/actor) details with movie credits."""
        return self._get(
            f"person/{person_id}",
            {"append_to_response": "movie_credits,external_ids"},
        )

    def search_people(self, query: str, page: int = 1) -> dict:
        """Search for people."""
        return self._get("search/person", {"query": query, "page": page})


    def get_watch_providers(self, tmdb_id: int, country: str = "US") -> dict:
        """getting  watch providers for a movie in a specific country."""
        data = self._get(f"movie/{tmdb_id}/watch/providers")
        results = data.get("results", {})
        return results.get(country, {})


class MovieSyncService:
    """Syncs TMDB data to local Django models."""

    def __init__(self):
        self.tmdb = TMDBService()

    def sync_genres(self):
        """Syncing all genres from TMDB to local DB."""
        from movies.models import Genre

        genres = self.tmdb.get_genres()
        for g in genres:
            Genre.objects.update_or_create(
                tmdb_id=g["id"],
                defaults={"name": g["name"], "slug": slugify(g["name"])},
            )
        logger.info(f"Synced {len(genres)} genres")

    def sync_movie(self, tmdb_id: int):
        """Syncing a single movie from TMDB to local DB with full details."""
        from movies.models import Movie, Genre, Person, MovieCast, WatchProvider

        data = self.tmdb.get_movie_details(tmdb_id)
        if not data or "id" not in data:
            logger.warning(f"Could not fetch movie {tmdb_id}")
            return None

        movie, _ = Movie.objects.update_or_create(
            tmdb_id=data["id"],
            defaults={
                "imdb_id": data.get("imdb_id", ""),
                "title": data.get("title", ""),
                "original_title": data.get("original_title", ""),
                "overview": data.get("overview", ""),
                "tagline": data.get("tagline", ""),
                "release_date": data.get("release_date") or None,
                "runtime": data.get("runtime"),
                "vote_average": data.get("vote_average", 0),
                "vote_count": data.get("vote_count", 0),
                "popularity": data.get("popularity", 0),
                "poster_path": data.get("poster_path", ""),
                "backdrop_path": data.get("backdrop_path", ""),
                "budget": data.get("budget", 0),
                "revenue": data.get("revenue", 0),
                "status": data.get("status", ""),
                "homepage": data.get("homepage", ""),
            },
        )

        # Sync genres
        genre_ids = []
        for g in data.get("genres", []):
            genre, _ = Genre.objects.get_or_create(
                tmdb_id=g["id"],
                defaults={"name": g["name"], "slug": slugify(g["name"])},
            )
            genre_ids.append(genre.id)
        movie.genres.set(genre_ids)

        # Sync credits (directors + top cast)
        credits = data.get("credits", {})

        # Directors
        director_ids = []
        for crew in credits.get("crew", []):
            if crew.get("job") == "Director":
                person, _ = Person.objects.update_or_create(
                    tmdb_id=crew["id"],
                    defaults={
                        "name": crew.get("name", ""),
                        "profile_path": crew.get("profile_path", "") or "",
                        "known_for_department": crew.get("known_for_department", ""),
                    },
                )
                director_ids.append(person.id)
        movie.directors.set(director_ids)

        # Top 10 cast
        MovieCast.objects.filter(movie=movie).delete()
        for i, cast_member in enumerate(credits.get("cast", [])[:10]):
            person, _ = Person.objects.update_or_create(
                tmdb_id=cast_member["id"],
                defaults={
                    "name": cast_member.get("name", ""),
                    "profile_path": cast_member.get("profile_path", "") or "",
                    "known_for_department": cast_member.get("known_for_department", ""),
                },
            )
            MovieCast.objects.create(
                movie=movie,
                person=person,
                character=cast_member.get("character", ""),
                order=i,
            )

        # Trailer (first YouTube trailer)
        videos = data.get("videos", {}).get("results", [])
        for v in videos:
            if v.get("site") == "YouTube" and v.get("type") == "Trailer":
                movie.trailer_key = v["key"]
                movie.save(update_fields=["trailer_key"])
                break

        # Watch providers
        providers = data.get("watch/providers", {}).get("results", {}).get("US", {})
        WatchProvider.objects.filter(movie=movie).delete()
        for ptype in ["flatrate", "rent", "buy", "free"]:
            type_map = {"flatrate": "stream", "rent": "rent", "buy": "buy", "free": "free"}
            for p in providers.get(ptype, []):
                WatchProvider.objects.create(
                    movie=movie,
                    provider_name=p.get("provider_name", ""),
                    provider_type=type_map[ptype],
                    logo_path=p.get("logo_path", "") or "",
                    link=providers.get("link", ""),
                    country_code="US",
                )

        logger.info(f"Synced movie: {movie.title}")
        return movie

    def sync_trending(self, pages: int = 3):
        """Sync trending movies to local DB."""
        for page in range(1, pages + 1):
            data = self.tmdb.get_trending_movies(page=page)
            for movie_data in data.get("results", []):
                self.sync_movie(movie_data["id"])


class WikipediaService:
    """Enriches movies with Wikipedia summaries."""

    BASE_URL = "https://en.wikipedia.org/api/rest_v1"

    @staticmethod
    def get_movie_summary(title: str, year: Optional[int] = None) -> dict:
        """getting  Wikipedia summary for a movie."""
        search_title = f"{title} ({year} film)" if year else f"{title} (film)" # I structured the string variables handling the wikipedia fetch parameters that returns the summary of the movie

        cache_key = f"wiki:{search_title}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(search_title)}"
            response = requests.get(url, timeout=5)

            if response.status_code == 404 and year:
                # Fallback without year
                url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(f'{title} (film)')}"
                response = requests.get(url, timeout=5)

            if response.status_code == 200:
                data = response.json()
                result = {
                    "summary": data.get("extract", ""),
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                    "thumbnail": data.get("thumbnail", {}).get("source", ""),
                }
                cache.set(cache_key, result, CACHE_TTL_LONG)
                return result
        except requests.RequestException as e:
            logger.error(f"Wikipedia API error for {title}: {e}")

        return {"summary": "", "url": "", "thumbnail": ""}
