"use client";

import { useEffect, useState } from "react";
import { addPost, getPosts } from "./_data_services/post";
import Link from "next/link";
import { socket } from "./utils/socket";

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [posts, setPosts] = useState("");

  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("image", image);

  const addPostWithValues = addPost.bind(null, formData);

  useEffect(() => {
    const getPostsDB = async () => {
      try {
        const posts = await getPosts();
        setPosts(posts);
      } catch (err) {
        console.log(err.message);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    getPostsDB();
  }, []);

  useEffect(() => {
    socket.on("post_created", (newPost) => {
      console.log("New post received via socket!", newPost);
      setPosts((prev) => [newPost, ...prev]);
    });

    socket.on("post_updated", (updatedPost) => {
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
      );
    });

    socket.on("post_deleted", (deletedId) => {
      setPosts((prev) => prev.filter((post) => post._id !== deletedId));
    });
    return () => {
      socket.off("post_created");
      socket.off("post_updated");
      socket.off("post_deleted");
    };
  }, []);

  return (
    <section className="container display-flex">
      <h1>Fill and submit the form</h1>
      <form
        action={async (formData) => {
          await addPostWithValues(formData);
          setDescription("");
          setTitle("");
          setIsSubmitting(false);
        }}
        onSubmit={() => {
          setIsSubmitting(true);
        }}
      >
        <div className="form-input">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-input">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div className="form-input">
          <button disabled={isSubmitting}>
            {isSubmitting ? "Submitting" : "Submit"}
          </button>
        </div>
      </form>

      {isLoadingPosts ? (
        <h2>Loading...</h2>
      ) : (
        <div className="posts">
          <h1>Posts</h1>
          {posts?.map((post) => (
            <Link
              href={`/${post.id}`}
              className="post display-flex"
              key={post.id}
            >
              <div className="desc">
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>
              <img src={post.image} alt={post.title} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
