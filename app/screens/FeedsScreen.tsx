import { observer } from "mobx-react-lite"
import { FC, useEffect, useState, useRef } from "react"
import {
  Image,
  Modal,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { Button, Header, Screen, Text } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { TextInput } from "react-native-gesture-handler"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { useStores } from "@/models"
import { Picker } from "@react-native-picker/picker"
import { format } from "date-fns"

const babyImage = require("../../assets/images/baby_profile.jpg")

interface FeedsScreenProps extends AppStackScreenProps<"Feeds"> {}

export const FeedsScreen: FC<FeedsScreenProps> = observer(function FeedsScreen(_props) {
  const { navigation, route } = _props
  const babyId = route.params.babyId
  const { childStore } = useStores()
  const [baby, setBaby] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [durationError, setDurationError] = useState("")
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showSubOptions, setShowSubOptions] = useState(false)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  const [formData, setFormData] = useState({
    feedType: "breastfeeding",
    breastfeedingType: "freshlyExpressed", // direct, freshlyExpressed, frozen
    amount: "",
    duration: "0",
    startTime: null,
    endTime: null,
  })

  useEffect(() => {
    childStore.getChildById(parseInt(babyId))
    setBaby(childStore.getChildById(parseInt(babyId)))

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Update subtype options when feed type changes
  useEffect(() => {
    if (formData.feedType === "breastfeeding") {
      setShowSubOptions(true)
    } else {
      setShowSubOptions(false)
    }
  }, [formData.feedType])

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
    if (!isModalVisible) {
      resetForm()
    } else {
      // Stop timer if modal is closing
      if (timerActive) {
        stopTimer()
      }
    }
  }

  const resetForm = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setTimerActive(false)
    setTimerSeconds(0)
    setFormData({
      feedType: "breastfeeding",
      breastfeedingType: "freshlyExpressed",
      amount: "",
      duration: "0",
      startTime: null,
      endTime: null,
    })
  }

  const startTimer = () => {
    if (timerActive) return

    // Record start time
    const now = new Date()
    startTimeRef.current = now

    setFormData((prev) => ({
      ...prev,
      startTime: now,
    }))

    // Start timer interval
    setTimerActive(true)
    setTimerSeconds(0)

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        const newSeconds = prev + 1
        // Update minutes in the form data
        const minutes = Math.floor(newSeconds / 60)
        setFormData((formPrev) => ({
          ...formPrev,
          duration: minutes.toString(),
        }))
        return newSeconds
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (!timerActive) return

    // Stop timer
    clearInterval(timerRef.current)
    timerRef.current = null
    setTimerActive(false)
    console.log("timerSeconds:", timerSeconds)
    const duration = Math.ceil(timerSeconds / 60)
    console.log("Duration in minutes:", duration)
    setFormData((prev) => ({
      ...prev,
      duration: duration.toString(),
    }))

    // // Record end time
    // const endTime = new Date()
    // setFormData((prev) => ({
    //   ...prev,
    //   endTime: endTime,
    // }))
  }

  const formatTimerDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (minutes) => {
    if (!minutes) return "0m"
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`
  }

  const handleSaveFeed = async () => {
    // Ensure timer is stopped
    if (timerActive) {
      stopTimer()
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      // If it's breastfeeding, include the subtype
      feedType:
        formData.feedType === "breastfeeding"
          ? `breastfeeding:${formData.breastfeedingType}`
          : formData.feedType,
    }

    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submissionData),
        },
      )
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Feed Information Submitted Successfully!",
          visibilityTime: 3000,
          autoHide: true,
          position: "top",
        })
        toggleModal()
        // Refresh baby data
        childStore.getChildById(parseInt(babyId))
        setBaby(childStore.getChildById(parseInt(babyId)))
      } else {
        const errorData = await response.json()
        Toast.show({
          type: "error",
          text1: errorData.message || "Invalid info. Please try again",
          position: "top",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      Toast.show({ type: "error", text1: "An unexpected error occurred. Please try again" })
    }
  }

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const getAverageFeedInterval = (feeds) => {
    if (!feeds || feeds.length < 2) return "N/A" // Default value when not enough feeds

    // Step 1: Sort feeds by feedTime in descending order
    const sortedFeeds = [...feeds].sort((a, b) => new Date(b.feedTime) - new Date(a.feedTime))

    // Step 2: Compute intervals in milliseconds
    const intervals = []
    for (let i = 0; i < sortedFeeds.length - 1; i++) {
      const current = new Date(sortedFeeds[i].feedTime)
      const next = new Date(sortedFeeds[i + 1].feedTime)
      intervals.push(Math.abs(current - next))
    }

    // Step 3: Average interval in milliseconds
    const avgMs = intervals.reduce((sum, i) => sum + i, 0) / intervals.length

    // Convert to hours and minutes
    const totalMinutes = Math.floor(avgMs / 1000 / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}h ${minutes}m`
  }

  // Helper to parse feed type for display
  const parseFeedType = (feedTypeString) => {
    if (!feedTypeString) return { main: "Unknown", sub: "" }

    if (feedTypeString.includes(":")) {
      const [main, sub] = feedTypeString.split(":")
      if (main === "breastfeeding") {
        const subLabel =
          sub === "freshlyExpressed" ? "Freshly Expressed" : sub === "frozen" ? "Frozen" : sub
        return { main: "Breast Feed", sub: subLabel }
      }
      return { main, sub }
    }

    return {
      main:
        feedTypeString === "breastfeeding"
          ? "Breast Feed"
          : feedTypeString === "formula"
            ? "Formula Milk"
            : feedTypeString,
      sub: "",
    }
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <Header title="Baby Feeds" leftIcon="back" onLeftPress={() => navigation.goBack()} />

      <View style={$profileContainer}>
        <Image source={babyImage} style={$profileImage} resizeMode="cover" />

        <View style={$profileInfo}>
          <Text style={$nameText}>Baby {baby?.name}</Text>
          <Text style={$ageText}>6 months old</Text>

          <View style={$statsContainer}>
            <View style={$statItem}>
              <Text style={$statValue}>{baby?.feeds?.length || 0}</Text>
              <Text style={$statLabel}>Feeds Today</Text>
            </View>
            <View style={$statItem}>
              <Text style={$statValue}>
                {(
                  (baby?.feeds?.reduce((sum, f) => sum + (f.quantityMl || 0), 0) || 0) / 29.57
                ).toFixed(2)}{" "}
                ml
              </Text>
              <Text style={$statLabel}>Today&apos;s Intake</Text>
            </View>
            <View style={$statItem}>
              <Text style={$statValue}>{getAverageFeedInterval(baby?.feeds)}</Text>
              <Text style={$statLabel}>Avg. Interval</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={$feedHistoryContainer}>
        <Text style={$sectionTitle}>Recent Feeds</Text>

        <ScrollView style={{ flex: 1 }}>
          {baby?.feeds?.map((feed) => {
            const localTime = new Date(feed.feedTime)
            const timeStr = format(localTime, "hh:mm a")
            const dateStr = format(localTime, "d MMMM, yyyy")
            const feedTypeInfo = parseFeedType(feed.feedType)

            return (
              <View key={feed.id} style={$feedItem}>
                <View style={$feedTimeContainer}>
                  <Text style={$feedTime}>{timeStr}</Text>
                  <Text style={$feedDate}>{dateStr}</Text>
                </View>
                <View style={$feedDetailsContainer}>
                  <Text style={$feedType}>{feedTypeInfo.main}</Text>
                  {feedTypeInfo.sub && <Text style={$feedSubType}>{feedTypeInfo.sub}</Text>}
                  <Text style={$feedDuration}>{feed.durationMins} minutes</Text>
                  {feed.quantityMl > 0 && (
                    <Text style={$feedAmount}>{(feed.quantityMl / 29.57).toFixed(2)} ml</Text>
                  )}
                </View>
              </View>
            )
          })}
        </ScrollView>
      </View>

      <Button style={$addFeedButton} onPress={toggleModal}>
        <Text style={$buttonText}>Add New Feed</Text>
      </Button>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={$modalOverlay}>
          <View style={$modalContainer}>
            <Text style={$modalTitle}>Add New Feed</Text>

            {/* Feed Type Selection */}
            <Text style={$inputLabel}>Feed Type:</Text>
            <Picker
              selectedValue={formData.feedType}
              onValueChange={(value) => handleChange("feedType", value)}
              style={$picker}
            >
              <Picker.Item label="Breast Feeding" value="breastfeeding" />
              <Picker.Item label="Formula Milk" value="formula" />
            </Picker>

            {/* Breast Feeding Sub-options */}
            {showSubOptions && (
              <>
                <Text style={$inputLabel}>Breast Feeding Type:</Text>
                <Picker
                  selectedValue={formData.breastfeedingType}
                  onValueChange={(value) => handleChange("breastfeedingType", value)}
                  style={$picker}
                >
                  <Picker.Item label="Freshly Expressed" value="freshlyExpressed" />
                  <Picker.Item label="Frozen" value="frozen" />
                </Picker>
              </>
            )}

            {/* Timer Section */}
            <View style={$timerSection}>
              <Text style={$inputLabel}>Feeding Duration:</Text>

              <View style={$timerDisplay}>
                <Text style={$timerText}>{formatTimerDisplay(timerSeconds)}</Text>
                <Text style={$timerMinutes}>
                  {formatDuration(parseInt(formData.duration || "0"))}
                </Text>
              </View>

              <View style={$timerControls}>
                <TouchableOpacity
                  style={[$timerButton, timerActive ? $timerButtonDisabled : $timerButtonStart]}
                  onPress={startTimer}
                  disabled={timerActive}
                >
                  <Text style={$timerButtonText}>Start Timer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[$timerButton, !timerActive ? $timerButtonDisabled : $timerButtonStop]}
                  onPress={stopTimer}
                  disabled={!timerActive}
                >
                  <Text style={$timerButtonText}>Stop Timer</Text>
                </TouchableOpacity>
              </View>

              <Text style={$inputLabel}>Or enter duration manually (minutes):</Text>
              <TextInput
                style={$input}
                value={formData.duration?.toString()}
                onChangeText={(value) => {
                  if (/^\d*$/.test(value)) {
                    setDurationError("")
                    handleChange("duration", value)
                  } else {
                    setDurationError("Please enter a valid number")
                  }
                }}
                placeholder="Duration (mins)"
                keyboardType="numeric"
              />
              {durationError ? <Text style={$errorText}>{durationError}</Text> : null}
            </View>

            {/* Amount Input - only show for formula or expressed milk */}
            {(formData.feedType === "formula" ||
              (formData.feedType === "breastfeeding" &&
                (formData.breastfeedingType === "frozen"))) && (
              <>
                <Text style={$inputLabel}>Amount (ml):</Text>
                <TextInput
                  style={$input}
                  value={formData.amount?.toString()}
                  onChangeText={(value) => {
                    if (/^\d*$/.test(value)) {
                      setAmountError("")
                      handleChange("amount", value)
                    } else {
                      setAmountError("Please enter a valid number")
                    }
                  }}
                  placeholder="Amount (ml)"
                  keyboardType="numeric"
                />
                {amountError ? <Text style={$errorText}>{amountError}</Text> : null}
              </>
            )}

            {/* Action Buttons */}
            <View style={$buttonContainer}>
              <Button
                disabled={!formData.feedType || !formData.duration || formData.duration === "0"}
                style={[
                  $button,
                  (!formData.feedType || !formData.duration || formData.duration === "0") &&
                    $disabledButton,
                ]}
                onPress={handleSaveFeed}
              >
                <Text style={$buttonText}>Save Feed</Text>
              </Button>
              <Button style={$cancelButton} onPress={toggleModal}>
                <Text style={$buttonText}>Cancel</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

// Style definitions
const $container: ViewStyle = {
  flex: 1,
  padding: 16,
  backgroundColor: "#F8F8F8",
}

const $profileContainer: ViewStyle = {
  marginTop: 20,
  padding: 16,
  backgroundColor: "white",
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
}

const $profileImage: ImageStyle = {
  width: 120,
  height: 120,
  borderRadius: 60,
  alignSelf: "center",
  marginBottom: 16,
  borderWidth: 3,
  borderColor: "#E0E0E0",
}

const $profileInfo: ViewStyle = {
  alignItems: "center",
}

const $nameText: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "#333",
}

const $ageText: TextStyle = {
  fontSize: 16,
  color: "#666",
  marginTop: 4,
}

const $statsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 20,
  width: "100%",
}

const $statItem: ViewStyle = {
  alignItems: "center",
}

const $statValue: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  color: "#007AFF",
}

const $statLabel: TextStyle = {
  fontSize: 12,
  color: "#999",
  marginTop: 4,
}

const $feedHistoryContainer: ViewStyle = {
  marginTop: 24,
  padding: 16,
  backgroundColor: "white",
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  flex: 1,
}

const $sectionTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
  marginBottom: 16,
}

const $feedItem: ViewStyle = {
  flexDirection: "row",
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F0F0",
}

const $feedTimeContainer: ViewStyle = {
  width: 80,
}

const $feedTime: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
}

const $feedDate: TextStyle = {
  fontSize: 12,
  color: "#999",
}

const $feedDetailsContainer: ViewStyle = {
  flex: 1,
  paddingLeft: 12,
}

const $feedType: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
}

const $feedSubType: TextStyle = {
  fontSize: 14,
  fontStyle: "italic",
  color: "#555",
}

const $feedDuration: TextStyle = {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
}

const $feedAmount: TextStyle = {
  fontSize: 14,
  color: "#666",
  marginTop: 2,
}

const $addFeedButton: ViewStyle = {
  marginTop: 24,
  marginBottom: 16,
  backgroundColor: "#10B981",
  borderRadius: 10,
  height: 50,
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
}

const $modalContainer: ViewStyle = {
  width: "90%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  maxHeight: "80%",
}

const $modalTitle: TextStyle = {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 16,
  textAlign: "center",
}

const $inputLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
  marginBottom: 6,
  marginTop: 10,
}

const $input: ViewStyle = {
  width: "100%",
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginBottom: 10,
  backgroundColor: "#FAFAFA",
}

const $picker: ViewStyle = {
  width: "100%",
  backgroundColor: "#FAFAFA",
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
}

const $errorText: TextStyle = {
  color: "red",
  fontSize: 12,
  marginBottom: 8,
}

const $timerSection: ViewStyle = {
  marginTop: 10,
  marginBottom: 10,
  width: "100%",
}

const $timerDisplay: ViewStyle = {
  backgroundColor: "#F0F0F0",
  padding: 16,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 10,
}

const $timerText: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  color: "#333",
  fontFamily: "monospace",
}

const $timerMinutes: TextStyle = {
  fontSize: 14,
  color: "#666",
  marginTop: 4,
}

const $timerControls: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
}

const $timerButton: ViewStyle = {
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  flex: 1,
  marginHorizontal: 5,
  alignItems: "center",
}

const $timerButtonStart: ViewStyle = {
  backgroundColor: "#3B82F6",
}

const $timerButtonStop: ViewStyle = {
  backgroundColor: "#EF4444",
}

const $timerButtonDisabled: ViewStyle = {
  backgroundColor: "#A0A0A0",
}

const $timerButtonText: TextStyle = {
  color: "white",
  fontWeight: "bold",
  fontSize: 16,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 20,
}

const $button: ViewStyle = {
  flex: 1,
  marginRight: 5,
  backgroundColor: "#3B82F6",
}

const $disabledButton: ViewStyle = {
  backgroundColor: "#A0A0A0",
}

const $cancelButton: ViewStyle = {
  flex: 1,
  backgroundColor: "#EF4444",
  marginLeft: 5,
}
