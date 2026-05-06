import { notFound } from "next/navigation";
import { showErrorMessage, showSuccessMessage } from "../utils/notifications";

const backEndUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`;

const { default: axios } = require("axios");

export const addPost = async (data) => {
  try {
    axios.defaults.withCredentials = true;

    const res = await axios({
      method: "POST",
      url: `${backEndUrl}/`,
      data,
    });

    if (res.data.status === "success") {
      showSuccessMessage("Post added successfully");
    } else {
      showErrorMessage(res.data.message);
    }

    const status = res.data.status;

    return status;
  } catch (err) {
    showErrorMessage(err.response.data.message);
  }
};

export const getPosts = async () => {
  try {
    axios.defaults.withCredentials = true;

    const res = await axios({
      method: "GET",
      url: `${backEndUrl}/`,
    });

    const data = res.data.data;

    return data;
  } catch (err) {
    console.log(err.message);
  }
};

export const getPost = async (id) => {
  try {
    axios.defaults.withCredentials = true;
    const res = await axios({
      method: "GET",
      url: `${backEndUrl}/${id}`,
    });

    const data = res.data.data;
    return data;
  } catch {
    notFound();
  }
};

export const deletePost = async (postId) => {
  try {
    axios.defaults.withCredentials = true;
    const res = await axios({
      method: "DELETE",
      url: `${backEndUrl}/${postId}`,
    });

    const status = res.data.status;
    return status;

    if (res.data.status === "success") {
      showSuccessMessage("Post deleted successfully");
    } else {
      showErrorMessage(res.data.message);
    }
  } catch (err) {
    showErrorMessage(err.response.data.message);
  }
};
