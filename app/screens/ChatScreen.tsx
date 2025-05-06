import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import {
  FlatList,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Button, Text, Screen, Icon } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useHeader } from "../utils/useHeader"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import configDev from "@/config/config.dev"
import { useStores } from "@/models"
import { getSnapshot } from "mobx-state-tree"

export interface Message {
  type: "user" | "assistant" | "thinking"
  content: string
  timestamp?: Date
}

interface ChatScreenProps extends AppStackScreenProps<"Chat"> {}

export const ChatScreen: FC<ChatScreenProps> = observer(function ChatScreen(_props) {
  const { themed, theme } = useAppTheme()
  const {
    authenticationStore: { userId },
    childStore,
  } = useStores()
  const [threadId, setThreadId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      // id: "1",
      content: "Hello! How can I assist you today?",
      type: "assistant",
      timestamp: new Date(),
    },
  ])
  const [babiesData, setBabiesData] = useState([])
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

  const getAssistant = async () => {
    try {
      setIsLoading(true)
      const headers = {
        "Content-Type": "application/json",
      }

      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/langgraph/assistants/${configDev.VITE_LATCH_URL}`,
        {
          method: "GET",
          headers,
        },
      )

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      // console.log("response", data);
    } catch (error) {
      console.error("Error fetching assistant:", error)
    }
  }

  const createThread = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      }

      const thread_id = crypto.randomUUID()
      const obj = {
        thread_id: thread_id,
        if_exists: "raise",
      }

      const response = await fetch(`${configDev.VITE_LATCH_BACKEND_URL}/api/langgraph/threads`, {
        method: "POST",
        headers,
        body: JSON.stringify(obj),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setThreadId(data.thread_id)
      // console.log("response", data);
      return data.thread_id
    } catch (error) {
      console.error("Error creating thread:", error)
    }
  }

  const fetchBabyData = async () => {
    try {
      await childStore.fetchChildren(userId)
      const snapshot = getSnapshot(childStore.childrenForList)
      setBabiesData(snapshot)
      setIsLoading(false)
    } catch (error) {
      console.log("error", error)
    }
  }

  useEffect(() => {
    getAssistant()
    createThread()
    fetchBabyData()
  }, [])

  const streamRun = async (threadId: string, options: any) => {
    const headers = {
      "Content-Type": "application/json",
    }

    const response = await fetch(
      `${configDev.VITE_LATCH_BACKEND_URL}/api/langgraph/threads/${threadId}/runs/stream`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(options),
      },
    )

    if (!response.body) {
      throw new Error("Readable stream not supported or response body is null")
    }

    return new ReadableStream({
      start: (controller) => {
        console.log("Stream started")
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        let isFirstChunk = true // Flag to track if it's the first chunk

        const push = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log("Stream closed")
              controller.close()
              // Remove thinking indicator when stream is done
              setIsThinking(false)
              return
            }

            const chunk = decoder.decode(value, { stream: true })
            const parts = chunk.split("event:").filter((part) => part.trim())

            parts.forEach((part) => {
              try {
                const jsonPart = part.trim()
                if (jsonPart.includes("messages/metadata")) {
                  console.log("Skipping metadata part")
                  return
                }

                const jsonParts = jsonPart.split("messages/partial").filter((part) => part.trim())
                jsonParts.forEach((part) => {
                  const cleanedString = part.split("data:").filter((parts) => parts.trim())
                  cleanedString.forEach((part) => {
                    const jsonObject = JSON.parse(part)

                    const lastAiMessage = jsonObject[0]
                    const contentToStream = lastAiMessage.content

                    if (isFirstChunk) {
                      // Initialize the first message and remove the thinking indicator
                      const assistantMessage: Message = {
                        type: "assistant",
                        content: contentToStream, // Set the content
                        timestamp: new Date(),
                      }

                      setMessages((prev) => {
                        // Filter out the thinking message and add the assistant message
                        const filteredMessages = prev.filter((msg) => msg.type !== "thinking")
                        return [...filteredMessages, assistantMessage]
                      })

                      isFirstChunk = false
                    } else {
                      const updatedContentToStream = contentToStream
                      // Replace the content of the last message with the latest chunk
                      setMessages((prev) => {
                        const updatedMessages = [...prev]
                        const lastMessageIndex = updatedMessages.length - 1
                        const lastMessage = updatedMessages[lastMessageIndex]
                        updatedMessages[lastMessageIndex] = {
                          ...lastMessage,
                          content: updatedContentToStream, // Replace the content of the last message
                        }
                        return updatedMessages
                      })
                    }
                    // console.log("Streaming content:", contentToStream);
                  })
                })
              } catch (error) {
                console.error("Failed to parse chunk part as JSON:", error)
              }
            })

            push()
          })
        }

        push()
      },
    })
  }

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const sendMessage = async () => {
    if (messageText.trim() === "") return

    // Add user message
    const userMessage: Message = {
      content: messageText,
      type: "user",
      timestamp: new Date(),
    }

    // Add the message to the chat
    setMessages((prevMessages) => [...prevMessages, userMessage])

    // Add thinking indicator
    setIsThinking(true)
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "thinking", content: "Thinking...", timestamp: new Date() },
    ])

    const inputText = messageText
    setMessageText("")

    const input = {
      messages: [
        {
          role: "user",
          content: inputText,
        },
      ],
      baby_profiles: babiesData,
    }
    const stream = {
      assistant_id: configDev.VITE_LATCH_URL,
      input: input,
      stream_mode: ["messages"],
    }

    await streamRun(threadId, stream)
  }

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "thinking") {
      return (
        <View style={[themed($messageContainer), themed($assistantMessage)]}>
          <View style={themed($thinkingContainer)}>
            <ActivityIndicator size="small" color={theme.colors.text} />
            <Text style={themed($assistantMessageText)}>Thinking...</Text>
          </View>
        </View>
      )
    }

    return (
      <View
        style={[
          themed($messageContainer),
          item.type === "user" ? themed($userMessage) : themed($assistantMessage),
        ]}
      >
        <Text
          style={item.type === "user" ? themed($userMessageText) : themed($assistantMessageText)}
        >
          {item.content}
        </Text>
        <Text style={themed($timestampText)}>
          {item?.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={$styles.flex1}
    >
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          // keyExtractor={(item) => item.id}
          style={$styles.flex1}
          contentContainerStyle={themed($chatListContent)}
          inverted={false}
        />

        {isLoading ? (
          <View
            style={[
              $inputContainer,
              { justifyContent: "center", alignItems: "center", marginBottom: 20 },
            ]}
          >
            <Text>Loading assistant...</Text>
          </View>
        ) : (
          <View style={[themed($inputContainer), $bottomContainerInsets]}>
            <TextInput
              style={themed($textInput)}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.text}
              multiline
              editable={!isThinking}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
                  sendMessage()
                }
              }}
            />
            <Button
              preset="default"
              onPress={sendMessage}
              style={themed($sendButton)}
              disabled={isThinking || messageText.trim() === ""}
            >
                <Icon icon="caretRight" />
            </Button>
          </View>
        )}
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

const $thinkingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
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
