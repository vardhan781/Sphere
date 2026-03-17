import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { useState, useContext, useEffect, useCallback, useRef } from "react";
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
const imageSize = (width - wp(1)) / numColumns; // Small gap between posts

const Explore = ({ navigation }) => {
  const toast = useToast();
  const {
    getExploreUsers,
    getExplorePosts,
    toggleFollow,
    user: currentUser,
  } = useContext(AppContext);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  const searchInputRef = useRef(null);

  // Search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    fetchExplorePosts(1);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const result = await getExploreUsers(searchQuery.trim());

      if (result.success) {
        setSearchResults(result.users);
        setShowResults(true);
      }
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const prioritizeByEngagement = (postsArray) => {
    if (!postsArray || postsArray.length === 0) return [];

    const postsWithScore = postsArray.map((post) => ({
      ...post,
      engagementScore: (post.likes?.length || 0) + (post.comments?.length || 0),
    }));

    const sortedByEngagement = postsWithScore.sort(
      (a, b) => b.engagementScore - a.engagementScore,
    );

    const highEngagement = sortedByEngagement.filter(
      (p) => p.engagementScore > 20,
    );
    const mediumEngagement = sortedByEngagement.filter(
      (p) => p.engagementScore > 10 && p.engagementScore <= 20,
    );
    const lowEngagement = sortedByEngagement.filter(
      (p) => p.engagementScore <= 10,
    );

    const shuffledHigh = shuffleArray(highEngagement);
    const shuffledMedium = shuffleArray(mediumEngagement);
    const shuffledLow = shuffleArray(lowEngagement);

    const totalPosts = postsArray.length;
    const highCount = Math.min(
      shuffledHigh.length,
      Math.ceil(totalPosts * 0.6),
    );
    const mediumCount = Math.min(
      shuffledMedium.length,
      Math.ceil(totalPosts * 0.3),
    );
    const lowCount = totalPosts - highCount - mediumCount;

    const finalPosts = [
      ...shuffledHigh.slice(0, highCount),
      ...shuffledMedium.slice(0, mediumCount),
      ...shuffledLow.slice(0, lowCount),
    ];

    if (finalPosts.length < totalPosts) {
      const remainingPosts = [
        ...shuffledHigh.slice(highCount),
        ...shuffledMedium.slice(mediumCount),
        ...shuffledLow.slice(lowCount),
      ];
      finalPosts.push(
        ...remainingPosts.slice(0, totalPosts - finalPosts.length),
      );
    }

    return shuffleArray(finalPosts);
  };

  const fetchExplorePosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setLoadingPosts(true);
      } else {
        setLoadingMore(true);
      }

      const timestamp = Date.now();
      const result = await getExplorePosts(pageNum, timestamp);

      if (result.success) {
        let newPosts = result.posts || [];

        if (pageNum === 1) {
          const prioritizedPosts = prioritizeByEngagement(newPosts);
          setPosts(prioritizedPosts);
          setHasMore(newPosts.length >= 20);
        } else {
          const allPosts = [...posts, ...newPosts];

          const uniquePosts = Array.from(
            new Map(allPosts.map((post) => [post._id, post])).values(),
          );

          const reprioritizedPosts = prioritizeByEngagement(uniquePosts);
          setPosts(reprioritizedPosts);
          setHasMore(newPosts.length >= 20);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Fetch posts error:", error);
      setHasMore(false);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchExplorePosts(1);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (hasMore && !loadingMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExplorePosts(nextPage);
    }
  };

  const handleFollow = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const result = await toggleFollow(userId);
      if (result.success) {
        setSearchResults((prev) =>
          prev.map((user) =>
            user._id === userId
              ? { ...user, isFollowing: result.following }
              : user,
          ),
        );
        toast.success(result.following ? "Followed" : "Unfollowed");
      }
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const renderSearchItem = ({ item }) => {
    const isFollowing = item.isFollowing || false;
    const isLoading = followLoading[item._id];

    return (
      <TouchableOpacity
        style={styles.searchItem}
        onPress={() => navigation.navigate("UserProfile", { userId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.searchAvatarContainer}>
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
          {item.bio ? (
            <Text style={styles.searchBio} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : (
            <Text style={styles.searchBio}>@{item.username}</Text>
          )}
        </View>

        {item._id !== currentUser?._id && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => handleFollow(item._id)}
            activeOpacity={0.8}
            disabled={isLoading}
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

  const renderPost = ({ item, index }) => {
    const likesCount = item.likes?.length || 0;
    const commentsCount = item.comments?.length || 0;
    const totalEngagement = likesCount + commentsCount;

    const isViral = totalEngagement > 50;
    const isPopular = totalEngagement > 20;
    const isTrending = totalEngagement > 10;

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.postImage} />

        <View style={styles.postOverlay}>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Icon name="heart" size={wp(3)} color="#fff" />
              <Text style={styles.statText}>{likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="chatbubble" size={wp(3)} color="#fff" />
              <Text style={styles.statText}>{commentsCount}</Text>
            </View>
          </View>

          {isViral && (
            <View style={[styles.badge, styles.viralBadge]}>
              <Icon name="flash" size={wp(2.5)} color="#fff" />
              <Text style={styles.badgeText}>Viral</Text>
            </View>
          )}
          {isPopular && !isViral && (
            <View style={[styles.badge, styles.popularBadge]}>
              <Icon name="flame" size={wp(2.5)} color="#fff" />
              <Text style={styles.badgeText}>Hot</Text>
            </View>
          )}
          {isTrending && !isPopular && !isViral && (
            <View style={[styles.badge, styles.trendingBadge]}>
              <Text style={styles.badgeText}>Trending</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Search Results Section */}
      {showResults && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsHeaderLeft}>
              <Icon name="people" size={wp(5)} color={theme.colors.primary} />
              <Text style={styles.resultsTitle}>People</Text>
            </View>
            {searchResults.length > 0 && (
              <Text style={styles.resultsCount}>
                {searchResults.length} found
              </Text>
            )}
          </View>

          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults.slice(0, 5)}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.resultsList}
            />
          ) : !searching ? (
            <View style={styles.noResults}>
              <Icon
                name="search-outline"
                size={wp(12)}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.noResultsText}>No users found</Text>
              <Text style={styles.noResultsSubtext}>
                Try searching with a different name
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Stories Section */}
      <View style={styles.storiesSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Icon name="compass" size={wp(5)} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Discover</Text>
          </View>
          {posts.length > 0 && (
            <Text style={styles.sectionCount}>{posts.length} posts</Text>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {[
            "For You",
            "Trending",
            "Food",
            "Travel",
            "Art",
            "Music",
            "Fashion",
            "Tech",
          ].map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerLoaderText}>Loading more posts...</Text>
      </View>
    );
  };

  if (loadingPosts && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Discovering amazing content...</Text>
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

      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="notifications-outline"
              size={wp(5.5)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Icon
              name="menu-outline"
              size={wp(5.5)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={wp(4.5)}
            color={theme.colors.textSecondary}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search for people"
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searching ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Icon
                name="close-circle"
                size={wp(4.5)}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loadingPosts ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon
                  name="images-outline"
                  size={wp(15)}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptyText}>
                Be the first to share something amazing with the community!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("Create")}
              >
                <Text style={styles.emptyButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.postsGrid}
        columnWrapperStyle={styles.postRow}
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

export default Explore;

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
  },
  headerTitle: {
    fontSize: wp(5.5),
    fontWeight: "700",
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  headerIcon: {
    padding: wp(1),
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
  searchContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: wp(5),
    paddingHorizontal: wp(3),
    paddingVertical: Platform.OS === "ios" ? hp(0.8) : 0,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
  },
  resultsSection: {
    backgroundColor: theme.colors.background,
    marginBottom: hp(2),
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  resultsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  resultsTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
  },
  resultsCount: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  resultsList: {
    paddingHorizontal: wp(4),
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.2),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  searchAvatarContainer: {
    marginRight: wp(3),
  },
  searchAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  },
  searchUsername: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  searchBio: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  followButton: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(4),
    backgroundColor: theme.colors.primary,
    borderWidth: 0.5,
    borderColor: theme.colors.primary,
  },
  followingButton: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  followButtonText: {
    fontSize: wp(3),
    fontWeight: "600",
    color: "#fff",
  },
  followingButtonText: {
    color: theme.colors.text,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(6),
    paddingHorizontal: wp(4),
  },
  noResultsText: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: hp(1.5),
  },
  noResultsSubtext: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    marginTop: hp(0.5),
  },
  storiesSection: {
    paddingVertical: hp(2),
    marginBottom: hp(1),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
  },
  sectionCount: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
  categoriesContainer: {
    paddingLeft: wp(4),
  },
  categoriesContent: {
    paddingRight: wp(4),
    gap: wp(2),
  },
  categoryChip: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    backgroundColor: theme.colors.card,
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  categoryText: {
    fontSize: wp(3.2),
    color: theme.colors.text,
    fontWeight: "500",
  },
  postsGrid: {
    paddingBottom: hp(2),
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
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postStats: {
    flexDirection: "row",
    gap: wp(2),
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  statText: {
    color: "#fff",
    fontSize: wp(2.8),
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.2),
    borderRadius: wp(1),
    gap: wp(0.5),
  },
  viralBadge: {
    backgroundColor: "#FF6B6B",
  },
  popularBadge: {
    backgroundColor: "#FFA26B",
  },
  trendingBadge: {
    backgroundColor: "#4ECDC4",
  },
  badgeText: {
    color: "#fff",
    fontSize: wp(2.2),
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(15),
    paddingHorizontal: wp(8),
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
    fontWeight: "700",
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
  },
  emptyButtonText: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#fff",
  },
  footerLoader: {
    paddingVertical: hp(4),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: wp(2),
  },
  footerLoaderText: {
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
});
