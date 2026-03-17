import { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const Toast = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#FF4444";
      case "warning":
        return "#FFA726";
      case "info":
      default:
        return "#FFFFFF";
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={["#1E1E1E", "#2D2D2D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: height / 2 - 30,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  gradient: {
    paddingVertical: 8,
    paddingHorizontal:16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: width - 80,
    alignSelf: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});

export default Toast;
