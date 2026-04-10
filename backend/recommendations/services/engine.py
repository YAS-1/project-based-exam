import logging
from collections import Counter
from django.db.models import Avg, Count
from movies.services.tmdb_service import TMDBService

logger = logging.getLogger(__name__)

# Interaction weights
INTERACTION_WEIGHTS = {
    "like": 5.0,
    "watched": 3.0,
    "watchlist": 2.5,
    "view": 1.0,
    "search": 0.5,
    "dislike": -3.0,
}


class RecommendationEngine:
    """Class to generate personalized movie recommendations."""

    def __init__(self):
        self.tmdb = TMDBService()

    def compute_genre_preferences(self, user) -> list:
        from recommendations.models import UserMovieInteraction, UserGenrePreference

        interactions = UserMovieInteraction.objects.filter(user=user)
        genre_scores = Counter()
        genre_names = {}

        for interaction in interactions:
            w = INTERACTION_WEIGHTS.get(interaction.interaction_type, 1.0)
            for genre_id in interaction.genre_ids:
                genre_scores[genre_id] += w
                if genre_id not in genre_names:
                    from movies.models import Genre
                    try:
                        genre = Genre.objects.get(tmdb_id=genre_id)
                        genre_names[genre_id] = genre.name
                    except Genre.DoesNotExist:
                        genre_names[genre_id] = f"Genre {genre_id}"

        ### normalizing scores to 0-100 range
        if genre_scores:
            max_score = max(genre_scores.values())
            if max_score > 0:
                for gid in genre_scores:
                    genre_scores[gid] = (genre_scores[gid] / max_score) * 100

        ## saving preferences
        for genre_id, score in genre_scores.items():
            UserGenrePreference.objects.update_or_create(
                user=user,
                genre_tmdb_id=genre_id,
                defaults={
                    "genre_name": genre_names.get(genre_id, ""),
                    "weight": max(score, 0),
                    "interaction_count": sum(
                        1 for i in interactions if genre_id in i.genre_ids
                    ),
                },
            )

        return sorted(genre_scores.items(), key=lambda x: x[1], reverse=True)

    def get_recommendations(self, user, page: int = 1, limit: int = 20) -> list:
        from recommendations.models import UserMovieInteraction

        ## computing fresh preferences
        preferences = self.compute_genre_preferences(user)

        if not preferences:
            data = self.tmdb.get_trending_movies(page=page)
            return data.get("results", [])

        ## getting movies the user has already seen
        seen_ids = set(
            UserMovieInteraction.objects.filter(
                user=user,
                interaction_type__in=["watched", "dislike"],
            ).values_list("movie_tmdb_id", flat=True)
        )

        # getting top 3 genres
        top_genres = preferences[:3]
        all_movies = []

        for genre_id, score in top_genres:
            data = self.tmdb.discover_movies(
                with_genres=genre_id,
                sort_by="vote_average.desc",
                page=page,
                **{"vote_count.gte": 100} # Corrected the parameter spelling from vote_count_gte to the TMDB-compliant vote_count.gte
            )
            movies = data.get("results", [])
            for m in movies:
                m["_recommendation_score"] = score * m.get("vote_average", 0)
            all_movies.extend(movies)

        seen_in_batch = set()
        unique_movies = []
        for m in all_movies:
            mid = m["id"]
            if mid not in seen_ids and mid not in seen_in_batch:
                seen_in_batch.add(mid)
                unique_movies.append(m)

        ### sorting by recommendation score
        unique_movies.sort(key=lambda x: x.get("_recommendation_score", 0), reverse=True)

        return unique_movies[:limit]

    def get_director_recommendations(self, director_tmdb_id: int, exclude_movie_id: int = None) -> list:
        """getting other movies by a specific director."""
        data = self.tmdb.get_person_details(director_tmdb_id)
        if not data:
            return []

        credits = data.get("movie_credits", {}).get("crew", [])
        directed = [
            c for c in credits
            if c.get("job") == "Director" and c.get("id") != exclude_movie_id
        ]

        ##sorting by popularity
        directed.sort(key=lambda x: x.get("popularity", 0), reverse=True)
        return directed[:10]

    def get_because_you_watched(self, user, limit: int = 20) -> dict:
        from recommendations.models import UserMovieInteraction

        recent = UserMovieInteraction.objects.filter(
            user=user,
            interaction_type__in=["watched", "like"],
        ).order_by("-created_at")[:5]

        results = {}
        for interaction in recent:
            data = self.tmdb.get_movie_recommendations(interaction.movie_tmdb_id)
            movies = data.get("results", [])[:5]
            if movies:
                results[interaction.movie_title] = movies

        return results