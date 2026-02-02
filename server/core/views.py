from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Post, Like
from .serializers import PostSerializer
from django.db import IntegrityError
from core.authentication import CsrfExemptSessionAuthentication

# Create your views here.
@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def create_post(request):
    content = request.data.get("content")

    if not content:
        return Response(
            {"error": "Content is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    post = Post.objects.create(
        author=request.user,
        content=content
    )

    serializer = PostSerializer(post)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def list_posts(request):
    posts = Post.objects.select_related("author").order_by("-created_at")
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        Like.objects.create(
            user=request.user,
            target_type="POST",
            target_id=post_id
        )
        return Response({"liked": True})
    except IntegrityError:
        return Response({"liked": False})
