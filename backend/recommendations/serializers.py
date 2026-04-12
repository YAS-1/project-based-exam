from rest_framework import serializers
from .models import UserMovieInteraction, UserGenrePreference, Watchlist, SharedWatchlist


class UserMovieInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMovieInteraction
        fields = [
            "id", "movie_tmdb_id", "movie_title", "interaction_type",
            "genre_ids", "rating", "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class UserGenrePreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGenrePreference
        fields = ["genre_tmdb_id", "genre_name", "weight", "interaction_count", "updated_at"]


class WatchlistSerializer(serializers.ModelSerializer):
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Watchlist
        fields = [
            "id", "movie_tmdb_id", "movie_title", "poster_path",
            "poster_url", "added_at", "watched", "watched_at",
        ]
        read_only_fields = ["id", "added_at"]

    def get_poster_url(self, obj):
        if obj.poster_path:
            return f"https://image.tmdb.org/t/p/w500{obj.poster_path}"
        return None

# Serializer for sharing watchlists
class SharedWatchlistSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    shared_with_username = serializers.CharField(source='shared_with.username', read_only=True)

    class Meta:
        model = SharedWatchlist
        fields = ["id", "owner", "owner_username", "shared_with", "shared_with_username", "created_at"]
        read_only_fields = ["id", "created_at", "owner"]