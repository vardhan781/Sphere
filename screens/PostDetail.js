import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  Keyboard,
  Platform,
  StatusBar,
} from "react-native";
import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const PostDetail = ({ navigation, route }) => {
  const toast = useToast();
  const { postId } = route.params;
  const {
    user: currentUser,
    getPostById,
    toggleLikePost,
    addComment,
    deleteComment,
    deletePost,
  } = useContext(AppContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [optionsModal, setOptionsModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleteCommentModal, setDeleteCommentModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const commentInputRef = useRef(null);
  const flatListRef = useRef(null);
  const isMounted = useRef(true);

  // Keyboard handling - same pattern as Home
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

  useEffect(() => {
    isMounted.current = true;
    fetchPostDetails();

    return () => {
      isMounted.current = false;
    };
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const result = await getPostById(postId);

      if (result.success && isMounted.current) {
        setPost(result.post);
        setComments(result.post.comments || []);
        setLikesCount(result.post.likes?.length || 0);
        setLiked(result.post.likes?.includes(currentUser?._id) || false);
      } else if (isMounted.current) {
        toast.error(result.message || "Failed to load post");
        navigation.goBack();
      }
    } catch (error) {
      console.log("Fetch post error:", error);
      if (isMounted.current) {
        toast.error("Failed to load post");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleLike = useCallback(async () => {
    try {
      const result = await toggleLikePost(postId);
      if (result.success && isMounted.current) {
        setLiked(!liked);
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      } else if (isMounted.current) {
        toast.error(result.message);
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error("Failed to like post");
      }
    }
  }, [postId, liked, toggleLikePost, toast]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;

    try {
      setSendingComment(true);
      const result = await addComment(postId, commentText.trim());

      if (result.success && isMounted.current) {
        setComments(result.comments);
        setCommentText("");
        Keyboard.dismiss();
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else if (isMounted.current) {
        toast.error(result.message);
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error("Failed to add comment");
      }
    } finally {
      if (isMounted.current) {
        setSendingComment(false);
      }
    }
  }, [postId, commentText, addComment, toast]);

  const handleDeleteComment = useCallback(async () => {
    try {
      const result = await deleteComment(postId, commentToDelete._id);
      if (result.success && isMounted.current) {
        setComments((prev) =>
          prev.filter((c) => c._id !== commentToDelete._id),
        );
        toast.success("Comment deleted");
      } else if (isMounted.current) {
        toast.error(result.message);
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error("Failed to delete comment");
      }
    } finally {
      if (isMounted.current) {
        setDeleteCommentModal(false);
        setCommentToDelete(null);
      }
    }
  }, [postId, commentToDelete, deleteComment, toast]);

  const handleDeletePost = useCallback(() => {
    setOptionsModal(false);
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deletePost(postId);
              if (result.success && isMounted.current) {
                toast.success("Post deleted");
                navigation.goBack();
              } else if (isMounted.current) {
                toast.error(result.message);
              }
            } catch (error) {
              if (isMounted.current) {
                toast.error("Failed to delete post");
              }
            }
          },
        },
      ],
    );
  }, [postId, deletePost, toast, navigation]);

  const handleEditPost = useCallback(() => {
    setOptionsModal(false);
    navigation.navigate("EditPost", { post });
  }, [post, navigation]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderComment = useCallback(
    ({ item }) => {
      const isOwnComment = item.user?._id === currentUser?._id;

      return (
        <View style={styles.commentItem}>
          <TouchableOpacity
            onPress={() => {
              if (item.user?._id === currentUser?._id) {
                navigation.navigate("Main", { screen: "Profile" });
              } else {
                navigation.navigate("UserProfile", { userId: item.user?._id });
              }
            }}
          >
            {item.user?.profilePic ? (
              <Image
                source={{ uri: item.user.profilePic }}
                style={styles.commentAvatar}
              />
            ) : (
              <View style={styles.commentAvatarPlaceholder}>
                <Text style={styles.commentAvatarPlaceholderText}>
                  {getInitials(item.user?.username)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.commentContent}>
            <View style={styles.commentHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (item.user?._id === currentUser?._id) {
                    navigation.navigate("Main", { screen: "Profile" });
                  } else {
                    navigation.navigate("UserProfile", { userId: item.user?._id });
                  }
                }}
              >
                <Text style={styles.commentUsername}>{item.user?.username}</Text>
              </TouchableOpacity>
              <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
          
          {isOwnComment && (
            <TouchableOpacity
              onPress={() => {
                setCommentToDelete(item);
                setDeleteCommentModal(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.commentDeleteButton}
            >
              <Icon name="trash-outline" size={wp(4)} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      );
    },
    [currentUser, navigation],
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => {
              const isOwnProfile = post?.user?._id === currentUser?._id;
              if (isOwnProfile) {
                navigation.navigate("Main", { screen: "Profile" });
              } else {
                navigation.navigate("UserProfile", { userId: post?.user?._id });
              }
            }}
            activeOpacity={0.7}
          >
            {post?.user?.profilePic ? (
              <Image
                source={{ uri: post.user.profilePic }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {getInitials(post?.user?.username)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.username}>{post?.user?.username}</Text>
              <Text style={styles.postTime}>{formatTime(post?.createdAt)}</Text>
            </View>
          </TouchableOpacity>

          {post?.user?._id === currentUser?._id && (
            <TouchableOpacity 
              onPress={() => setOptionsModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="ellipsis-vertical"
                size={wp(5)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Image */}
        <Image source={{ uri: post?.image }} style={styles.postImage} />

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <View style={styles.leftActions}>
            <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
              <Icon
                name={liked ? "heart" : "heart-outline"}
                size={wp(6.5)}
                color={liked ? theme.colors.error : theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => commentInputRef.current?.focus()}
            >
              <Icon
                name="chatbubble-outline"
                size={wp(6)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon
                name="paper-plane-outline"
                size={wp(6)}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Icon
              name="bookmark-outline"
              size={wp(6)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {likesCount > 0 && (
          <Text style={styles.likesText}>
            {likesCount.toLocaleString()} {likesCount === 1 ? "like" : "likes"}
          </Text>
        )}

        {/* Caption */}
        {post?.caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post?.user?.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        ) : null}

        {/* Comments Count */}
        {comments.length > 0 && (
          <Text style={styles.commentsCount}>
            View all {comments.length} comments
          </Text>
        )}
      </>
    ),
    [post, liked, likesCount, comments, handleLike, currentUser, navigation],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: wp(6) }} />
      </View>

      <View style={styles.keyboardView}>
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsList}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />

        {/* Comment Input - Same pattern as Home */}
        <View style={[
          styles.commentInputWrapper,
          keyboardHeight > 0 && { paddingBottom: keyboardHeight }
        ]}>
          <View style={styles.commentInputContainer}>
            {currentUser?.profilePic ? (
              <Image
                source={{ uri: currentUser.profilePic }}
                style={styles.commentInputAvatar}
              />
            ) : (
              <View style={styles.commentInputAvatarPlaceholder}>
                <Text style={styles.commentInputAvatarPlaceholderText}>
                  {getInitials(currentUser?.username)}
                </Text>
              </View>
            )}
            
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
            />
            
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!commentText.trim() || sendingComment}
              style={styles.sendButton}
            >
              {sendingComment ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Icon
                  name="send"
                  size={wp(5)}
                  color={commentText.trim() ? theme.colors.primary : theme.colors.textTertiary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Options Modal */}
      <Modal
        visible={optionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModal(false)}
        >
          <View style={[styles.bottomModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHandle} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleEditPost}
            >
              <Icon name="create-outline" size={wp(5)} color={theme.colors.text} />
              <Text style={styles.modalOptionText}>Edit Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.deleteOption]}
              onPress={handleDeletePost}
            >
              <Icon name="trash-outline" size={wp(5)} color={theme.colors.error} />
              <Text style={[styles.modalOptionText, { color: theme.colors.error }]}>
                Delete Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setOptionsModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Comment Modal */}
      <Modal
        visible={deleteCommentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteCommentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDeleteCommentModal(false)}
        >
          <View style={[styles.centerModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalIconContainer}>
              <Icon name="trash-outline" size={wp(8)} color={theme.colors.error} />
            </View>
            
            <Text style={styles.modalTitle}>Delete Comment</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this comment?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteCommentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteComment}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: wp(1),
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  commentsList: {
    paddingBottom: hp(2),
  },
  
  // Post Header
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
  },
  username: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  postTime: {
    fontSize: wp(3),
    color: theme.colors.textTertiary,
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: theme.colors.card,
  },
  
  // Actions
  actionsContainer: {
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
  actionButton: {
    padding: wp(1),
  },
  likesText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
    paddingHorizontal: wp(3),
    marginBottom: hp(0.3),
  },
  captionContainer: {
    flexDirection: "row",
    paddingHorizontal: wp(3),
    marginBottom: hp(0.5),
    gap: wp(2),
  },
  captionUsername: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  captionText: {
    flex: 1,
    fontSize: wp(3.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  commentsCount: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
    paddingHorizontal: wp(3),
    marginBottom: hp(1),
  },
  
  // Comments
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    gap: wp(3),
  },
  commentAvatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentAvatarPlaceholder: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarPlaceholderText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(0.2),
  },
  commentUsername: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  commentTime: {
    fontSize: wp(2.8),
    color: theme.colors.textTertiary,
  },
  commentText: {
    fontSize: wp(3.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
  },
  commentDeleteButton: {
    padding: wp(1),
    alignSelf: "center",
  },
  
  // Comment Input - Same pattern as Home
  commentInputWrapper: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
    gap: wp(2),
    backgroundColor: theme.colors.background,
  },
  commentInputAvatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  commentInputAvatarPlaceholder: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  commentInputAvatarPlaceholderText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  commentInput: {
    flex: 1,
    fontSize: wp(3.5),
    color: theme.colors.text,
    maxHeight: hp(10),
    paddingHorizontal: wp(3),
    paddingVertical: Platform.OS === "ios" ? hp(1) : hp(0.8),
    backgroundColor: theme.colors.card,
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  sendButton: {
    padding: wp(2),
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomModal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
    padding: wp(4),
  },
  modalHandle: {
    width: wp(10),
    height: hp(0.5),
    backgroundColor: theme.colors.border,
    borderRadius: wp(2),
    alignSelf: "center",
    marginBottom: hp(2),
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.5),
    gap: wp(3),
  },
  deleteOption: {
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    marginTop: hp(1),
    paddingTop: hp(2),
  },
  modalOptionText: {
    fontSize: wp(4),
    color: theme.colors.text,
  },
  modalCancel: {
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  modalCancelText: {
    fontSize: wp(4),
    color: theme.colors.textSecondary,
  },
  centerModal: {
    width: wp(85),
    borderRadius: wp(4),
    padding: wp(6),
    alignItems: "center",
  },
  modalIconContainer: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  modalText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp(3),
  },
  modalButtons: {
    flexDirection: "row",
    gap: wp(3),
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: wp(3.8),
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: wp(3.8),
  },
});