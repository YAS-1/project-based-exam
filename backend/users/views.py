from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """POST /api/users/register/"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    """GET/PATCH /api/users/profile/"""
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API for searching users to share watchlists with
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    """GET /api/users/search/?q=<username_prefix>"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    query = request.query_params.get("q", "").strip()
    if not query:
        return Response([])

    users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)