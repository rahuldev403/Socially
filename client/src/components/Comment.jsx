import { useState } from "react";
import { createComment, deleteComment } from "../api";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { User, MessageSquare, Send, Loader2, Trash2 } from "lucide-react";

export default function Comment({
  comment,
  postId,
  reload,
  depth = 0,
  currentUser,
}) {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setDeleting(true);
    try {
      await deleteComment(comment.id);
      await reload();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${depth > 0 ? "ml-6 pl-3 border-l-2 border-border" : ""} mt-2`}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User className="w-3 h-3" />
        <span className="font-medium">@{comment.author}</span>
      </div>
      <p className="text-sm mt-1 text-foreground">{comment.content}</p>

      <div className="flex items-center gap-1 mt-1">
        <Button
          onClick={() => setShowReply(!showReply)}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Reply
        </Button>

        {currentUser === comment.author && (
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showReply && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!reply.trim()) return;
              setSubmitting(true);
              try {
                await createComment(postId, reply, comment.id);
                setReply("");
                setShowReply(false);
                await reload();
              } finally {
                setSubmitting(false);
              }
            }}
            className="mt-2 flex gap-2"
          >
            <Input
              className="text-sm h-8"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply..."
              disabled={submitting}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              postId={postId}
              reload={reload}
              depth={depth + 1}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
