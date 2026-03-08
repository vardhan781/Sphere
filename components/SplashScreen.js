import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { theme } from "../theme/theme";

const { width, height } = Dimensions.get("window");

const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundAlt]}
        style={styles.gradient}
      />

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaskedView maskElement={<Text style={styles.logoMask}>SPHERE</Text>}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.logoMask, { opacity: 0 }]}>SPHERE</Text>
          </LinearGradient>
        </MaskedView>

        <Text style={styles.tagline}>where connections come alive</Text>
      </Animated.View>

      <Text style={styles.credit}>Developed by Vardhan Sinh</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  gradient: {
    position: "absolute",
    width: width,
    height: height,
  },
  centerContent: {
    alignItems: "center",
  },
  logoMask: {
    fontSize: wp(13),
    fontWeight: "900",
    letterSpacing: wp(1.5),
  },
  tagline: {
    marginTop: hp(1.5),
    fontSize: wp(4),
    color: theme.colors.textSecondary,
    letterSpacing: wp(0.5),
  },
  credit: {
    position: "absolute",
    bottom: hp(5),
    fontSize: wp(3.5),
    color: theme.colors.textTertiary,
    letterSpacing: wp(0.3),
  },
});

export default SplashScreen;
