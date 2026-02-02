import {
  getPosts,
  createPost,
  likePost,
  getComments,
  createComment,
  buildCommentTree,
  getLeaderboard,
} from "../api";
import { useEffect, useState } from "react";

export default function Feed({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const data = await getPosts();
    setPosts(data);
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim()) return;

    await createPost(content);
    setContent("");
    loadPosts();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Welcome, {user.username}</h1>
            <button onClick={onLogout} className="text-sm text-red-600">
              Logout
            </button>
          </div>

          <form
            onSubmit={handleCreatePost}
            className="bg-white p-4 rounded shadow mb-6"
          >
            <textarea
              className="w-full border p-2 mb-2"
              placeholder="Write a post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              Post
            </button>
          </form>

          <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-600">@{post.author}</p>
              <p className="mt-1">{post.content}</p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={async () => {
                    await likePost(post.id);
                    loadPosts();
                  }}
                  className="text-sm text-blue-600"
                >
                  Like
                </button>
                <span className="text-sm text-gray-600">
                  {post.like_count} likes
                </span>
              </div>

              <CommentSection postId={post.id} />
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-1">
        <Leaderboard />
      </div>
    </div>
  </div>
  );
}

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [showComments, setShowComments] = useState(false);

  async function loadComments() {
    const data = await getComments(postId);
    setComments(buildCommentTree(data));
  }

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowComments(!showComments)}
        className="text-sm text-gray-600 hover:text-gray-800"
      >
        {showComments ? "Hide" : "Show"} Comments
      </button>

      {showComments && (
        <div className="mt-2">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!content.trim()) return;
              await createComment(postId, content);
              setContent("");
              loadComments();
            }}
          >
            <input
              className="border p-1 text-sm w-full rounded"
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </form>

          <div className="mt-2 space-y-2">
            {comments.map((c) => (
              <Comment
                key={c.id}
                comment={c}
                postId={postId}
                reload={loadComments}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Comment({ comment, postId, reload, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  async function handleReply(e) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await createComment(postId, replyContent, comment.id);
    setReplyContent("");
    setShowReplyForm(false);
    reload();
  }

  return (
    <div className={`${depth > 0 ? "ml-6 pl-3 border-l" : ""}`}>
      <div className="text-xs text-gray-600">@{comment.author}</div>
      <div className="text-sm mt-1">{comment.content}</div>
      <button
        onClick={() => setShowReplyForm(!showReplyForm)}
        className="text-xs text-blue-600 mt-1"
      >
        Reply
      </button>

      {showReplyForm && (
        <form onSubmit={handleReply} className="mt-2">
          <input
            className="border p-1 text-xs w-full rounded"
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              reload={reload}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getLeaderboard();
    setUsers(data);
  }

  return (
    <div className="bg-white p-4 rounded shadow sticky top-6">
      <h2 className="font-bold mb-3 text-lg">🏆 Top Users (24h)</h2>
      <div className="space-y-2">
        {users.map((u, i) => (
          <div key={i} className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{i + 1}.</span>
              <span>@{u.username}</span>
            </div>
            <span className="font-medium text-blue-600">{u.karma} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
