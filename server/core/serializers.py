from rest_framework import serializers
from .models import Post
from django.contrib.auth.models import User
from .models import Post, Like

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username", read_only=True)
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "author", "content", "created_at", "like_count"]

    def get_like_count(self, obj):
        return Like.objects.filter(
            target_type="POST",
            target_id=obj.id
        ).count()

