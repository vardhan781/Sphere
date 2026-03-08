import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "./theme/theme";
import { Platform, Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SplashScreen from "./components/SplashScreen";
import Home from "./screens/Home";
import Explore from "./screens/Explore";
import Create from "./screens/Create";
import Notifications from "./screens/Notifications";
import Profile from "./screens/Profile";
import AuthScreen from "./screens/AuthScreen";
import EditProfile from "./screens/EditProfile";
import AppContextProvider from "./context/AppContext";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function MainTabs() {
  const insets = useSafeAreaInsets();

  const hasGestureNav = Platform.OS === "android" && insets.bottom > 0;
  const bottomPadding = hasGestureNav ? insets.bottom : 0;
  const tabBarHeight = 60;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding || 0,
          paddingTop: 0,
          ...(Platform.OS === "android" && {
            elevation: 8,
          }),
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: SCREEN_WIDTH > 400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Explore") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "Create") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          }

          return <Ionicons name={iconName} size={28} color={color} />;
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
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || contextLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "android" ? "slide_from_right" : "default",
        gestureEnabled: true,
        gestureDirection: "horizontal",
        fullScreenGestureEnabled: true,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{
              animation: "slide_from_bottom",
            }}
          />
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
  return (
    <AppContextProvider>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </ToastProvider>
    </AppContextProvider>
  );
}
