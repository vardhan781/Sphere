import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const Settings = ({ navigation }) => {
  const toast = useToast();
  const { logout } = useContext(AppContext);
  const [logoutModal, setLogoutModal] = useState(false);

  const appVersion = "1.0.0";

  const menuItems = [
    {
      id: "1",
      title: "About Us",
      icon: "information-circle-outline",
      onPress: () => navigation.navigate("AboutUs"),
    },
    {
      id: "2",
      title: "Contact Us",
      icon: "mail-outline",
      onPress: () => navigation.navigate("ContactUs"),
    },
    {
      id: "3",
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      onPress: () => navigation.navigate("PrivacyPolicy"),
    },
    {
      id: "4",
      title: "Cookies",
      icon: "document-text-outline",
      onPress: () => navigation.navigate("Cookies"),
    },
  ];

  const handleLogout = async () => {
    setLogoutModal(false);
    await logout();
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={item.icon}
                    size={wp(5)}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Icon
                name="chevron-forward"
                size={wp(4.5)}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ))}

          {/* Logout Option */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.lastMenuItem,
              styles.logoutMenuItem,
            ]}
            onPress={() => setLogoutModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <Icon
                  name="log-out-outline"
                  size={wp(5)}
                  color={theme.colors.error}
                />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>
                Logout
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              size={wp(4.5)}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version {appVersion}</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLogoutModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Icon
                name="log-out-outline"
                size={wp(8)}
                color={theme.colors.error}
              />
            </View>

            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  placeholder: {
    width: wp(6),
  },
  scrollContent: {
    padding: wp(4),
  },
  menuContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: wp(3),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  logoutMenuItem: {
    marginTop: hp(1),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(2),
    backgroundColor: theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIconContainer: {
    backgroundColor: theme.colors.error + "10",
  },
  menuItemText: {
    fontSize: wp(4),
    color: theme.colors.text,
  },
  logoutText: {
    color: theme.colors.error,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  versionText: {
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: wp(85),
    borderRadius: wp(4),
    padding: wp(6),
    alignItems: "center",
  },
  modalIconContainer: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: theme.colors.error + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  modalText: {
    fontSize: wp(3.8),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: hp(3),
  },
  modalButtons: {
    flexDirection: "row",
    gap: wp(3),
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: theme.colors.text,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
  },
  logoutButtonText: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#fff",
  },
});

export default Settings;
