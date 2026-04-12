from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"watchlist", views.WatchlistViewSet, basename="watchlist")

urlpatterns = [
    path("for-you/", views.personalized_recommendations, name="for-you"),
    path("because-you-watched/", views.because_you_watched, name="because-you-watched"),
    path("preferences/", views.genre_preferences, name="genre-preferences"),
    path("track/", views.track_interaction, name="track-interaction"),
    path("dashboard/", views.dashboard_stats, name="dashboard-stats"),
    path("shared-watchlists/share/", views.share_watchlist, name="share-watchlist"),
    path("shared-watchlists/", views.shared_watchlists_list, name="shared-watchlists-list"),
    path("shared-watchlists/<int:owner_id>/", views.shared_watchlist_detail, name="shared-watchlist-detail"),
    path("", include(router.urls)),
]
