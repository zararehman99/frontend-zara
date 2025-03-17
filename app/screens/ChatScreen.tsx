import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { FlatList, TextInput, TextStyle, View, ViewStyle, KeyboardAvoidingView, Platform } from "react-native"
import { Button, Text, Screen, Icon } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useHeader } from "../utils/useHeader"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface ChatScreenProps extends AppStackScreenProps<"Chat"> {}

export const ChatScreen: FC<ChatScreenProps> = observer(function ChatScreen(_props) {
  const { themed, theme } = useAppTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [messageText, setMessageText] = useState("")

  const { navigation } = _props

  useHeader(
    {
      title: "AI Assistant",
      leftIcon: "back",
      onLeftPress: () => navigation.goBack(),
    },
    [navigation],
  )

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const sendMessage = () => {
    console.log("Sending message:", messageText)
    if (messageText.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setMessageText("")

    // Simulate AI response (in a real app, you would call your AI API here)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm your AI assistant. This is a simulated response. In a real app, this would come from your AI backend.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prevMessages) => [...prevMessages, aiResponse])
    }, 1000)
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      style={[
        themed($messageContainer), 
        item.isUser ? themed($userMessage) : themed($assistantMessage)
      ]}
    >
      <Text style={item.isUser ? themed($userMessageText) : themed($assistantMessageText)}>
        {item.text}
      </Text>
      <Text style={themed($timestampText)}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  )

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={$styles.flex1}
    >
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={$styles.flex1}
          contentContainerStyle={themed($chatListContent)}
          inverted={false}
        />

        <View style={[themed($inputContainer), $bottomContainerInsets]}>
          <TextInput
            style={themed($textInput)}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text}
            multiline
          />
          <Button
            preset="default"
            onPress={sendMessage}
            style={themed($sendButton)}
          >
            <Icon icon="caretRight" /> 
          </Button>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
})

const $chatListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingBottom: spacing.xl,
})

const $messageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxWidth: "80%",
  padding: spacing.sm,
  borderRadius: 16,
  marginBottom: spacing.sm,
})

const $userMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.text,
  alignSelf: "flex-end",
  borderBottomRightRadius: 4,
})

const $assistantMessage: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  alignSelf: "flex-start",
  borderBottomLeftRadius: 4,
})

const $userMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $assistantMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $timestampText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 10,
  color: colors.textDim,
  alignSelf: "flex-end",
  marginTop: spacing.xs,
})

const $inputContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  padding: spacing.sm,
  backgroundColor: colors.background,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
})

const $textInput: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 20,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginRight: spacing.sm,
  color: colors.text,
  maxHeight: 100,
})

const $sendButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 40,
  width: 40,
  borderRadius: 20,
  paddingHorizontal: 0,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.palette.neutral200,
})