const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Get CSRF token from cookie
function getCsrfToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(name + "=")) {
      return trimmed.substring(name.length + 1);
    }
  }
  return null;
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken() || "",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

export async function signup(username, password) {
  const res = await fetch(`${API_BASE}/auth/signup/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken() || "",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Signup failed");
  }

  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCsrfToken() || "",
    },
  });

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCsrfToken() || "",
    },
  });

  return res.json();
}
export async function getPosts() {
  const res = await fetch(`${API_BASE}/posts/`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export async function createPost(content) {
  const res = await fetch(`${API_BASE}/posts/create/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("Failed to create post");
  }

  return res.json();
}
export async function likePost(postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}/like/`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to like post");
  }

  return res.json();
}
export async function getComments(postId) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments/`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }

  return res.json();
}

export async function createComment(postId, content, parentId = null) {
  const res = await fetch(`${API_BASE}/comments/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_id: postId,
      content,
      parent_id: parentId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create comment");
  }

  return res.json();
}

export async function deleteComment(commentId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete comment");
  }

  return res.json();
}

export function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // Create a map of all comments
  comments.forEach((comment) => {
    map[comment.id] = { ...comment, replies: [] };
  });

  // Build the tree
  comments.forEach((comment) => {
    if (comment.parent) {
      // Add to parent's replies
      if (map[comment.parent]) {
        map[comment.parent].replies.push(map[comment.id]);
      }
    } else {
      // Top-level comment
      roots.push(map[comment.id]);
    }
  });

  return roots;
}
export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard/`, {
    credentials: "include",
  });

  return res.json();
}
