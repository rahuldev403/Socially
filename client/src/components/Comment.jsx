import { useState } from "react";
import { createComment } from "../api";

export default function Comment({ comment, postId, reload, depth = 0 }) {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);

  return (
    <div
      className={`${depth > 0 ? "ml-6 pl-3 border-l-2 border-gray-300" : ""} mt-2`}
    >
      <p className="text-xs text-gray-600">@{comment.author}</p>
      <p className="text-sm mt-1">{comment.content}</p>

      <button
        onClick={() => setShowReply(!showReply)}
        className="text-xs text-blue-600 mt-1"
      >
        Reply
      </button>

      {showReply && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            await createComment(postId, reply, comment.id);
            setReply("");
            setShowReply(false);
            reload();
          }}
          className="mt-2"
        >
          <input
            className="border text-sm p-1 w-full rounded"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply..."
          />
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((c) => (
            <Comment
              key={c.id}
              comment={c}
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
