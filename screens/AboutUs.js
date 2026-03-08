import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const AboutUs = ({ navigation }) => {
  const openLink = (url) => {
    Linking.openURL(url);
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.iconContainer}>
            <Icon name="planet" size={wp(8)} color={theme.colors.primary} />
          </View>
          <View style={styles.appText}>
            <Text style={styles.appName}>Sphere</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            Sphere is a social media platform where you can post, connect, chat,
            and explore endless possibilities. Built with passion, Sphere aims
            to create a vibrant community where everyone can share their moments
            and connect with like-minded people.
          </Text>
        </View>

        {/* Creator */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Creator</Text>
          <View style={styles.creatorCard}>
            <View style={styles.creatorAvatar}>
              <Text style={styles.creatorInitials}>VM</Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>Vardhansinh Mandora</Text>
              <Text style={styles.creatorRole}>Founder & Developer</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Icon
              name="calendar-outline"
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.detailText}>Founded in 2026</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon
              name="location-outline"
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.detailText}>Ahmedabad, India</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon
              name="heart-outline"
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
            <Text style={styles.detailText}>Made with love in India</Text>
          </View>
        </View>

        {/* Connect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect</Text>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() =>
              openLink("https://www.instagram.com/vardhan_sinh_16")
            }
            activeOpacity={0.7}
          >
            <Icon name="logo-instagram" size={wp(5)} color="#E4405F" />
            <Text style={styles.linkText}>@vardhan_sinh_16</Text>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openLink("https://vardhansinh.vercel.app/")}
            activeOpacity={0.7}
          >
            <Icon
              name="globe-outline"
              size={wp(5)}
              color={theme.colors.primary}
            />
            <Text style={styles.linkText}>vardhansinh.vercel.app</Text>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Icon
                name="images-outline"
                size={wp(5)}
                color={theme.colors.secondary}
              />
              <Text style={styles.featureText}>Share Posts</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon
                name="people-outline"
                size={wp(5)}
                color={theme.colors.accent1}
              />
              <Text style={styles.featureText}>Connect</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon
                name="chatbubbles-outline"
                size={wp(5)}
                color={theme.colors.accent2}
              />
              <Text style={styles.featureText}>Chat</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon
                name="compass-outline"
                size={wp(5)}
                color={theme.colors.accent3}
              />
              <Text style={styles.featureText}>Explore</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Sphere. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutUs;

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
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(2),
  },

  // App Info
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    marginBottom: hp(3),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(3),
    backgroundColor: theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  appText: {
    flex: 1,
  },
  appName: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.3),
  },
  appVersion: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
  },

  // Sections
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(1.5),
    marginLeft: wp(1),
  },
  description: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
    backgroundColor: theme.colors.card,
    padding: wp(3),
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },

  // Creator
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    backgroundColor: theme.colors.card,
    padding: wp(3),
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  creatorAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  creatorInitials: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "#fff",
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  creatorRole: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
  },

  // Details
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    paddingVertical: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  detailText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
  },

  // Links
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    marginBottom: hp(1),
  },
  linkText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
  },

  // Features
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wp(2),
  },
  featureItem: {
    width: (width - wp(12)) / 2,
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  featureText: {
    fontSize: wp(3.5),
    color: theme.colors.text,
  },

  // Footer
  footer: {
    marginTop: hp(2),
    alignItems: "center",
  },
  footerText: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },
});
