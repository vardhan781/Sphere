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
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const ContactUs = ({ navigation }) => {
  const toast = useToast();

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {
      toast.error("Could not open link");
    });
  };

  const openEmail = () => {
    Linking.openURL("mailto:vardhansinhmandora@gmail.com").catch(() => {
      toast.error("Could not open email app");
    });
  };

  const openPhone = () => {
    Linking.openURL("tel:9725312744").catch(() => {
      toast.error("Could not open phone app");
    });
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <View style={styles.iconContainer}>
            <Icon name="mail" size={wp(6)} color={theme.colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerInfoTitle}>Get in Touch</Text>
            <Text style={styles.headerInfoText}>
              We'd love to hear from you. Reach out anytime.
            </Text>
          </View>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Methods</Text>

          {/* Email */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={openEmail}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.contactIcon,
                { backgroundColor: theme.colors.primary + "10" },
              ]}
            >
              <Icon
                name="mail-outline"
                size={wp(5)}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>
                vardhansinhmandora@gmail.com
              </Text>
            </View>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={openPhone}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.contactIcon,
                { backgroundColor: theme.colors.secondary + "10" },
              ]}
            >
              <Icon
                name="call-outline"
                size={wp(5)}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+91 97253 12744</Text>
            </View>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          {/* Website */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => openLink("https://vardhansinh.vercel.app/")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.contactIcon,
                { backgroundColor: theme.colors.accent1 + "10" },
              ]}
            >
              <Icon
                name="globe-outline"
                size={wp(5)}
                color={theme.colors.accent1}
              />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>vardhansinh.vercel.app</Text>
            </View>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() =>
              openLink("https://www.instagram.com/vardhan_sinh_16")
            }
            activeOpacity={0.7}
          >
            <View
              style={[styles.contactIcon, { backgroundColor: "#E4405F10" }]}
            >
              <Icon name="logo-instagram" size={wp(5)} color="#E4405F" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Instagram</Text>
              <Text style={styles.contactValue}>@vardhan_sinh_16</Text>
            </View>
            <Icon
              name="open-outline"
              size={wp(4)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          {/* Location */}
          <View style={styles.contactRow}>
            <View
              style={[
                styles.contactIcon,
                { backgroundColor: theme.colors.accent3 + "10" },
              ]}
            >
              <Icon
                name="location-outline"
                size={wp(5)}
                color={theme.colors.accent3}
              />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactValue}>Ahmedabad, India</Text>
            </View>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>

          <View style={styles.hoursContainer}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Friday</Text>
              <Text style={styles.hoursTime}>9:00 AM - 8:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={styles.hoursTime}>Closed</Text>
            </View>
          </View>

          <Text style={styles.hoursNote}>
            We typically respond within 24 hours on business days
          </Text>
        </View>

        {/* Office Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Office</Text>
          <View style={styles.addressCard}>
            <Icon
              name="business-outline"
              size={wp(5)}
              color={theme.colors.primary}
            />
            <Text style={styles.addressText}>
              Sphere Headquarters{"\n"}
              Ahmedabad, Gujarat 380001{"\n"}
              India
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We aim to respond to all inquiries within 24 hours.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUs;

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

  // Header Info
  headerInfo: {
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
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  headerInfoTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.3),
  },
  headerInfoText: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
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

  // Contact Rows
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    marginBottom: hp(1),
  },
  contactIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
    marginBottom: hp(0.2),
  },
  contactValue: {
    fontSize: wp(3.8),
    color: theme.colors.text,
  },

  // Hours
  hoursContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    padding: wp(3),
    marginBottom: hp(1),
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  hoursDay: {
    fontSize: wp(3.8),
    color: theme.colors.text,
  },
  hoursTime: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
  },
  hoursNote: {
    fontSize: wp(3.2),
    color: theme.colors.textTertiary,
    fontStyle: "italic",
    marginLeft: wp(1),
  },

  // Address
  addressCard: {
    flexDirection: "row",
    gap: wp(3),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  addressText: {
    flex: 1,
    fontSize: wp(3.8),
    color: theme.colors.text,
    lineHeight: hp(2.5),
  },

  // Footer
  footer: {
    marginTop: hp(2),
    padding: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  footerText: {
    fontSize: wp(3.5),
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
});
