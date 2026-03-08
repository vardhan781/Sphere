import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const numColumns = 3;
const imageSize = (width - wp(1)) / numColumns;

const ProfileImage = ({ imageUrl, size, style }) => {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl || imageError) {
    return (
      <View
        style={[
          style,
          {
            backgroundColor: theme.colors.primary + "20",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Icon name="person" size={size * 0.5} color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      onError={() => setImageError(true)}
    />
  );
};

const UserProfile = ({ navigation, route }) => {
  const { userId } = route.params;
  const toast = useToast();
  const {
    user: currentUser,
    getUserById,
    getUserPosts,
    toggleFollow,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isCurrentUser = currentUser?._id === userId;

  const fetchUserProfile = async () => {
    try {
      const result = await getUserById(userId);

      if (result.success) {
        setUser(result.user);
        setIsFollowing(result.user.isFollowing || false);
        setFollowersCount(result.user.followersCount || 0);
      } else {
        toast.error("Failed to load user profile");
        navigation.goBack();
      }
    } catch (error) {
      console.log("Fetch user error:", error);
      toast.error("Something went wrong");
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const result = await getUserPosts(userId);

      if (result.success) {
        setUserPosts(result.posts || []);
      }
    } catch (error) {
      console.log("Fetch posts error:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUserProfile(), fetchUserPosts()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchUserPosts()]);
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      setFollowLoading(true);
      const result = await toggleFollow(userId);

      if (result.success) {
        setIsFollowing(result.following);
        setFollowersCount((prev) => (result.following ? prev + 1 : prev - 1));
        toast.success(
          result.following
            ? `Followed ${user?.username}`
            : `Unfollowed ${user?.username}`,
        );
      } else {
        toast.error(result.message || "Action failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setFollowLoading(false);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
    </TouchableOpacity>
  );

  const renderEmptyPosts = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name="images-outline"
          size={wp(10)}
          color={theme.colors.textTertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyText}>
        {isCurrentUser
          ? "When you create posts, they'll appear here"
          : `${user?.username || "This user"} hasn't posted anything yet`}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            size={wp(15)}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.errorTitle}>User not found</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            {/* Profile Pic */}
            <View style={styles.profilePicContainer}>
              <ProfileImage
                imageUrl={user.profilePic}
                size={wp(20)}
                style={styles.profilePic}
              />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>

              <TouchableOpacity
                style={styles.statBox}
                onPress={() =>
                  navigation.navigate("Followers", {
                    userId: user._id,
                    type: "followers",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statBox}
                onPress={() =>
                  navigation.navigate("Following", {
                    userId: user._id,
                    type: "following",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>
                  {user.followingCount || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.username}>{user.username}</Text>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          </View>

          {/* Follow/Message Buttons */}
          {!isCurrentUser ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                  followLoading && styles.buttonDisabled,
                ]}
                onPress={handleFollow}
                disabled={followLoading}
                activeOpacity={0.8}
              >
                {followLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={isFollowing ? theme.colors.text : "#fff"}
                  />
                ) : (
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => {
                  // Navigate to chat
                  navigation.navigate("ChatDetail", {
                    chat: { participants: [currentUser, user] },
                  });
                }}
                activeOpacity={0.8}
              >
                <Icon
                  name="chatbubble-outline"
                  size={wp(4)}
                  color={theme.colors.text}
                />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          {loadingPosts && userPosts.length === 0 ? (
            <View style={styles.postsLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <FlatList
              data={userPosts}
              renderItem={renderPost}
              keyExtractor={(item) => item._id}
              numColumns={numColumns}
              scrollEnabled={false}
              ListEmptyComponent={renderEmptyPosts}
              contentContainerStyle={styles.postsGrid}
              columnWrapperStyle={userPosts.length > 0 ? styles.postRow : null}
            />
          )}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {user?.username || "Profile"}
        </Text>
        <View style={styles.headerRight}>
          {!isCurrentUser && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                Alert.alert(user?.username, "Choose an option", [
                  {
                    text: "Report",
                    onPress: () => toast.info("Report feature coming soon"),
                  },
                  {
                    text: "Block",
                    onPress: () => toast.info("Block feature coming soon"),
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;

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
  },
  backButton: {
    padding: wp(1),
  },
  headerTitle: {
    flex: 1,
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
    marginHorizontal: wp(4),
  },
  headerRight: {
    width: wp(6),
    alignItems: "flex-end",
  },
  moreButton: {
    padding: wp(1),
  },
  profileSection: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  profilePicContainer: {
    marginRight: wp(6),
  },
  profilePic: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.3),
  },
  statLabel: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  bioContainer: {
    marginBottom: hp(2),
  },
  username: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  bio: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.2),
  },
  actionButtons: {
    flexDirection: "row",
    gap: wp(2),
  },
  followButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.primary,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  followButtonText: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: "#fff",
  },
  followingButtonText: {
    color: theme.colors.text,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.card,
  },
  messageButtonText: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.text,
  },
  postsSection: {
    marginTop: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  postsGrid: {
    paddingTop: hp(0.5),
  },
  postRow: {
    justifyContent: "flex-start",
    gap: wp(0.5),
    marginBottom: wp(0.5),
  },
  postCard: {
    width: imageSize,
    height: imageSize,
    backgroundColor: theme.colors.card,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(8),
    paddingHorizontal: wp(8),
  },
  emptyIconContainer: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  emptyTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  emptyText: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp(50),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
  },
  postsLoadingContainer: {
    paddingVertical: hp(4),
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp(50),
    paddingHorizontal: wp(8),
  },
  errorTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  errorButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "500",
  },
});
