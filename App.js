import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "./theme/theme";
import { Platform, Dimensions, View, Text, LogBox } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

LogBox.ignoreAllLogs();

import SplashScreen from "./components/SplashScreen";
import Home from "./screens/Home";
import Explore from "./screens/Explore";
import Create from "./screens/Create";
import Notifications from "./screens/Notifications";
import Profile from "./screens/Profile";
import AuthScreen from "./screens/AuthScreen";
import EditProfile from "./screens/EditProfile";
import Settings from "./screens/Settings";
import PostDetail from "./screens/PostDetail";
import EditPost from "./screens/EditPost";
import UserProfile from "./screens/UserProfile";
import AboutUs from "./screens/AboutUs";
import ContactUs from "./screens/ContactUs";
import PrivacyPolicy from "./screens/PrivacyPolicy";
import Cookies from "./screens/Cookies";
import Chats from "./screens/Chats";
import ChatDetail from "./screens/ChatDetail";
import Followers from "./screens/Followers";
import Following from "./screens/Following";

import AppContextProvider from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.primary,
  },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const hasGestureNav = Platform.OS === "android" && insets.bottom > 0;
  const bottomPadding = hasGestureNav ? insets.bottom : 0;
  const tabBarHeight = 60;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Explore")
            iconName = focused ? "compass" : "compass-outline";
          else if (route.name === "Create")
            iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Notifications")
            iconName = focused ? "heart" : "heart-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person-circle" : "person-circle-outline";

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: SCREEN_WIDTH > 400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding || 0,
          ...(Platform.OS === "android" && { elevation: 8 }),
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Create" component={Create} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading: contextLoading } = useContext(AppContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || contextLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? "Main" : "Auth"}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },

        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        }),
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="PostDetail" component={PostDetail} />
          <Stack.Screen name="EditPost" component={EditPost} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="AboutUs" component={AboutUs} />
          <Stack.Screen name="ContactUs" component={ContactUs} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="Cookies" component={Cookies} />
          <Stack.Screen name="Chats" component={Chats} />
          <Stack.Screen name="ChatDetail" component={ChatDetail} />
          <Stack.Screen name="Followers" component={Followers} />
          <Stack.Screen name="Following" component={Following} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  try {
    return (
      <SafeAreaProvider>
        <AppContextProvider>
          <ToastProvider>
            <NavigationContainer theme={AppTheme}>
              <StatusBar
                style="light"
                backgroundColor={theme.colors.background}
              />
              <RootNavigator />
            </NavigationContainer>
          </ToastProvider>
        </AppContextProvider>
      </SafeAreaProvider>
    );
  } catch (error) {
    console.error("App rendering failed:", error);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          Something went wrong
        </Text>
      </View>
    );
  }
}
