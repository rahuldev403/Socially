ForeignKey → User

on_delete=models.CASCADE

If user is deleted → posts are deleted

related_name="posts"

Allows: user.posts.all()

**Interview explanation:**

“Posts belong to a user, and cascade deletion keeps referential integrity.”

**content**

TextField instead of CharField

No artificial length limit

**created_at**

auto_now_add=True

Timestamp when row is created

Used later for sorting feed
-------------------
****comments model ****
post

Every comment belongs to one post

Even replies belong to the same post

This makes fetching all comments for a post easy and efficient

parent

Self-referencing ForeignKey

null=True → top-level comment

related_name="replies"

This enables:

comment.replies.all()


This is how Reddit-style threading works.

Key interview sentence:

“Instead of recursive queries, I fetch all comments for a post in one query and build the tree in memory.”
------------------------

**like model**
Why this model is designed this way
❌ Why not two tables (PostLike, CommentLike)?

Duplicate logic

Harder aggregation

Messy leaderboard queries

✅ Why polymorphic-like design?

Single source of truth

Clean aggregation

Easier time-based filtering

The UniqueConstraint (this is gold)
UniqueConstraint(fields=["user", "target_type", "target_id"])


This guarantees:

A user can like a post/comment only once

Even if 2 requests hit at the same time

DB enforces correctness, not your code

Interview line:

“Concurrency safety is handled at the database level using unique constraints.”

--------------------------