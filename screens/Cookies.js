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
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Cookies = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const lastUpdated = "February 18, 2026";

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
        <Text style={styles.headerTitle}>Cookies Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Icon
            name="time-outline"
            size={wp(4)}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.lastUpdatedText}>
            Last Updated: {lastUpdated}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name="document-text-outline"
              size={wp(5)}
              color={theme.colors.primary}
              style={{ marginBottom: hp(1.5) }}
            />
            <Text style={styles.cardTitle}>Cookie Policy</Text>
          </View>
          <Text style={styles.cardText}>
            At Sphere, we use cookies and similar technologies to enhance your
            experience, provide our services, and understand how you interact
            with our platform. This policy explains what cookies are and how we
            use them.
          </Text>
        </View>

        {/* What Are Cookies */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("what")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="help-circle-outline"
                size={wp(5)}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>What Are Cookies?</Text>
            </View>
            <Icon
              name={expandedSections.what ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.what && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Cookies are small text files that are stored on your device when
                you visit a website or use an app. They help us remember your
                preferences, authenticate your sessions, and improve your
                overall experience.
              </Text>
              <Text style={[styles.sectionText, styles.sectionTextSpacer]}>
                Cookies can be "persistent" or "session" cookies. Persistent
                cookies remain on your device when you go offline, while session
                cookies are deleted when you close the app.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* How We Use Cookies */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("how")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="cog-outline"
                size={wp(5)}
                color={theme.colors.secondary}
              />
              <Text style={styles.sectionTitle}>How We Use Cookies</Text>
            </View>
            <Icon
              name={expandedSections.how ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.how && (
            <View style={styles.sectionContent}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Authentication:</Text> We use
                  cookies to keep you logged in and maintain your session
                  securely.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Preferences:</Text> Cookies remember
                  your settings and preferences for a personalized experience.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Security:</Text> We use cookies to
                  detect fraud and protect your account from unauthorized
                  access.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Performance:</Text> Cookies help us
                  understand how you use our app so we can improve it.
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Types of Cookies */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Types of Cookies</Text>

          <View style={styles.typeItem}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: theme.colors.primary + "10" },
              ]}
            >
              <Icon
                name="lock-closed-outline"
                size={wp(4.5)}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Essential Cookies</Text>
              <Text style={styles.typeText}>
                Required for the app to function properly. They enable core
                features like authentication and security.
              </Text>
            </View>
          </View>

          <View style={styles.typeItem}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: theme.colors.secondary + "10" },
              ]}
            >
              <Icon
                name="options-outline"
                size={wp(4.5)}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Preference Cookies</Text>
              <Text style={styles.typeText}>
                Remember your settings and choices to personalize your
                experience.
              </Text>
            </View>
          </View>

          <View style={styles.typeItem}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: theme.colors.accent1 + "10" },
              ]}
            >
              <Icon
                name="analytics-outline"
                size={wp(4.5)}
                color={theme.colors.accent1}
              />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeTitle}>Analytics Cookies</Text>
              <Text style={styles.typeText}>
                Help us understand how users interact with our app to improve
                performance and features.
              </Text>
            </View>
          </View>
        </View>

        {/* Third-Party Cookies */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("third")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="share-outline"
                size={wp(5)}
                color={theme.colors.accent2}
              />
              <Text style={styles.sectionTitle}>Third-Party Cookies</Text>
            </View>
            <Icon
              name={expandedSections.third ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.third && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                Some third-party services we use may set their own cookies:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Cloudinary:</Text> For image
                  optimization and delivery
                </Text>
              </View>
              <Text style={[styles.sectionText, styles.sectionTextSpacer]}>
                These third parties have their own cookie policies and
                practices.
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Your Choices */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("choices")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="hand-left-outline"
                size={wp(5)}
                color={theme.colors.accent3}
              />
              <Text style={styles.sectionTitle}>Your Cookie Choices</Text>
            </View>
            <Icon
              name={expandedSections.choices ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.choices && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                You can control and manage cookies in several ways:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Browser Settings:</Text> Most
                  browsers allow you to refuse or accept cookies.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>App Settings:</Text> You can adjust
                  your device settings to limit cookie usage.
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Essential Cookies:</Text> Note that
                  disabling essential cookies may affect app functionality.
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Updates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Updates to This Policy</Text>
          <Text style={styles.cardText}>
            We may update this Cookies Policy from time to time. We will notify
            you of any changes by posting the new policy here and updating the
            "Last Updated" date.
          </Text>
        </View>

        {/* Contact */}
        <View style={[styles.card, styles.contactCard]}>
          <Icon name="mail-outline" size={wp(5)} color={theme.colors.primary} />
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about our use of cookies, please contact
            us at:
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() =>
              Linking.openURL("mailto:vardhansinhmandora@gmail.com")
            }
            activeOpacity={0.7}
          >
            <Text style={styles.contactButtonText}>
              vardhansinhmandora@gmail.com
            </Text>
          </TouchableOpacity>
        </View>

        {/* Agreement */}
        <View style={styles.agreement}>
          <Icon
            name="checkmark-circle"
            size={wp(4)}
            color={theme.colors.success}
          />
          <Text style={styles.agreementText}>
            By using Sphere, you consent to our use of cookies
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Cookies;

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

  // Last Updated
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    marginBottom: hp(2),
  },
  lastUpdatedText: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  cardText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
  },

  // Sections
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: wp(3),
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "500",
    color: theme.colors.text,
  },
  sectionContent: {
    paddingHorizontal: wp(3),
    paddingBottom: wp(3),
  },
  sectionText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
  },
  sectionTextSpacer: {
    marginTop: hp(1.5),
  },

  // Bullet Points
  bulletPoint: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(1),
  },
  bulletDot: {
    fontSize: wp(4),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
  },
  bulletText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
  },
  bold: {
    fontWeight: "600",
    color: theme.colors.text,
  },

  // Types
  typeItem: {
    flexDirection: "row",
    gap: wp(3),
    marginBottom: hp(2),
  },
  typeIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  typeText: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.2),
  },

  // Contact
  contactCard: {
    alignItems: "center",
    backgroundColor: theme.colors.primary + "05",
    borderColor: theme.colors.primary + "20",
  },
  contactTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: hp(1.5),
    marginBottom: hp(0.5),
  },
  contactText: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp(2),
  },
  contactButton: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.primary,
    borderRadius: wp(2),
  },
  contactButtonText: {
    fontSize: wp(3.5),
    color: "#fff",
    fontWeight: "500",
  },

  // Agreement
  agreement: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    marginTop: hp(2),
  },
  agreementText: {
    fontSize: wp(3.2),
    color: theme.colors.success,
  },
});
