from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import UserMovieInteraction, UserGenrePreference, Watchlist
from .serializers import (
    UserMovieInteractionSerializer,
    UserGenrePreferenceSerializer,
    WatchlistSerializer,
)
from .services.engine import RecommendationEngine
from movies.serializers import TMDBMovieSerializer

engine = RecommendationEngine()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def personalized_recommendations(request):
    """GET /api/recommendations/for-you/ → personalized picks."""
    page = int(request.query_params.get("page", 1))
    movies = engine.get_recommendations(request.user, page=page)
    serializer = TMDBMovieSerializer(movies, many=True)
    return Response({"results": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def because_you_watched(request):
    """GET /api/recommendations/because-you-watched/"""
    data = engine.get_because_you_watched(request.user)
    result = {}
    for title, movies in data.items():
        result[title] = TMDBMovieSerializer(movies, many=True).data
    return Response(result)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def genre_preferences(request):
    """GET /api/recommendations/preferences/"""
    # Recomputing preferences
    engine.compute_genre_preferences(request.user)
    prefs = UserGenrePreference.objects.filter(user=request.user)
    serializer = UserGenrePreferenceSerializer(prefs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def track_interaction(request):
    """
    POST /api/recommendations/track/
    Body: { movie_tmdb_id, movie_title, interaction_type, genre_ids?, rating? }
    """
    serializer = UserMovieInteractionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WatchlistViewSet(viewsets.ModelViewSet):
    """User's watchlist CRUD."""
    serializer_class = WatchlistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "movie_tmdb_id" # Delete a movie from watchlist using its tmdb id

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_watched(self, request, pk=None):
        """POST /api/recommendations/watchlist/{id}/mark_watched/"""
        item = self.get_object()
        item.watched = True
        item.watched_at = timezone.now()
        item.save()
        return Response(WatchlistSerializer(item).data)


### dashboard stats

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    GET /api/recommendations/dashboard/
    Returns aggregated stats for the user's dashboard.
    """
    from collections import Counter
    from django.db.models import Count, Avg
    from django.db.models.functions import TruncDate

    user = request.user

    ## all interactions
    interactions = UserMovieInteraction.objects.filter(user=user)
    total_interactions = interactions.count()
    likes = interactions.filter(interaction_type="like").count()
    dislikes = interactions.filter(interaction_type="dislike").count()
    watched = interactions.filter(interaction_type="watched").count()
    searches = interactions.filter(interaction_type="search").count()

    ### watchlist stats
    watchlist = Watchlist.objects.filter(user=user)
    watchlist_total = watchlist.count()
    watchlist_watched = watchlist.filter(watched=True).count()

    ## genre distribution from interactions
    genre_counter = Counter()
    for interaction in interactions.filter(interaction_type__in=["like", "watched", "watchlist"]):
        for gid in interaction.genre_ids:
            genre_counter[gid] += 1

    ## mapping genre IDs to names
    from movies.models import Genre
    genre_distribution = []
    for gid, count in genre_counter.most_common(10):
        try:
            genre = Genre.objects.get(tmdb_id=gid)
            genre_distribution.append({"name": genre.name, "tmdb_id": gid, "count": count})
        except Genre.DoesNotExist:
            genre_distribution.append({"name": f"Genre {gid}", "tmdb_id": gid, "count": count})

    engine.compute_genre_preferences(user)
    prefs = UserGenrePreference.objects.filter(user=user).order_by("-weight")[:10]
    preference_scores = [
        {"name": p.genre_name, "weight": round(p.weight, 1), "count": p.interaction_count}
        for p in prefs
    ]

    ## the activity over time (last 30 days)
    from datetime import timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily_activity = (
        interactions.filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    activity_timeline = [
        {"date": str(d["date"]), "count": d["count"]}
        for d in daily_activity
    ]

    ### recent interactions
    recent = interactions.order_by("-created_at")[:10]
    recent_data = UserMovieInteractionSerializer(recent, many=True).data

    ### average rating given
    avg_rating = interactions.filter(rating__isnull=False).aggregate(avg=Avg("rating"))["avg"]

    return Response({
        "summary": {
            "total_interactions": total_interactions,
            "likes": likes,
            "dislikes": dislikes,
            "watched": watched,
            "searches": searches,
            "watchlist_total": watchlist_total,
            "watchlist_watched": watchlist_watched,
            "average_rating": round(avg_rating, 1) if avg_rating else None,
        },
        "genre_distribution": genre_distribution,
        "preference_scores": preference_scores,
        "activity_timeline": activity_timeline,
        "recent_activity": recent_data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def share_watchlist(request):
    """POST /api/recommendations/shared-watchlists/share/"""
    from .models import SharedWatchlist
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    shared_with_id = request.data.get("user_id")
    if not shared_with_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        shared_with_user = User.objects.get(id=shared_with_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
    if request.user.id == shared_with_id:
        return Response({"error": "Cannot share with yourself"}, status=status.HTTP_400_BAD_REQUEST)
        
    shared, created = SharedWatchlist.objects.get_or_create(
        owner=request.user,
        shared_with=shared_with_user
    )
    
    from .serializers import SharedWatchlistSerializer
    return Response(SharedWatchlistSerializer(shared).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# Get watchlists that were shared with the requesting user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shared_watchlists_list(request):
    """GET /api/recommendations/shared-watchlists/"""
    from .models import SharedWatchlist
    from .serializers import SharedWatchlistSerializer
    # Get watchlists that were shared with the requesting user
    shared_with_me = SharedWatchlist.objects.filter(shared_with=request.user)
    serializer = SharedWatchlistSerializer(shared_with_me, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shared_watchlist_detail(request, owner_id):
    """GET /api/recommendations/shared-watchlists/<owner_id>/"""
    from .models import SharedWatchlist
    from .serializers import WatchlistSerializer
    
    # Verify the owner actually shared it with the requesting user
    try:
        SharedWatchlist.objects.get(owner_id=owner_id, shared_with=request.user)
    except SharedWatchlist.DoesNotExist:
        return Response({"error": "Watchlist not shared with you"}, status=status.HTTP_403_FORBIDDEN)
        
    watchlist_items = Watchlist.objects.filter(user_id=owner_id).order_by("-added_at")
    serializer = WatchlistSerializer(watchlist_items, many=True)
    return Response(serializer.data)
