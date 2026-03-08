import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { AppContext } from "../context/AppContext";
import { theme } from "../theme/theme";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

export default function AuthScreen() {
  const { login, register } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    let result;

    if (isLogin) {
      result = await login(email, password);

      if (!result.success) {
        toast.error(result.message);
      }
    } else {
      result = await register(name, email, password);

      if (result.success) {
        setIsLogin(true);
        toast.success("Account created successfully! Please login.");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        toast.error(result.message);
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View
                  style={[
                    styles.logo,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text style={styles.logoText}>S</Text>
                </View>
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {isLogin ? "Welcome back" : "Create account"}
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                {isLogin ? "Sign in to continue" : "Join Sphere today"}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Name Field - Register only */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text
                    style={[
                      styles.label,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Full name
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: theme.colors.border },
                    ]}
                  >
                    <TextInput
                      placeholder="John Doe"
                      placeholderTextColor={theme.colors.textTertiary}
                      value={name}
                      onChangeText={setName}
                      style={[styles.input, { color: theme.colors.text }]}
                    />
                  </View>
                </View>
              )}

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Email
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <TextInput
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { color: theme.colors.text }]}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Password
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  <TextInput
                    placeholder={isLogin ? "Enter password" : "Create password"}
                    placeholderTextColor={theme.colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: theme.colors.text }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={wp(5)}
                      color={theme.colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password - Login only */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={() =>
                    Alert.alert("Reset Link Sent", "Check your email")
                  }
                >
                  <Text
                    style={[styles.forgotText, { color: theme.colors.primary }]}
                  >
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle */}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsLogin(!isLogin);
                  setName("");
                }}
              >
                <Text
                  style={[styles.toggleText, { color: theme.colors.primary }]}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(4),
    justifyContent: "center",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  logoContainer: {
    marginBottom: hp(2),
  },
  logo: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(4),
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: wp(7),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  title: {
    fontSize: wp(6),
    fontWeight: "600",
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: wp(4),
  },

  // Form
  form: {
    width: "100%",
    marginBottom: hp(3),
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: wp(3.5),
    fontWeight: "500",
    marginBottom: hp(0.5),
    marginLeft: wp(1),
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.5,
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    height: hp(6),
    backgroundColor: theme.colors.card,
  },
  input: {
    flex: 1,
    fontSize: wp(4),
    color: theme.colors.text,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: hp(3),
  },
  forgotText: {
    fontSize: wp(3.5),
    fontWeight: "500",
  },
  submitButton: {
    height: hp(6),
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: wp(4),
    fontWeight: "600",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: wp(3.8),
  },
  toggleText: {
    fontSize: wp(3.8),
    fontWeight: "600",
  },
});
