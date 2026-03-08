import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from "react-native";
import { useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Create = ({ navigation }) => {
  const toast = useToast();
  const { user, createPost } = useContext(AppContext);

  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        const request = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!request.granted) {
          Alert.alert(
            "Permission Required",
            "Gallery access is required to create a post.",
            [
              { text: "Cancel", style: "cancel" },
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image pick error:", error);
      toast.error("Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.getCameraPermissionsAsync();

      if (!permission.granted) {
        const request = await ImagePicker.requestCameraPermissionsAsync();

        if (!request.granted) {
          Alert.alert(
            "Permission Required",
            "Camera access is required to take a photo.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Settings",
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera error:", error);
      toast.error("Failed to take photo");
    }
  };

  const handleShare = async () => {
    if (!image) {
      toast.error("Please select an image");
      return;
    }

    try {
      setLoading(true);
      const result = await createPost({
        image,
        caption: caption.trim(),
      });

      if (result.success) {
        toast.success("Post created successfully!");
        setImage(null);
        setCaption("");
        navigation.navigate("Profile");
      } else {
        toast.error(result.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        onPress: () => setImage(null),
        style: "destructive",
      },
    ]);
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>New Post</Text>
        
        <TouchableOpacity
          onPress={handleShare}
          disabled={loading || !image}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.shareText,
                (!image) && styles.shareTextDisabled,
              ]}
            >
              Share
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Info */}
          <View style={styles.userInfo}>
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarPlaceholderText}>
                  {getInitials(user?.username)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{user?.username}</Text>
              <Text style={styles.userStatus}>Public post</Text>
            </View>
          </View>

          {/* Image Section */}
          <View style={styles.imageSection}>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                >
                  <Icon
                    name="close-circle"
                    size={wp(6)}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.placeholderIcon}>
                  <Icon
                    name="images-outline"
                    size={wp(12)}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.placeholderTitle}>No Image Selected</Text>
                <Text style={styles.placeholderText}>
                  Choose a photo to share with your followers
                </Text>
              </View>
            )}
          </View>

          {/* Image Options */}
          {!image && (
            <View style={styles.optionsGrid}>
              <TouchableOpacity style={styles.optionCard} onPress={pickImage}>
                <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Icon name="images" size={wp(6)} color={theme.colors.primary} />
                </View>
                <Text style={styles.optionTitle}>Gallery</Text>
                <Text style={styles.optionDescription}>Choose from library</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={takePhoto}>
                <View style={[styles.optionIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Icon name="camera" size={wp(6)} color={theme.colors.success} />
                </View>
                <Text style={styles.optionTitle}>Camera</Text>
                <Text style={styles.optionDescription}>Take a photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Caption Input */}
          {image && (
            <View style={styles.captionSection}>
              <Text style={styles.captionLabel}>Caption</Text>
              <View style={styles.captionContainer}>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Write a caption..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <View style={styles.captionFooter}>
                  <Icon name="information-circle-outline" size={wp(3.5)} color={theme.colors.textTertiary} />
                  <Text style={styles.captionHint}>Add context to your post</Text>
                  <Text style={styles.captionCount}>{caption.length}/500</Text>
                </View>
              </View>
            </View>
          )}

          {/* Tips Section */}
          {image && (
            <View style={styles.tipsContainer}>
              <Icon name="bulb-outline" size={wp(4)} color={theme.colors.warning} />
              <Text style={styles.tipsText}>
                Add hashtags to reach more people! #explore #trending
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Create;

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
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  shareText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.primary,
  },
  shareTextDisabled: {
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },
  
  // User Info
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    marginBottom: hp(2.5),
    paddingVertical: hp(1),
  },
  userAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  userAvatarPlaceholder: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarPlaceholderText: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  userName: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  userStatus: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  
  // Image Section
  imageSection: {
    marginBottom: hp(2.5),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: hp(35),
    borderRadius: wp(3),
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  removeImageButton: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    backgroundColor: theme.colors.card,
    borderRadius: wp(4),
    padding: wp(1),
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: wp(8),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    minHeight: hp(25),
  },
  placeholderIcon: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: theme.colors.primary + '10',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  placeholderTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  placeholderText: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
    textAlign: "center",
  },
  
  // Options Grid
  optionsGrid: {
    flexDirection: "row",
    gap: wp(3),
    marginBottom: hp(2.5),
  },
  optionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    padding: wp(4),
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  optionIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(1),
  },
  optionTitle: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.3),
  },
  optionDescription: {
    fontSize: wp(3),
    color: theme.colors.textTertiary,
    textAlign: "center",
  },
  
  // Caption Section
  captionSection: {
    marginBottom: hp(2.5),
  },
  captionLabel: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  captionContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  captionInput: {
    fontSize: wp(4),
    color: theme.colors.text,
    minHeight: hp(12),
    padding: wp(3),
    textAlignVertical: "top",
  },
  captionFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    gap: wp(1.5),
  },
  captionHint: {
    flex: 1,
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  captionCount: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  
  // Tips
  tipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    padding: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    gap: wp(2),
  },
  tipsText: {
    flex: 1,
    fontSize: wp(3.2),
    color: theme.colors.textSecondary,
  },
});