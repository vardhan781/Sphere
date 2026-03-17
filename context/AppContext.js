import { createContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const serverUrl = Constants.expoConfig.extra.backendUrl;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const api = axios.create({
    baseURL: serverUrl,
  });

  api.interceptors.request.use(
    async (config) => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        const res = await api.get("/api/users/me");
        console.log("Current User: ", res.data);
        setUser(res.data);
      }
    } catch (error) {
      console.log("Load user error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(serverUrl, {
        transports: ["websocket"],
      });

      newSocket.emit("join", user._id);
      console.log("Joined personal room:", user._id);

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", res.data);

      const newToken = res.data.token;

      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      const userRes = await api.get("/api/users/me");
      setUser(userRes.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post("/api/auth/register", {
        username,
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Register failed",
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const updateProfile = async ({ username, bio, image }) => {
    try {
      const formData = new FormData();

      if (username) formData.append("username", username);
      if (bio) formData.append("bio", bio);

      if (image) {
        formData.append("profilePic", {
          uri: image,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }

      await api.put("/api/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const userRes = await api.get("/api/users/me");
      setUser(userRes.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  const createPost = async ({ image, caption }) => {
    try {
      const formData = new FormData();

      formData.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "post.jpg",
      });

      if (caption) formData.append("caption", caption);

      const res = await api.post("/api/post/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return { success: true, post: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Create post failed",
      };
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/api/post/delete/${postId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Delete failed",
      };
    }
  };

  const updatePost = async (postId, caption) => {
    try {
      const res = await api.put(`/api/post/update/${postId}`, {
        caption,
      });

      return { success: true, post: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  const getUserPosts = async (userId) => {
    try {
      const res = await api.get(`/api/post/user/${userId}`);
      return { success: true, posts: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch failed",
      };
    }
  };

  const getExplorePosts = async () => {
    try {
      const res = await api.get("/api/post/explore");
      return { success: true, posts: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch failed",
      };
    }
  };

  const toggleLikePost = async (postId) => {
    try {
      const res = await api.put(`/api/post/like/${postId}`);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Like failed",
      };
    }
  };

  const addComment = async (postId, text) => {
    try {
      const res = await api.post(`/api/post/comment/${postId}`, {
        text,
      });

      return { success: true, comments: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Comment failed",
      };
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/api/post/comment/${postId}/${commentId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Delete comment failed",
      };
    }
  };

  const getPostById = async (postId) => {
    try {
      const res = await api.get(`/api/post/${postId}`);
      return { success: true, post: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch post failed",
      };
    }
  };

  const getExploreUsers = async (search = "") => {
    try {
      const res = await api.get(`/api/users/explore?search=${search}`);

      return { success: true, users: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch users failed",
      };
    }
  };

  const toggleFollow = async (userId) => {
    try {
      const res = await api.put(`/api/users/follow/${userId}`);

      const updatedUser = await api.get("/api/users/me");
      setUser(updatedUser.data);

      return {
        success: true,
        following: res.data.following,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Follow failed",
      };
    }
  };

  const getUserById = async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      return { success: true, user: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch user failed",
      };
    }
  };

  const getFollowingPosts = async () => {
    try {
      const res = await api.get("/api/post/feed");
      return { success: true, posts: res.data };
    } catch (error) {
      console.log("Feed Error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Fetch feed failed",
      };
    }
  };

  const createChat = async (receiverId) => {
    try {
      if (!receiverId) {
        return {
          success: false,
          message: "Receiver ID is required",
        };
      }

      const res = await api.post("/api/chat/start", {
        receiverId,
      });

      return { success: true, chat: res.data };
    } catch (error) {
      console.log("Create chat error:", error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Create chat failed",
      };
    }
  };

  const getUserChats = async () => {
    try {
      const res = await api.get("/api/chat/conversations");
      return { success: true, chats: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch chats failed",
      };
    }
  };

  const getMessages = async (chatId) => {
    try {
      const res = await api.get(`/api/chat/messages/${chatId}`);
      return { success: true, messages: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch messages failed",
      };
    }
  };

  const sendMessage = async (conversationId, text) => {
    try {
      const res = await api.post("/api/chat/message", {
        conversationId,
        text,
      });

      return { success: true, message: res.data };
    } catch (error) {
      console.log("Send message error:", error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Send failed",
      };
    }
  };

  const getAllUsers = async (search = "", page = 1, limit = 20) => {
    try {
      const res = await api.get(
        `/api/users/chat-users?search=${search}&page=${page}&limit=${limit}`,
      );

      return { success: true, users: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch users failed",
      };
    }
  };

  const getNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      const data = res.data;

      return { success: true, notifications: data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch notifications",
      };
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update notification",
      };
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update notifications",
      };
    }
  };

  const getFollowers = async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}/followers`);

      return { success: true, followers: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch followers failed",
      };
    }
  };

  const getFollowing = async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}/following`);

      return { success: true, following: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Fetch following failed",
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    socket,
    login,
    register,
    logout,
    serverUrl,
    updateProfile,
    createPost,
    deletePost,
    updatePost,
    getUserPosts,
    getExplorePosts,
    toggleLikePost,
    addComment,
    deleteComment,
    getPostById,
    getExploreUsers,
    toggleFollow,
    getUserById,
    getFollowingPosts,
    createChat,
    getUserChats,
    getMessages,
    sendMessage,
    getAllUsers,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getFollowers,
    getFollowing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
