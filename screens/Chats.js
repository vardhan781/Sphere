import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
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

const Chats = ({ navigation }) => {
  const toast = useToast();
  const {
    getUserChats,
    getAllUsers,
    createChat,
    user: currentUser,
  } = useContext(AppContext);

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchChats = async () => {
    try {
      const result = await getUserChats();
      if (result.success) {
        setChats(result.chats);
      }
    } catch (error) {
      console.log("Fetch chats error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const result = await getAllUsers(searchQuery.trim());
      if (result.success) {
        const filteredUsers = result.users.filter(
          (u) => u._id !== currentUser?._id,
        );
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const result = await createChat(userId);
      if (result.success) {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        navigation.navigate("ChatDetail", { chat: result.chat });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderChatItem = ({ item }) => {
    const otherUser = item.participants?.find(
      (u) => u._id !== currentUser?._id,
    );
    const lastMessage = item.lastMessage;
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("ChatDetail", { chat: item })}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser?.profilePic ? (
            <Image
              source={{ uri: otherUser.profilePic }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {getInitials(otherUser?.username)}
              </Text>
            </View>
          )}
          {item.online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.username} numberOfLines={1}>
              {otherUser?.username}
            </Text>
            {lastMessage && (
              <Text style={styles.timestamp}>
                {formatTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {lastMessage?.text || "No messages yet"}
            </Text>
            {hasUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleStartChat(item._id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.profilePic ? (
          <Image
            source={{ uri: item.profilePic }}
            style={styles.searchAvatar}
          />
        ) : (
          <View style={styles.searchAvatarPlaceholder}>
            <Text style={styles.searchAvatarPlaceholderText}>
              {getInitials(item.username)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.searchInfo}>
        <Text style={styles.searchUsername}>{item.username}</Text>
        <Text style={styles.searchUserBio} numberOfLines={1}>
          Tap to start chatting
        </Text>
      </View>

      <View style={styles.startChatButton}>
        <Icon
          name="chatbubble-ellipses"
          size={wp(5)}
          color={theme.colors.primary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="chatbubbles" size={wp(15)} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptyText}>
        Start a conversation with someone by tapping the search icon above
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowSearch(true)}
      >
        <Icon name="search" size={wp(4.5)} color={theme.colors.text} />
        <Text style={styles.emptyButtonText}>Find People</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Messages</Text>

      <TouchableOpacity
        onPress={() => setShowSearch(!showSearch)}
        style={styles.headerButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon
          name={showSearch ? "close" : "search"}
          size={wp(6)}
          color={showSearch ? theme.colors.primary : theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        {renderHeader()}
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
      {renderHeader()}

      {/* Search Section */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Icon
              name="search"
              size={wp(4.5)}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor={theme.colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              clearButtonMode="never"
            />
            {searching ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon
                  name="close-circle"
                  size={wp(4.5)}
                  color={theme.colors.textTertiary}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item._id}
              style={styles.searchResults}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          ) : searchQuery && !searching ? (
            <View style={styles.noResults}>
              <Icon
                name="people-outline"
                size={wp(10)}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.noResultsText}>No users found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term
              </Text>
            </View>
          ) : (
            <View style={styles.searchHint}>
              <Icon
                name="search-outline"
                size={wp(8)}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.searchHintText}>
                Find people to chat with
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Chats List */}
      {!showSearch && (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
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
              progressBackgroundColor={theme.colors.card}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Chats;

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
  headerButton: {
    padding: wp(2),
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

  // Search Section
  searchSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    marginHorizontal: wp(4),
    marginVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: hp(5.5),
  },
  searchInput: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
    paddingHorizontal: wp(2),
    paddingVertical: Platform.OS === "ios" ? hp(1) : 0,
  },
  searchResults: {
    flex: 1,
    marginTop: hp(0.5),
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  searchAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  searchAvatarPlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  searchAvatarPlaceholderText: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  searchInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  searchUsername: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  searchUserBio: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  startChatButton: {
    padding: wp(2),
  },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp(10),
  },
  noResultsText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  noResultsSubtext: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
  },
  searchHint: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp(10),
  },
  searchHintText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    marginTop: hp(1.5),
  },

  // Chats List
  listContent: {
    paddingVertical: hp(1),
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarPlaceholderText: {
    fontSize: wp(5.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  chatInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(0.3),
  },
  username: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
    marginRight: wp(2),
  },
  timestamp: {
    fontSize: wp(3),
    color: theme.colors.textTertiary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: wp(2),
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: "500",
  },
  unreadBadge: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp(3),
    lineHeight: hp(2.5),
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    gap: wp(2),
  },
  emptyButtonText: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.text,
  },
});
