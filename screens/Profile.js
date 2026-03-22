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
  Linking,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useState, useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../theme/theme";
import { useToast } from "../context/ToastContext";
import { AppContext } from "../context/AppContext";

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

const Profile = ({ navigation }) => {
  const toast = useToast();
  const {
    user: contextUser,
    updateProfile,
    getUserPosts,
  } = useContext(AppContext);
  const [uploading, setUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const user = {
    id: contextUser?._id,
    username: contextUser?.username || "username",
    fullName: contextUser?.fullName || contextUser?.username || "User",
    bio: contextUser?.bio || "No bio yet",
    followers: contextUser?.followers?.length || 0,
    following: contextUser?.following?.length || 0,
    posts: userPosts.length || 0,
    profilePic: contextUser?.profilePic || null,
  };

  const fetchUserPosts = async () => {
    if (!user.id) return;

    try {
      setLoadingPosts(true);
      const result = await getUserPosts(user.id);

      if (result.success) {
        setUserPosts(result.posts);
      } else {
        console.log("Error fetching posts:", result.message);
      }
    } catch (error) {
      console.log("Fetch posts error:", error);
    } finally {
      setLoadingPosts(false);
      setInitialLoad(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user.id]);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        const request = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!request.granted) {
          Alert.alert(
            "Permission Required",
            "Gallery access is required to change your profile picture.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Settings",
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        await handleUpdateProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image pick error:", error);
      toast.error("Failed to pick image");
    }
  };

  const handleUpdateProfileImage = async (imageUri) => {
    try {
      setUploading(true);
      const result = await updateProfile({ image: imageUri });

      if (result.success) {
        toast.success("Profile picture updated");
      } else {
        toast.error(result.message || "Failed to update profile picture");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => {
        navigation.navigate("PostDetail", { postId: item._id });
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.postImage} />
    </TouchableOpacity>
  );

  const renderEmptyPosts = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon
          name="camera-outline"
          size={wp(10)}
          color={theme.colors.textTertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyText}>
        When you create posts, they'll appear here
      </Text>
    </View>
  );

  const renderContent = () => {
    if (initialLoad && loadingPosts) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            {/* Profile Pic with tap to change */}
            <TouchableOpacity
              style={styles.profilePicContainer}
              onPress={pickImage}
              disabled={uploading}
              activeOpacity={0.8}
            >
              <ProfileImage
                imageUrl={user.profilePic}
                size={wp(20)}
                style={styles.profilePic}
              />
              <View style={styles.editBadge}>
                <Icon
                  name={uploading ? "sync" : "camera"}
                  size={wp(3.5)}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <TouchableOpacity
                style={styles.statBox}
                onPress={() =>
                  navigation.navigate("Followers", {
                    userId: user.id,
                    type: "followers",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statBox}
                onPress={() =>
                  navigation.navigate("Following", {
                    userId: user.id,
                    type: "following",
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.fullName}>{user.fullName}</Text>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <FlatList
            data={userPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item._id}
            numColumns={numColumns}
            scrollEnabled={false}
            ListEmptyComponent={!loadingPosts ? renderEmptyPosts : null}
            contentContainerStyle={styles.postsGrid}
            columnWrapperStyle={userPosts.length > 0 ? styles.postRow : null}
          />
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
        <Text style={styles.headerTitle}>{user.username}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu-outline" size={wp(5.5)} color={theme.colors.text} />
        </TouchableOpacity>
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

export default Profile;

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
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
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
    position: "relative",
  },
  profilePic: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: wp(3),
    width: wp(6),
    height: wp(6),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.background,
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
  fullName: {
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
  editButton: {
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    alignItems: "center",
    backgroundColor: theme.colors.card,
  },
  editButtonText: {
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
    minHeight: hp(40),
  },
});
