import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
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
import { formatDistanceToNow } from "date-fns";

const { width, height } = Dimensions.get("window");

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Notifications = ({ navigation }) => {
  const toast = useToast();
  const {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useContext(AppContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.log("Fetch notifications error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationRead(notificationId);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n,
          ),
        );
      }
    } catch (error) {
      console.log("Mark as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;

    try {
      setMarkingAll(true);
      const result = await markAllNotificationsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.log("Mark all as read error:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    switch (notification.type) {
      case "like":
      case "comment":
        navigation.navigate("PostDetail", { postId: notification.post?._id });
        break;
      case "follow":
        navigation.navigate("UserProfile", {
          userId: notification.sender?._id,
        });
        break;
      case "mention":
        if (notification.post) {
          navigation.navigate("PostDetail", { postId: notification.post._id });
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return { name: "heart", color: theme.colors.error };
      case "comment":
        return { name: "chatbubble", color: theme.colors.primary };
      case "follow":
        return { name: "person-add", color: theme.colors.success };
      case "mention":
        return { name: "at", color: theme.colors.accent1 };
      default:
        return { name: "notifications", color: theme.colors.textSecondary };
    }
  };

  const getNotificationText = (notification) => {
    const sender = notification.sender?.username || "Someone";

    switch (notification.type) {
      case "like":
        return `${sender} liked your post`;
      case "comment":
        return `${sender} commented on your post`;
      case "follow":
        return `${sender} started following you`;
      case "mention":
        return `${sender} mentioned you in a comment`;
      default:
        return notification.message || "New notification";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, isUnread && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserProfile", { userId: item.sender?._id })
          }
          style={styles.avatarContainer}
        >
          {item.sender?.profilePic ? (
            <Image
              source={{ uri: item.sender.profilePic }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {getInitials(item.sender?.username)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[styles.notificationText, isUnread && styles.unreadText]}
            >
              {getNotificationText(item)}
            </Text>
            {!isUnread && <View style={styles.readDot} />}
          </View>
          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {item.post?.image && (
          <Image source={{ uri: item.post.image }} style={styles.postPreview} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name="notifications-off-outline"
          size={wp(15)}
          color={theme.colors.textTertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyText}>
        When someone likes, or follows you, you'll see it here
      </Text>
    </View>
  );

  const renderHeader = () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (notifications.length === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={markingAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.markAllText}>Mark all as read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

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

      {/* Main Header */}
      <View style={styles.mainHeader}>
        <Text style={styles.mainHeaderTitle}>Activity</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="settings-outline"
            size={wp(5.5)}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
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

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  mainHeaderTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  headerTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: wp(4),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    minWidth: wp(5),
    alignItems: "center",
  },
  badgeText: {
    fontSize: wp(3),
    color: "#fff",
    fontWeight: "600",
  },
  markAllText: {
    fontSize: wp(3.5),
    color: theme.colors.primary,
    fontWeight: "500",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    gap: wp(3),
  },
  unreadItem: {
    backgroundColor: theme.colors.primary + "05",
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
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(0.3),
  },
  notificationText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.4),
  },
  unreadText: {
    color: theme.colors.text,
    fontWeight: "500",
  },
  readDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: theme.colors.primary,
    marginLeft: wp(2),
  },
  notificationTime: {
    fontSize: wp(3),
    color: theme.colors.textTertiary,
  },
  postPreview: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(2),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
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
