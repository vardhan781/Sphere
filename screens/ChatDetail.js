import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
} from "react-native";
import { useState, useContext, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { theme } from "../theme/theme";
import { AppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";

const { width, height } = Dimensions.get("window");

// Responsive sizing
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const ChatDetail = ({ navigation, route }) => {
  const toast = useToast();
  const { chat: initialChat } = route.params;
  const {
    user: currentUser,
    socket,
    getMessages,
    sendMessage,
  } = useContext(AppContext);

  const [chat, setChat] = useState(initialChat);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardVisible(true);
      },
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const otherUser = chat?.participants?.find((u) => u._id !== currentUser?._id);

  useEffect(() => {
    fetchMessages();
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !chat?._id) return;

    setIsOnline(false); // reset when screen/chat changes
    socket.emit("join chat", chat._id);

    if (otherUser?._id) {
      socket.emit("check online", otherUser._id);
    }

    const handleMessage = (newMessage) => {
      if (newMessage.conversation?.toString() === chat._id?.toString()) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    const handleTyping = ({ conversationId, isTyping }) => {
      if (conversationId === chat._id) {
        setOtherUserTyping(isTyping);
      }
    };

    const handleOnlineStatus = ({ userId, isOnline }) => {
      if (userId === otherUser?._id) {
        setIsOnline(isOnline);
      }
    };

    const handlePresenceUpdate = ({ userId, isOnline }) => {
      if (userId === otherUser?._id) {
        setIsOnline(isOnline);
      }
    };

    socket.on("message received", handleMessage);
    socket.on("user typing", handleTyping);
    socket.on("online status", handleOnlineStatus);
    socket.on("presence update", handlePresenceUpdate);

    return () => {
      socket.off("message received", handleMessage);
      socket.off("user typing", handleTyping);
      socket.off("online status", handleOnlineStatus);
      socket.off("presence update", handlePresenceUpdate);
    };
  }, [socket, chat?._id, otherUser?._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const result = await getMessages(chat._id);
      if (result.success) {
        setMessages(result.messages);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      const result = await sendMessage(chat._id, messageText.trim());

      if (result.success) {
        setMessages((prev) => [...prev, result.message]);
        setMessageText("");

        if (socket) {
          socket.emit("stop typing", chat._id);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);

    if (socket && text.trim()) {
      if (!typingTimeoutRef.current) {
        socket.emit("typing", chat._id);
      }

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop typing", chat._id);
        typingTimeoutRef.current = null;
      }, 1500);
    } else if (!text.trim() && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit("stop typing", chat._id);
      typingTimeoutRef.current = null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const handleImagePress = () => {
    Alert.alert(otherUser?.username, "What would you like to do?", [
      {
        text: "View Profile",
        onPress: () =>
          navigation.navigate("UserProfile", { userId: otherUser?._id }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderMessage = ({ item, index }) => {
    const isOwnMessage = item.sender?._id === currentUser?._id;
    const showDateSeparator =
      index === 0 ||
      new Date(item.createdAt).toDateString() !==
        new Date(reversedMessages[index - 1]?.createdAt).toDateString();

    const showAvatar =
      !isOwnMessage &&
      (index === messages.length - 1 ||
        messages[index + 1]?.sender?._id !== item.sender?._id);

    return (
      <View key={item._id}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>
              {formatDateSeparator(item.createdAt)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
          ]}
        >
          {!isOwnMessage && (
            <View style={styles.avatarColumn}>
              {showAvatar ? (
                <TouchableOpacity onPress={handleImagePress}>
                  {otherUser?.profilePic ? (
                    <Image
                      source={{ uri: otherUser.profilePic }}
                      style={styles.messageAvatar}
                    />
                  ) : (
                    <View style={styles.messageAvatarPlaceholder}>
                      <Text style={styles.messageAvatarPlaceholderText}>
                        {getInitials(otherUser?.username)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View style={styles.messageAvatarPlaceholder} />
              )}
            </View>
          )}

          <View
            style={[
              styles.messageContainer,
              isOwnMessage
                ? styles.ownMessageContainer
                : styles.otherMessageContainer,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownBubble : styles.otherBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isOwnMessage
                    ? styles.ownMessageText
                    : styles.otherMessageText,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  isOwnMessage
                    ? styles.ownMessageTime
                    : styles.otherMessageTime,
                ]}
              >
                {formatTime(item.createdAt)}
                {isOwnMessage && (
                  <Icon
                    name={item.read ? "checkmark-done" : "checkmark"}
                    size={wp(3)}
                    color={
                      item.read ? theme.colors.primary : "rgba(255,255,255,0.5)"
                    }
                    style={styles.readReceipt}
                  />
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageRow, styles.otherMessageRow]}>
      <View style={styles.avatarColumn}>
        {otherUser?.profilePic ? (
          <Image
            source={{ uri: otherUser.profilePic }}
            style={styles.messageAvatar}
          />
        ) : (
          <View style={styles.messageAvatarPlaceholder}>
            <Text style={styles.messageAvatarPlaceholderText}>
              {getInitials(otherUser?.username)}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.messageContainer, styles.otherMessageContainer]}>
        <View
          style={[
            styles.messageBubble,
            styles.otherBubble,
            styles.typingBubble,
          ]}
        >
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={wp(6)} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() =>
            navigation.navigate("UserProfile", { userId: otherUser?._id })
          }
          activeOpacity={0.7}
        >
          <View style={styles.headerAvatarContainer}>
            {otherUser?.profilePic ? (
              <Image
                source={{ uri: otherUser.profilePic }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarPlaceholderText}>
                  {getInitials(otherUser?.username)}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.headerOnlineIndicator} />}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerUsername} numberOfLines={1}>
              {otherUser?.username}
            </Text>
            <Text style={styles.headerStatus}>
              {otherUserTyping ? (
                <Text style={styles.typingText}>typing...</Text>
              ) : isOnline ? (
                "Active now"
              ) : (
                "Offline"
              )}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="call-outline" size={wp(5)} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="videocam-outline"
              size={wp(5.5)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const reversedMessages = [...messages].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />
      {renderHeader()}

      <View style={styles.keyboardView}>
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          inverted
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {otherUserTyping && !sending && renderTypingIndicator()}

        {/* Message Input */}
        <View
          style={[
            styles.inputWrapper,
            keyboardVisible && { paddingBottom: keyboardHeight },
          ]}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon
                name="add-circle-outline"
                size={wp(6)}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={theme.colors.textTertiary}
              value={messageText}
              onChangeText={handleTyping}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Icon
                  name="send"
                  size={wp(5)}
                  color={
                    messageText.trim()
                      ? theme.colors.primary
                      : theme.colors.textTertiary
                  }
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: wp(2),
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(2),
  },
  headerAvatarContainer: {
    position: "relative",
    marginRight: wp(3),
  },
  headerAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerAvatarPlaceholder: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarPlaceholderText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
  },
  headerOnlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  headerInfo: {
    flex: 1,
  },
  headerUsername: {
    fontSize: wp(4),
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: hp(0.2),
  },
  headerStatus: {
    fontSize: wp(3),
    color: theme.colors.textSecondary,
  },
  typingText: {
    color: theme.colors.primary,
    fontStyle: "italic",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  headerIcon: {
    padding: wp(1),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesList: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(2.2),
    paddingBottom: hp(3),
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: hp(2),
  },
  dateText: {
    fontSize: wp(3),
    color: theme.colors.textTertiary,
    fontWeight: "500",
    backgroundColor: theme.colors.card,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
    overflow: "hidden",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: hp(1.2),
  },
  ownMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  avatarColumn: {
    width: wp(8),
    marginRight: wp(2),
    alignItems: "center",
  },
  messageAvatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageAvatarPlaceholder: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "transparent",
  },
  messageAvatarPlaceholderText: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: theme.colors.text,
  },
  messageContainer: {
    maxWidth: wp(70),
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(4),
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: wp(1),
  },
  otherBubble: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: wp(1),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  typingBubble: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.2),
  },
  messageText: {
    fontSize: wp(3.5),
    lineHeight: hp(2.2),
    marginBottom: hp(0.3),
  },
  ownMessageText: {
    color: theme.colors.text,
  },
  otherMessageText: {
    color: theme.colors.text,
  },
  messageTime: {
    fontSize: wp(2.5),
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
  },
  ownMessageTime: {
    color: "rgba(255,255,255,0.6)",
  },
  otherMessageTime: {
    color: theme.colors.textTertiary,
  },
  readReceipt: {
    marginLeft: wp(1),
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(1),
  },
  typingDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: theme.colors.textSecondary,
  },
  typingDot1: {
    opacity: 0.7,
  },
  typingDot2: {
    opacity: 0.5,
  },
  typingDot3: {
    opacity: 0.3,
  },
  inputWrapper: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === "ios" ? 0 : hp(1),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    gap: wp(2),
    backgroundColor: theme.colors.background,
  },
  attachButton: {
    padding: wp(1),
  },
  input: {
    flex: 1,
    fontSize: wp(3.5),
    color: theme.colors.text,
    maxHeight: hp(8),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: theme.colors.card,
    borderRadius: wp(5),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  sendButton: {
    padding: wp(2),
    marginBottom: hp(0.5),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
