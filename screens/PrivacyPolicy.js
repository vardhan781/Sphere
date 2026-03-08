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

const PrivacyPolicy = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
              name="shield-checkmark"
              size={wp(5)}
              color={theme.colors.primary}
            />
            <Text style={styles.cardTitle}>Your Privacy Matters</Text>
          </View>
          <Text style={styles.cardText}>
            At Sphere, we take your privacy seriously. This policy describes how
            we collect, use, and protect your personal information when you use
            our platform.
          </Text>
        </View>

        {/* Information We Collect */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("collect")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="folder-open-outline"
                size={wp(5)}
                color={theme.colors.primary}
              />
              <Text style={styles.sectionTitle}>Information We Collect</Text>
            </View>
            <Icon
              name={expandedSections.collect ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.collect && (
            <View style={styles.sectionContent}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Account Information:</Text>{" "}
                  Username, email address, and profile picture
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>User Content:</Text> Posts,
                  comments, likes, and other content you create
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Profile Data:</Text> Bio, followers,
                  following, and interaction data
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Device Information:</Text> Device
                  type, operating system, and app version
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Usage Data:</Text> How you interact
                  with our platform
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* How We Use Your Information */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("use")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="cog-outline"
                size={wp(5)}
                color={theme.colors.secondary}
              />
              <Text style={styles.sectionTitle}>
                How We Use Your Information
              </Text>
            </View>
            <Icon
              name={expandedSections.use ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.use && (
            <View style={styles.sectionContent}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To provide and maintain our social platform
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To personalize your experience and show relevant content
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To connect you with other users and enable social features
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To improve and optimize our services
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To communicate with you about updates and support
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To protect against unauthorized access and ensure security
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Data Sharing */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("sharing")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="share-social-outline"
                size={wp(5)}
                color={theme.colors.accent1}
              />
              <Text style={styles.sectionTitle}>Data Sharing</Text>
            </View>
            <Icon
              name={expandedSections.sharing ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.sharing && (
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionText, styles.sectionTextSpacer]}>
                We do not sell your personal information. We may share data:
              </Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  With other users as part of social features (posts, comments,
                  etc.)
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  With service providers (Cloudinary for image hosting)
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To comply with legal obligations
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  To protect our rights and safety
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Data Storage */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("storage")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="server-outline"
                size={wp(5)}
                color={theme.colors.accent2}
              />
              <Text style={styles.sectionTitle}>Data Storage & Security</Text>
            </View>
            <Icon
              name={expandedSections.storage ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.storage && (
            <View style={styles.sectionContent}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Your data is stored securely on protected servers
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  We use encryption to protect your information
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  You can delete your content anytime through the app
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Account deletion permanently removes your data
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Your Rights */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleSection("rights")}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon
                name="hand-left-outline"
                size={wp(5)}
                color={theme.colors.accent3}
              />
              <Text style={styles.sectionTitle}>Your Rights</Text>
            </View>
            <Icon
              name={expandedSections.rights ? "chevron-up" : "chevron-down"}
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </View>

          {expandedSections.rights && (
            <View style={styles.sectionContent}>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Access:</Text> You can view your
                  data anytime
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Edit:</Text> Update your profile
                  information
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Delete:</Text> Remove your posts and
                  content
                </Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bold}>Export:</Text> Request a copy of
                  your data
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Third-Party Services */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Third-Party Services</Text>
          <Text style={styles.cardText}>
            We use the following services to enhance your experience:
          </Text>
          <View style={styles.serviceItem}>
            <Icon
              name="cloud-outline"
              size={wp(4)}
              color={theme.colors.primary}
            />
            <Text style={styles.serviceText}>
              Cloudinary - Image hosting and optimization
            </Text>
          </View>
          <Text style={styles.cardSubtext}>
            These services have their own privacy policies and data handling
            practices.
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Children's Privacy</Text>
          <Text style={styles.cardText}>
            Sphere is not intended for users under the age of 13. We do not
            knowingly collect information from children under 13. If you believe
            a child has provided us with personal information, please contact us
            immediately.
          </Text>
        </View>

        {/* Changes to Policy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Changes to This Policy</Text>
          <Text style={styles.cardText}>
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy here and updating the
            "Last Updated" date.
          </Text>
        </View>

        {/* Contact */}
        <View style={[styles.card, styles.contactCard]}>
          <Icon name="mail-outline" size={wp(5)} color={theme.colors.primary} />
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about this privacy policy, please contact
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
            By using Sphere, you agree to this privacy policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;

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
  },
  cardText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    lineHeight: hp(2.5),
  },
  cardSubtext: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
    fontStyle: "italic",
    marginTop: hp(1.5),
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
    marginBottom: hp(1.5),
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

  // Service Item
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginTop: hp(1.5),
    marginBottom: hp(1),
  },
  serviceText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
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
