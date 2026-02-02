import { getPosts, createPost, likePost } from "../api";
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
      <div className="max-w-xl mx-auto">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
