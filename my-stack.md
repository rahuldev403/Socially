backend -> django → core framework

djangorestframework → API layer

psycopg2-binary → PostgreSQL driver

python-dotenv → environment variables (clean config)
----------------------
Why DRF?

Clean serialization

Industry standard

Interview-friendly
----------------------
Why we chose Django ORM

Why PostgreSQL

What each file does

How Django boots up
----------------------
You should be able to explain:

Why Comment has both post and parent

Why Like does not have a ForeignKey to Post/Comment

How double likes are prevented

Why karma is not stored

If any of these feel fuzzy, stop and ask now.
---------------------

Playto Community Feed – Project Description

This project is a Community Feed web application inspired by platforms like Reddit. It allows users to create posts, participate in threaded discussions, and engage with content through likes, while a real-time leaderboard highlights the most active contributors based on recent activity.

The system is designed to focus on data integrity, performance, and correctness, especially under concurrency and time-based aggregation scenarios.

Core Features
1. User Authentication

Users authenticate using session-based authentication.

Login and logout are handled by the backend.

Frontend maintains user session using browser cookies.

No JWT is used to keep the system simple and reliable.

2. Posts

Authenticated users can create text-based posts.

Each post has:

An author

Content

Creation timestamp

Posts are displayed in a feed ordered by recency.

Like count for posts is calculated dynamically.

3. Threaded Comments

Users can comment on posts.

Users can reply to comments, creating nested threads of unlimited depth.

Each comment belongs to:

A post

Optionally a parent comment

All comments for a post are fetched in a single query and organized into a tree structure in memory to avoid N+1 query problems.

4. Likes System

Users can like both posts and comments.

A user can like a specific post or comment only once.

Database-level unique constraints prevent duplicate likes, even under concurrent requests.

Likes are stored as individual records with timestamps.

5. Karma System (Derived, Not Stored)

Karma is earned when other users like your content:

Like on a post gives +5 karma to the post’s author.

Like on a comment gives +1 karma to the comment’s author.

Karma is never stored as a field on the user model.

All karma values are calculated dynamically from the like history.

6. Leaderboard (Last 24 Hours)

A leaderboard displays the top 5 users based on karma earned in the last 24 hours only.

Leaderboard calculation:

Filters likes created within the last 24 hours

Assigns weighted karma based on like target type

Groups results by content author

Orders users by total karma

No cached or precomputed daily karma is used.

Technical Architecture
Backend

Built using Django and Django REST Framework

Uses PostgreSQL as the database

Django ORM is used for:

Relationship management

Aggregations

Transactions

Concurrency is handled at the database level using unique constraints and atomic operations.

Frontend

Built using React with Vite

Styled using Tailwind CSS

Uses simple fetch-based API calls

Renders nested comments recursively

Displays live leaderboard data

Key Engineering Constraints Addressed

N+1 Query Prevention
All comments for a post are fetched in a single query and processed in memory.

Concurrency Safety
Database constraints ensure no duplicate likes can be created.

Dynamic Aggregation
Leaderboard and karma are computed from transactional data rather than stored counters.

AI-Assisted Development
AI tools are used to accelerate development, but all code is reviewed, understood, and optimized manually.

End Goal

The final product is a working, scalable prototype that demonstrates:

Strong backend system design

Correct handling of edge cases

Clear separation of concerns

Production-oriented thinking

This project is intentionally built to favor correctness and clarity over shortcuts, making it suitable for technical interviews and real-world backend discussions.

If you want, next we can:

Turn this into a README.md

Or move straight into Posts API + Feed UI

Just tell me what’s next.