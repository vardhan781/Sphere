import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import React, { useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const EditPost = ({ navigation, route }) => {
  const toast = useToast();
  const { post } = route.params;
  const { updatePost } = useContext(AppContext);

  const [caption, setCaption] = useState(post?.caption || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await updatePost(post._id, caption.trim());

      if (result.success) {
        toast.success("Post updated successfully");
        navigation.goBack();
      } else {
        toast.error(result.message || "Failed to update post");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (caption !== post?.caption) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const hasChanges = caption !== post?.caption;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleCancel} 
          disabled={saving}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Post</Text>
        
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !hasChanges}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.saveText,
                !hasChanges && styles.saveTextDisabled,
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? hp(2) : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Post Image - Full width, contained */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: post?.image }} 
              style={styles.postImage}
              resizeMode="contain"
            />
          </View>

          {/* Caption Input */}
          <View style={styles.captionSection}>
            <Text style={styles.sectionLabel}>Caption</Text>
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
                editable={!saving}
              />
              <View style={styles.captionFooter}>
                <Text style={styles.captionCount}>
                  {caption.length}/500
                </Text>
                {hasChanges && (
                  <View style={styles.unsavedBadge}>
                    <Text style={styles.unsavedBadgeText}>Unsaved</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoBox}>
            <Icon name="information-circle-outline" size={wp(4.5)} color={theme.colors.info} />
            <Text style={styles.infoText}>
              Only the caption can be edited. The image cannot be changed.
            </Text>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditPost;

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
  cancelText: {
    fontSize: wp(4),
    color: theme.colors.textSecondary,
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  saveText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.primary,
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
  },
  imageContainer: {
    width: "100%",
    height: hp(35),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: hp(2.5),
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  captionSection: {
    marginBottom: hp(2),
  },
  sectionLabel: {
    fontSize: wp(4),
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
    minHeight: hp(15),
    padding: wp(3),
    textAlignVertical: "top",
  },
  captionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  captionCount: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  unsavedBadge: {
    backgroundColor: theme.colors.warning + "20",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
  },
  unsavedBadgeText: {
    fontSize: wp(3),
    color: theme.colors.warning,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    padding: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    gap: wp(2),
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.2),
  },
  bottomSpacing: {
    height: hp(2),
  },
});