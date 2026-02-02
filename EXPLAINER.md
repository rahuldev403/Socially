# EXPLAINER.md

## The Tree: Nested Comments Architecture

### Database Model

Nested comments are implemented using an **adjacency list pattern** with a self-referential foreign key:

```python
class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies"
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

**Key Design Decisions:**

- **`parent` field**: Self-referential ForeignKey that points to the parent comment
- **Nullable**: `null=True, blank=True` allows top-level comments (no parent)
- **Cascade deletion**: When a parent is deleted, all children are removed automatically
- **Unlimited nesting**: No artificial depth limit imposed by the schema

### Serialization Strategy (Avoiding N+1 Queries)

We avoid the N+1 query problem by using a **single-query fetch + client-side tree construction**:

#### Backend (Single Query):

```python
@api_view(["GET"])
def get_comments(request, post_id):
    # Single query with select_related to prefetch author data
    comments = Comment.objects.filter(
        post_id=post_id
    ).select_related("author").order_by("created_at")

    # Flat serialization - no recursive queries
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)
```

**Why this works:**

- ✅ **One database query** fetches all comments for a post
- ✅ `select_related("author")` eliminates additional author lookups
- ✅ Returns a flat list with `parent` references intact
- ✅ O(n) complexity where n = total comments

#### Frontend (Tree Construction):

```javascript
export function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // O(n): Create hashmap of all comments
  comments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  // O(n): Link children to parents
  comments.forEach((comment) => {
    if (comment.parent) {
      if (map[comment.parent]) {
        map[comment.parent].replies.push(map[comment.id]);
      }
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
}
```

**Complexity Analysis:**

- Time: O(n) - Two linear passes through the comment list
- Space: O(n) - Hashmap storing all comments
- No recursive database calls
- Scales efficiently even with deeply nested threads

---

## The Math: 24-Hour Leaderboard QuerySet

### Karma Calculation Logic

**Points System:**

- Post like = **5 karma points** (given to post author)
- Comment like = **1 karma point** (given to comment author)
- Only likes from the **last 24 hours** count

### Django QuerySet Implementation

```python
from django.utils import timezone
from datetime import timedelta
from django.db.models import Case, When, IntegerField, Sum
from django.contrib.auth.models import User

@api_view(["GET"])
def leaderboard(request):
    # 1. Define 24-hour window
    since = timezone.now() - timedelta(hours=24)
    likes = Like.objects.filter(created_at__gte=since)

    # 2. Aggregate post likes by target_id
    post_scores = (
        likes
        .filter(target_type="POST")
        .values("target_id")
        .annotate(score=Sum(
            Case(
                When(target_type="POST", then=5),
                output_field=IntegerField()
            )
        ))
    )

    # 3. Aggregate comment likes by target_id
    comment_scores = (
        likes
        .filter(target_type="COMMENT")
        .values("target_id")
        .annotate(score=Sum(
            Case(
                When(target_type="COMMENT", then=1),
                output_field=IntegerField()
            )
        ))
    )

    # 4. Resolve target_ids to author_ids
    user_karma = {}

    # Map post IDs to author IDs
    posts = {
        p.id: p.author_id
        for p in Post.objects.filter(
            id__in=[p["target_id"] for p in post_scores]
        )
    }

    # Map comment IDs to author IDs
    comments = {
        c.id: c.author_id
        for c in Comment.objects.filter(
            id__in=[c["target_id"] for c in comment_scores]
        )
    }

    # 5. Accumulate karma per user
    for item in post_scores:
        user_id = posts[item["target_id"]]
        user_karma[user_id] = user_karma.get(user_id, 0) + item["score"]

    for item in comment_scores:
        user_id = comments[item["target_id"]]
        user_karma[user_id] = user_karma.get(user_id, 0) + item["score"]

    # 6. Annotate and rank users
    leaderboard = (
        User.objects
        .filter(id__in=user_karma.keys())
        .annotate(karma=Case(
            *[
                When(id=user_id, then=karma)
                for user_id, karma in user_karma.items()
            ],
            output_field=IntegerField()
        ))
        .order_by("-karma")[:5]  # Top 5 users
    )

    return Response([
        {"username": u.username, "karma": u.karma}
        for u in leaderboard
    ])
```

### Approximate SQL Translation

```sql
-- Step 1: Get likes from last 24 hours
WITH recent_likes AS (
    SELECT *
    FROM core_like
    WHERE created_at >= NOW() - INTERVAL '24 hours'
),

-- Step 2: Calculate post scores
post_karma AS (
    SELECT
        p.author_id AS user_id,
        COUNT(l.id) * 5 AS karma
    FROM recent_likes l
    JOIN core_post p ON l.target_id = p.id
    WHERE l.target_type = 'POST'
    GROUP BY p.author_id
),

-- Step 3: Calculate comment scores
comment_karma AS (
    SELECT
        c.author_id AS user_id,
        COUNT(l.id) * 1 AS karma
    FROM recent_likes l
    JOIN core_comment c ON l.target_id = c.id
    WHERE l.target_type = 'COMMENT'
    GROUP BY c.author_id
),

-- Step 4: Combine and aggregate
total_karma AS (
    SELECT user_id, SUM(karma) AS total_karma
    FROM (
        SELECT user_id, karma FROM post_karma
        UNION ALL
        SELECT user_id, karma FROM comment_karma
    ) combined
    GROUP BY user_id
)

-- Step 5: Get top users
SELECT
    u.username,
    tk.total_karma AS karma
FROM total_karma tk
JOIN auth_user u ON tk.user_id = u.id
ORDER BY tk.total_karma DESC
LIMIT 5;
```

### Query Efficiency

**Number of Database Queries:**

1. ✅ `Like.objects.filter(created_at__gte=since)` - Initial like fetch
2. ✅ Post aggregation query
3. ✅ Comment aggregation query
4. ✅ Bulk post lookup (single IN query)
5. ✅ Bulk comment lookup (single IN query)
6. ✅ Final user ranking query

**Total: ~6 queries** regardless of data size

**No N+1 queries** - All bulk operations use `IN` clauses

- Scales to thousands of likes/users efficiently
- Indexed lookups on `created_at` and foreign keys ensure fast performance
- Could be further optimized with database views or materialized queries if needed

---

## Performance Characteristics

| Operation               | Time Complexity | DB Queries | Notes                              |
| ----------------------- | --------------- | ---------- | ---------------------------------- |
| Fetch comments for post | O(n)            | 1          | Single query with `select_related` |
| Build comment tree      | O(n)            | 0          | Client-side processing             |
| Calculate leaderboard   | O(u + p + c)    | 6          | u=users, p=posts, c=comments       |
| Nested comment depth    | Unlimited       | 0          | No recursive queries needed        |

Where:

- n = number of comments per post
- u = number of active users
- p = number of liked posts in 24h
- c = number of liked comments in 24h

# Explainer – Development Process & AI Usage
## Overview

This project was built as part of the Playto Engineering Challenge with a focus on backend correctness, data integrity, and performance, rather than UI polish.

I primarily work with Node.js, so this project also served as a practical exercise in adapting to a new backend framework (Django) while maintaining strong engineering standards.

Use of AI Tools

I used AI tools (Claude Code, ChatGPT) during development to accelerate implementation, especially when working with an unfamiliar framework (Django).

AI assistance was used mainly for:

Converting high-level backend logic into Django/DRF syntax

Generating initial boilerplate for serializers, views, and configuration

Spotting obvious structural mistakes during early iterations

AI was not treated as a black box. Every generated section of code was:

Read line by line

Tested locally

Modified or rewritten when incorrect or inefficient

Issues Identified and Fixed Manually

During development, I encountered multiple issues that required manual debugging and engineering judgment, including:

1. Environment Variable Handling

Early AI-generated versions hardcoded some configuration values (e.g., database and settings-related values).

I manually audited the codebase and removed hardcoded values.

Sensitive configuration was moved to environment variables and deployment platform settings.

2. Deployment & Production Issues

Faced production deployment issues on Render related to:

Incorrect Gunicorn entry point

Module path mismatches due to custom project structure

Port binding expectations in managed environments

These were debugged and fixed manually by:

Correcting the Gunicorn start command

Aligning the WSGI module path with the actual project structure

Switching from Django’s runserver to a production-grade server

3. AI Audit / Logic Corrections

Some AI-generated aggregation and query logic initially violated constraints such as:

Inefficient query patterns

Incorrect assumptions about ORM behavior

These sections were rewritten to ensure:

No N+1 query issues

Concurrency-safe behavior

Correct time-based aggregation for the leaderboard

Engineering Ownership

All architectural decisions in the final version were made deliberately, including:

Preventing double likes using database-level unique constraints

Computing karma dynamically instead of storing derived values

Fetching nested comments efficiently and building the tree in memory

Handling race conditions at the database layer rather than in application logic

I can confidently explain, debug, and optimize every part of the codebase that is included in this submission.

Final Note

AI tools were used as accelerators, not as substitutes for understanding.
The final implementation reflects my own reasoning, debugging, and trade-off decisions.

I’m happy to walk through any part of the system, including areas where AI-generated code was corrected or redesigned during development.

