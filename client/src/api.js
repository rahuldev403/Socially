const API_BASE = "http://localhost:8000/api";

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

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCsrfToken() || "",
    },
  });

  if (!res.ok) {
    return null;
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
    throw new Error("Failed to like post");
  }

  return res.json();
}
