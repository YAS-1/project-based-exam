from django.db import models
from django.conf import settings


class UserMovieInteraction(models.Model):

    class InteractionType(models.TextChoices):
        VIEW = "view", "Viewed"
        LIKE = "like", "Liked"
        DISLIKE = "dislike", "Disliked"
        WATCHLIST = "watchlist", "Added to Watchlist"
        WATCHED = "watched", "Watched"
        SEARCH = "search", "Searched"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="movie_interactions",
    )
    movie_tmdb_id = models.IntegerField(db_index=True)
    movie_title = models.CharField(max_length=500, blank=True, default="")
    interaction_type = models.CharField(max_length=20, choices=InteractionType.choices)
    genre_ids = models.JSONField(default=list, blank=True, help_text="Genre IDs at time of interaction")
    rating = models.FloatField(null=True, blank=True, help_text="User rating 1-10")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "interaction_type"]),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.interaction_type} → {self.movie_title}"


class UserGenrePreference(models.Model):
    """Computed genre preferences based on user interactions."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="genre_preferences",
    )
    genre_tmdb_id = models.IntegerField()
    genre_name = models.CharField(max_length=100)
    weight = models.FloatField(default=0, help_text="Computed preference score 0-100")
    interaction_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "genre_tmdb_id"]
        ordering = ["-weight"]

    def __str__(self):
        return f"{self.user.username}: {self.genre_name} ({self.weight:.1f})"


class Watchlist(models.Model):
    """User's movie watchlist."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist",
    )
    movie_tmdb_id = models.IntegerField()
    movie_title = models.CharField(max_length=500)
    poster_path = models.CharField(max_length=255, blank=True, default="")
    added_at = models.DateTimeField(auto_now_add=True)
    watched = models.BooleanField(default=False)
    watched_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "movie_tmdb_id"]
        ordering = ["-added_at"]

    def __str__(self):
        status = "watched" if self.watched else "pending"
        return f"{self.user.username}: {self.movie_title} ({status})"


# Model for sharing watchlists
class SharedWatchlist(models.Model):
    """Tracks which users have shared their watchlist with others."""
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shared_watchlists_owned",
        help_text="The user sharing their watchlist"
    )
    shared_with = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shared_watchlists_received",
        help_text="The user receiving access to the watchlist"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["owner", "shared_with"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.owner.username} shared with {self.shared_with.username}"
