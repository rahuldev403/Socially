from django.urls import path
from .views_auth import login_view, logout_view, me_view
from .views import create_post, list_posts
from .views import like_post
from .views import create_comment, get_comments
from .views import leaderboard


auth_urlpatterns = [
    path("login/", login_view),
    path("logout/", logout_view),
    path("me/", me_view),
]

posts_urlpatterns = [
    path("posts/", list_posts),
    path("posts/create/", create_post),
    path("posts/<int:post_id>/like/", like_post),
    path("comments/", create_comment),
    path("posts/<int:post_id>/comments/", get_comments),
    path("leaderboard/", leaderboard),
]

urlpatterns = auth_urlpatterns + posts_urlpatterns
