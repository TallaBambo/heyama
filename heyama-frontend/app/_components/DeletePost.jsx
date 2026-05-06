"use client";

import { useRouter } from "next/navigation";
import { deletePost } from "../_data_services/post";
import { useState } from "react";

function DeletePost({ postId }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  return (
    <button
      onClick={async () => {
        setDeleting(true);
        const status = await deletePost(postId);
        setDeleting(false);
        router.push("/");
      }}
    >
      {deleting ? "Deleting" : "Delete Post"}
    </button>
  );
}

export default DeletePost;
