import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Followers = ({ navigation, route }) => {
  const { userId, type } = route.params; // type = "followers" or "following"
  const toast = useToast();
  const {
    getFollowers,
    getFollowing,
    toggleFollow,
    user: currentUser,
  } = useContext(AppContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchFunction = type === "followers" ? getFollowers : getFollowing;
      const result = await fetchFunction(userId);

      if (result.success) {
        setUsers(result[type] || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(`Fetch ${type} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [userId, type]);

  const handleFollow = async (targetUserId) => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: true }));
      const result = await toggleFollow(targetUserId);

      if (result.success) {
        // Update the user's follow status in the list
        setUsers((prev) =>
          prev.map((user) =>
            user._id === targetUserId
              ? { ...user, isFollowing: result.following }
              : user,
          ),
        );
        toast.success(result.following ? "Followed" : "Unfollowed");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderUser = ({ item }) => {
    const isCurrentUser = item._id === currentUser?._id;
    const isFollowing = item.isFollowing || false;
    const isLoading = followLoading[item._id];

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => navigation.navigate("UserProfile", { userId: item._id })}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.profilePic ? (
            <Image source={{ uri: item.profilePic }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {getInitials(item.username)}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          {item.bio ? (
            <Text style={styles.bio} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : null}
        </View>

        {/* Follow Button (only if not current user) */}
        {!isCurrentUser && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => handleFollow(item._id)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
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
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name={type === "followers" ? "people-outline" : "person-add-outline"}
          size={wp(15)}
          color={theme.colors.textTertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {type === "followers" ? "No Followers Yet" : "Not Following Anyone"}
      </Text>
      <Text style={styles.emptyText}>
        {type === "followers"
          ? isOwnProfile
            ? "When someone follows you, they'll appear here"
            : "This user doesn't have any followers yet"
          : isOwnProfile
            ? "When you follow someone, they'll appear here"
            : "This user isn't following anyone yet"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === "followers" ? "Followers" : "Following"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {users.length} {type === "followers" ? "followers" : "following"}
        </Text>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default Followers;

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
  placeholder: {
    width: wp(6),
  },
  countContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  countText: {
    fontSize: wp(3.8),
    color: theme.colors.textTertiary,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },

  // User Item
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    gap: wp(3),
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.3),
  },
  bio: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
  },
  followButton: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
    backgroundColor: theme.colors.primary,
    minWidth: wp(18),
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  followButtonText: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: "#fff",
  },
  followingButtonText: {
    color: theme.colors.text,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(8),
    paddingTop: hp(15),
  },
  emptyIconContainer: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(3),
  },
  emptyTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  emptyText: {
    fontSize: wp(3.8),
    color: theme.colors.textTertiary,
    textAlign: "center",
    lineHeight: hp(2.5),
  },
});
