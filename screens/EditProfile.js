import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { theme } from "../theme/theme";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const EditProfile = ({ navigation }) => {
  const { user, updateProfile } = useContext(AppContext);
  const toast = useToast();

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const result = await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        navigation.goBack();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = username !== user?.username || bio !== user?.bio;

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
          <Icon name="close" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving || !hasChanges}
          style={styles.saveButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                styles.saveButtonText,
                !hasChanges && styles.saveButtonTextDisabled,
              ]}
            >
              Save
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
          bounces={false}
        >
          {/* Username Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="person-outline"
                size={wp(5)}
                color={theme.colors.textTertiary}
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <Text style={styles.hint}>This will be your display name</Text>
          </View>

          {/* Bio Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <Icon
                name="information-circle-outline"
                size={wp(5)}
                color={theme.colors.textTertiary}
                style={styles.bioIcon}
              />
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Write something about yourself"
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
                style={[styles.input, styles.bioInput]}
              />
            </View>
            <View style={styles.charCount}>
              <Text style={styles.charCountText}>{bio.length}/150</Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon
              name="information-circle"
              size={wp(5)}
              color={theme.colors.info}
            />
            <Text style={styles.infoText}>
              Your profile information will be visible to other users
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  saveButton: {
    padding: wp(1),
  },
  saveButtonText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.primary,
  },
  saveButtonTextDisabled: {
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },
  fieldContainer: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: theme.colors.text,
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    paddingHorizontal: wp(3),
    minHeight: hp(6.5),
    gap: wp(2),
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: theme.colors.text,
    paddingVertical: hp(1.2),
  },
  bioContainer: {
    alignItems: "flex-start",
    minHeight: hp(15),
    paddingTop: hp(1.5),
  },
  bioIcon: {
    marginTop: hp(0.3),
  },
  bioInput: {
    paddingTop: 0,
    paddingBottom: hp(1.5),
  },
  hint: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  charCount: {
    alignItems: "flex-end",
    marginTop: hp(0.5),
  },
  charCountText: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    padding: wp(3),
    marginTop: hp(1),
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
});

export default EditProfile;
