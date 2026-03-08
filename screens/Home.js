import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
  Modal,
  Dimensions,
  Alert,
  Keyboard,
} from "react-native";
import { useState, useContext, useEffect, useCallback, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { formatDistanceToNow } from "date-fns";

const { width, height } = Dimensions.get("window");

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const MODAL_FIXED_HEIGHT = hp(75);

const Home = ({ navigation }) => {
  const toast = useToast();
  const {
    user: currentUser,
    getFollowingPosts,
    toggleLikePost,
    addComment,
    deleteComment,
  } = useContext(AppContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const lastTapRef = useRef(null);
  const likeTimeoutRef = useRef(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const fetchFeedPosts = async () => {
    try {
      const result = await getFollowingPosts();
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        toast.error("Failed to load feed");
      }
    } catch (error) {
      console.log("Fetch feed error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeedPosts();
    setRefreshing(false);
  }, []);

  const handleLike = async (postId) => {
    try {
      const result = await toggleLikePost(postId);
      if (result.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === postId) {
              const isLiked = post.likes?.includes(currentUser?._id);
              return {
                ...post,
                likes: isLiked
                  ? post.likes.filter((id) => id !== currentUser?._id)
                  : [...(post.likes || []), currentUser?._id],
              };
            }
            return post;
          }),
        );
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleDoubleTap = (postId) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const post = posts.find((p) => p._id === postId);
      const isAlreadyLiked = post?.likes?.includes(currentUser?._id);

      if (!isAlreadyLiked) {
        handleLike(postId);
      }

      if (likeTimeoutRef.current) {
        clearTimeout(likeTimeoutRef.current);
      }
    } else {
      lastTapRef.current = now;
      likeTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setPostComments(post.comments || []);
    setCommentModal(true);
  };

  const closeCommentModal = () => {
    setCommentModal(false);
    setCommentText("");
    setSelectedPost(null);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const result = await addComment(selectedPost._id, commentText.trim());
      if (result.success) {
        setPostComments(result.comments || []);
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === selectedPost._id) {
              return { ...post, comments: result.comments || [] };
            }
            return post;
          }),
        );
        setCommentText("");
        toast.success("Comment added");
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      } else {
        toast.error(result.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!comment || !selectedPost) return;
    try {
      const result = await deleteComment(selectedPost._id, comment._id);
      if (result.success) {
        setPostComments((prev) => prev.filter((c) => c._id !== comment._id));
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id === selectedPost._id) {
              return {
                ...post,
                comments: post.comments.filter((c) => c._id !== comment._id),
              };
            }
            return post;
          }),
        );
        toast.success("Comment deleted");
      } else {
        toast.error(result.message || "Failed to delete comment");
      }
    } catch (error) {
      console.log("Delete comment error:", error);
      toast.error("Something went wrong");
    }
  };

  const navigateToProfile = (userId) => {
    if (userId === currentUser?._id) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("UserProfile", { userId });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)}w`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}mo`;
    return `${Math.floor(diffInSeconds / 31536000)}y`;
  };

  const renderComment = ({ item }) => {
    const isOwnComment = item.user?._id === currentUser?._id;
    const confirmDelete = () => {
      Alert.alert("Delete Comment", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteComment(item),
        },
      ]);
    };
    return (
      <View style={styles.modalCommentItem}>
        <Image
          source={{
            uri: item.user?.profilePic || "https://via.placeholder.com/40",
          }}
          style={styles.modalCommentAvatar}
        />
        <View style={styles.modalCommentContent}>
          <View style={styles.modalCommentHeader}>
            <Text style={styles.modalCommentUsername}>
              {item.user?.username}
            </Text>
            <Text style={styles.modalCommentTime}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
          <Text style={styles.modalCommentText}>{item.text}</Text>
        </View>
        {isOwnComment && (
          <TouchableOpacity
            onPress={confirmDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="trash-outline"
              size={wp(4)}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPost = ({ item }) => {
    const isLiked = item.likes?.includes(currentUser?._id);
    const likeCount = item.likes?.length || 0;
    const commentCount = item.comments?.length || 0;
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
    });
    const recentComments = item.comments?.slice(-2) || [];

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigateToProfile(item.user?._id)}
          >
            <Image
              source={{
                uri: item.user?.profilePic || "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
            <Text style={styles.username}>{item.user?.username || "user"}</Text>
          </TouchableOpacity>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => handleDoubleTap(item._id)}
          onLongPress={() =>
            navigation.navigate("PostDetail", { postId: item._id })
          }
          delayLongPress={500}
        >
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </TouchableOpacity>

        <View style={styles.postActions}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={() => handleLike(item._id)}>
              <Icon
                name={isLiked ? "heart" : "heart-outline"}
                size={wp(6.5)}
                color={isLiked ? theme.colors.error : theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openCommentModal(item)}>
              <Icon
                name="chatbubble-outline"
                size={wp(6)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                name="paper-plane-outline"
                size={wp(6)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Icon
              name="bookmark-outline"
              size={wp(6)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {likeCount > 0 && (
          <Text style={styles.likesCount}>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </Text>
        )}

        {item.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{item.user?.username}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
        )}

        {recentComments.length > 0 && (
          <View style={styles.commentsPreview}>
            {recentComments.map((comment) => (
              <TouchableOpacity
                key={comment._id}
                style={styles.commentPreviewItem}
                onPress={() => openCommentModal(item)}
              >
                <Text style={styles.commentPreviewUsername}>
                  {comment.user?.username}
                </Text>
                <Text style={styles.commentPreviewText} numberOfLines={1}>
                  {comment.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {commentCount > 2 && (
          <TouchableOpacity
            style={styles.viewAllComments}
            onPress={() => openCommentModal(item)}
          >
            <Text style={styles.viewAllCommentsText}>
              View all {commentCount} comments
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.addCommentInline}
          onPress={() => openCommentModal(item)}
        >
          <Image
            source={{
              uri: currentUser?.profilePic || "https://via.placeholder.com/30",
            }}
            style={styles.inlineCommentAvatar}
          />
          <Text style={styles.addCommentText}>Add a comment...</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyFeed = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="newspaper-outline"
        size={wp(15)}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>Your Feed is Empty</Text>
      <Text style={styles.emptyText}>
        Follow some users to see their posts here!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Explore")}
      >
        <Text style={styles.exploreButtonText}>Explore Users</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate("Create")}>
        <Icon
          name="add-circle-outline"
          size={wp(7)}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Sphere</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Chats")}>
        <Icon
          name="chatbubble-outline"
          size={wp(6)}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        ListEmptyComponent={renderEmptyFeed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.card}
          />
        }
      />

      <Modal
        visible={commentModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={closeCommentModal}
          />

          <View
            style={[
              styles.modalContent,
              {
                height:
                  keyboardHeight > 0
                    ? MODAL_FIXED_HEIGHT + 50
                    : MODAL_FIXED_HEIGHT,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={closeCommentModal}>
                <Icon name="close" size={wp(5)} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <View style={styles.modalPostPreview}>
                <Image
                  source={{ uri: selectedPost.image }}
                  style={styles.modalPostImage}
                />
                <View style={styles.modalPostInfo}>
                  <Text style={styles.modalUsername}>
                    {selectedPost.user?.username}
                  </Text>
                  <Text style={styles.modalCaptionSimple} numberOfLines={2}>
                    {selectedPost.caption || "No caption"}
                  </Text>
                </View>
              </View>
            )}

            <FlatList
              ref={flatListRef}
              data={postComments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              contentContainerStyle={styles.modalCommentsList}
              ListEmptyComponent={
                <View style={styles.noCommentsContainer}>
                  <Icon
                    name="chatbubbles-outline"
                    size={wp(10)}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubtext}>
                    Be the first to comment!
                  </Text>
                </View>
              }
            />

            <View
              style={[
                styles.modalCommentInput,
                keyboardHeight > 0 && { paddingBottom: keyboardHeight },
              ]}
            >
              <Image
                source={{
                  uri:
                    currentUser?.profilePic || "https://via.placeholder.com/36",
                }}
                style={styles.modalInputAvatar}
              />
              <TextInput
                ref={inputRef}
                style={styles.modalInput}
                placeholder="Add a comment..."
                placeholderTextColor={theme.colors.textTertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                ) : (
                  <Text
                    style={[
                      styles.modalSendButtonText,
                      !commentText.trim() && styles.modalSendButtonDisabled,
                    ]}
                  >
                    Post
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: wp(5.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: theme.colors.textSecondary,
  },
  feedContainer: {
    paddingBottom: hp(2),
  },
  postCard: {
    marginBottom: hp(2),
    backgroundColor: theme.colors.background,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  username: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.text,
  },
  timeAgo: {
    fontSize: wp(3),
    color: theme.colors.textSecondary,
  },
  postImage: {
    width: "100%",
    height: hp(40),
    backgroundColor: theme.colors.card,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  likesCount: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: theme.colors.text,
    paddingHorizontal: wp(3),
    marginBottom: hp(0.3),
  },
  captionContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(3),
    marginBottom: hp(0.3),
  },
  captionUsername: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: theme.colors.text,
    marginRight: wp(1),
  },
  caption: {
    fontSize: wp(3.5),
    color: theme.colors.text,
    flex: 1,
  },
  commentsPreview: {
    paddingHorizontal: wp(3),
    marginBottom: hp(0.3),
  },
  commentPreviewItem: {
    flexDirection: "row",
    marginBottom: hp(0.2),
  },
  commentPreviewUsername: {
    fontSize: wp(3.2),
    fontWeight: "500",
    color: theme.colors.text,
    marginRight: wp(1),
  },
  commentPreviewText: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
    flex: 1,
  },
  viewAllComments: {
    paddingHorizontal: wp(3),
    marginBottom: hp(0.5),
  },
  viewAllCommentsText: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  addCommentInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    marginTop: hp(0.3),
  },
  inlineCommentAvatar: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  addCommentText: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp(20),
    paddingHorizontal: wp(8),
  },
  emptyTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  emptyText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp(3),
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(5),
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: wp(3.8),
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  modalList: {
    flex: 1,
    marginBottom: hp(1),
  },
  modalHeaderRight: {
    width: wp(5),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  modalCloseArea: {
    flex: 1,
    width: "100%",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(4),
    width: "100%",
  },
  modalCommentInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: wp(2),
    backgroundColor: theme.colors.background,
  },
  modalPostPreview: {
    flexDirection: "row",
    marginBottom: hp(2),
    padding: wp(3),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalPostImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(1.5),
    marginRight: wp(2),
  },
  modalPostInfo: {
    flex: 1,
  },
  modalUsername: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  modalCaptionSimple: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  modalCommentsList: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  modalCommentItem: {
    flexDirection: "row",
    paddingVertical: hp(1),
    gap: wp(2),
  },
  modalCommentAvatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCommentContent: {
    flex: 1,
  },
  modalCommentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1.5),
    marginBottom: hp(0.2),
  },
  modalCommentUsername: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: theme.colors.text,
  },
  modalCommentTime: {
    fontSize: wp(2.8),
    color: theme.colors.textTertiary,
  },
  modalCommentText: {
    fontSize: wp(3.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  noCommentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(6),
  },
  noCommentsText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: theme.colors.text,
    marginTop: hp(1.5),
  },
  noCommentsSubtext: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    marginTop: hp(0.5),
  },
  modalInputAvatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalInput: {
    flex: 1,
    fontSize: wp(3.5),
    color: theme.colors.text,
    maxHeight: hp(10),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalSendButtonText: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.primary,
  },
  modalSendButtonDisabled: {
    opacity: 0.4,
  },
});
