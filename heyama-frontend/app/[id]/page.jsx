import DeletePost from "../_components/DeletePost";
import { getPost } from "../_data_services/post";

async function Post({ params }) {
  const { id: postId } = await params;
  const post = await getPost(postId);

  return (
    <div className="single">
      <img src={post.image} alt={post.title} />
      <h1>{post.title}</h1>
      <p>{post.description}</p>
      <DeletePost postId={post.id} />
    </div>
  );
}

export default Post;
