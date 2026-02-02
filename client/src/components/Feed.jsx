import {
  getPosts,
  createPost,
  likePost,
  getComments,
  createComment,
  deleteComment,
  buildCommentTree,
  getLeaderboard,
} from "../api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Card, CardContent } from "./ui/Card";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Comment from "./Comment";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Send,
  ThumbsUp,
  MessageSquare,
  Trophy,
  User,
  ChevronDown,
  ChevronUp,
  Moon,
  Sun,
  Loader2,
} from "lucide-react";

export default function Feed({ user, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setPostsLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } finally {
      setPostsLoading(false);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await createPost(content);
      setContent("");
      loadPosts();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Welcome, {user.username}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={toggleTheme} variant="outline" size="icon">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={onLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
                <Button type="submit" disabled={loading}>
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Posting..." : "Post"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground">
                            @{post.author}
                          </p>
                        </div>
                        <p className="text-foreground mb-4">{post.content}</p>

                        <div className="flex items-center gap-4">
                          <LikeButton post={post} onUpdate={loadPosts} />
                        </div>

                        <CommentSection postId={post.id} user={user} />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

function LikeButton({ post, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const isLiked = post.liked_by_user;

  async function handleLike() {
    if (isLiked) return;

    setLoading(true);
    try {
      await likePost(post.id);
      await onUpdate();
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleLike}
      variant="ghost"
      size="sm"
      disabled={loading || isLiked}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
      )}
      {post.like_count}
    </Button>
  );
}

function CommentSection({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const data = await getComments(postId);
      setComments(buildCommentTree(data));
    } finally {
      setCommentsLoading(false);
    }
  }

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  return (
    <div className="mt-4 pt-4 border-t">
      <Button
        onClick={() => setShowComments(!showComments)}
        variant="ghost"
        size="sm"
      >
        {showComments ? (
          <ChevronUp className="w-4 h-4 mr-2" />
        ) : (
          <ChevronDown className="w-4 h-4 mr-2" />
        )}
        {showComments ? "Hide" : "Show"} Comments
      </Button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!content.trim()) return;
                setCommentSubmitting(true);
                try {
                  await createComment(postId, content);
                  setContent("");
                  await loadComments();
                } finally {
                  setCommentSubmitting(false);
                }
              }}
              className="flex gap-2 mb-4"
            >
              <Input
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={commentSubmitting}
              />
              <Button type="submit" size="icon" disabled={commentSubmitting}>
                {commentSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>

            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <Comment
                    key={c.id}
                    comment={c}
                    postId={postId}
                    reload={loadComments}
                    currentUser={user.username}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="sticky top-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-lg text-foreground">
              Top Users (24h)
            </h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                    flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs
                    ${i === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : ""}
                    ${i === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : ""}
                    ${i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" : ""}
                    ${i > 2 ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}
                  `}
                    >
                      {i + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-primary text-sm">
                    {u.karma}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
