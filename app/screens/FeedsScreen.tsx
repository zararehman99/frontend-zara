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
import { getSnapshot } from "mobx-state-tree"

const babyImage = require("../../assets/images/baby_profile.jpg")

interface FeedsScreenProps extends AppStackScreenProps<"Feeds"> {}

export const FeedsScreen: FC<FeedsScreenProps> = observer(function FeedsScreen(_props) {
  const { navigation, route } = _props
  const babyId = route.params.babyId
  const {
    childStore,
    inventoryStore,
    authenticationStore: { userId },
  } = useStores()
  const [baby, setBaby] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [durationError, setDurationError] = useState("")
  const [leftTimerActive, setLeftTimerActive] = useState(false)
  const [rightTimerActive, setRightTimerActive] = useState(false)
  const [leftTimerSeconds, setLeftTimerSeconds] = useState(0)
  const [rightTimerSeconds, setRightTimerSeconds] = useState(0)
  const [availablebreastMilkBottles, setAvailablebreastMilkBottles] = useState(0)
  const [availableformulaMilkBottles, setAvailableformulaMilkBottles] = useState(0)
  const [breastMilkId, setBreastMilkId] = useState(0)
  const [formulaMilkId, setFormulaMilkId] = useState(0)
  const leftTimerRef = useRef(null)
  const rightTimerRef = useRef(null)
  const startTimeRef = useRef(null)

  const [formData, setFormData] = useState({
    feedType: "breastfeeding", // breastfeeding or bottle
    bottleType: "formula", // formula or breastmilk
    leftDuration: "0",
    rightDuration: "0",
    amount: "",
    startTime: null,
    endTime: null,
    duration: "",
  })

  useEffect(() => {
    childStore.getChildById(parseInt(babyId))
    setBaby(childStore.getChildById(parseInt(babyId)))

    return () => {
      if (leftTimerRef.current) {
        clearInterval(leftTimerRef.current)
      }
      if (rightTimerRef.current) {
        clearInterval(rightTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadInventoryItems()
    }
  }, [userId])

  const loadInventoryItems = async () => {
    try {
      await inventoryStore.fetchInventory(userId)
      const breastMilkBottles = inventoryStore.inventoryForList
        .filter(
          (item) => item.item === "Milk" && item.quantity > 0 && item.category === "Breast Milk",
        )
        .map((item) => getSnapshot(item))

      console.log("breastMilkBottles available:", breastMilkBottles[0]?.quantity)
      setAvailablebreastMilkBottles(breastMilkBottles[0]?.quantity)
      setBreastMilkId(breastMilkBottles[0]?.id)
      const formulaMilkBottles = inventoryStore.inventoryForList
        .filter(
          (item) => item.item === "Milk" && item.quantity > 0 && item.category === "Formula Milk",
        )
        .map((item) => getSnapshot(item))

      console.log("formulaMilkBottles available:", formulaMilkBottles[0]?.quantity)
      setAvailableformulaMilkBottles(formulaMilkBottles[0]?.quantity)
      setFormulaMilkId(formulaMilkBottles[0]?.id)
    } catch (error) {
      console.error("Error loading inventory:", error)
    }
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
    if (!isModalVisible) {
      resetForm()
    } else {
      // Stop timers if modal is closing
      if (leftTimerActive) {
        stopLeftTimer()
      }
      if (rightTimerActive) {
        stopRightTimer()
      }
    }
  }

  const resetForm = () => {
    if (leftTimerRef.current) {
      clearInterval(leftTimerRef.current)
      leftTimerRef.current = null
    }
    if (rightTimerRef.current) {
      clearInterval(rightTimerRef.current)
      rightTimerRef.current = null
    }

    setLeftTimerActive(false)
    setRightTimerActive(false)
    setLeftTimerSeconds(0)
    setRightTimerSeconds(0)
    setFormData({
      feedType: "breastfeeding",
      bottleType: "formula",
      leftDuration: "0",
      rightDuration: "0",
      amount: "",
      startTime: null,
      endTime: null,
    })
  }

  const startLeftTimer = () => {
    if (leftTimerActive) return

    // Record start time if not already set
    if (!startTimeRef.current) {
      const now = new Date()
      startTimeRef.current = now
      setFormData((prev) => ({
        ...prev,
        startTime: now,
      }))
    }

    // Stop right timer if running
    if (rightTimerActive) {
      stopRightTimer()
    }

    // Start left timer interval
    setLeftTimerActive(true)
    leftTimerRef.current = setInterval(() => {
      setLeftTimerSeconds((prev) => {
        const newSeconds = prev + 1
        // Update minutes in the form data
        const minutes = Math.floor(newSeconds / 60)
        setFormData((formPrev) => ({
          ...formPrev,
          leftDuration: minutes.toString(),
        }))
        return newSeconds
      })
    }, 1000)
  }

  const stopLeftTimer = () => {
    if (!leftTimerActive) return

    // Stop timer
    clearInterval(leftTimerRef.current)
    leftTimerRef.current = null
    setLeftTimerActive(false)

    const duration = Math.ceil(leftTimerSeconds / 60)
    setFormData((prev) => ({
      ...prev,
      leftDuration: duration.toString(),
    }))
  }

  const startRightTimer = () => {
    if (rightTimerActive) return

    // Record start time if not already set
    if (!startTimeRef.current) {
      const now = new Date()
      startTimeRef.current = now
      setFormData((prev) => ({
        ...prev,
        startTime: now,
      }))
    }

    // Stop left timer if running
    if (leftTimerActive) {
      stopLeftTimer()
    }

    // Start right timer interval
    setRightTimerActive(true)
    rightTimerRef.current = setInterval(() => {
      setRightTimerSeconds((prev) => {
        const newSeconds = prev + 1
        // Update minutes in the form data
        const minutes = Math.floor(newSeconds / 60)
        setFormData((formPrev) => ({
          ...formPrev,
          rightDuration: minutes.toString(),
        }))
        return newSeconds
      })
    }, 1000)
  }

  const stopRightTimer = () => {
    if (!rightTimerActive) return

    // Stop timer
    clearInterval(rightTimerRef.current)
    rightTimerRef.current = null
    setRightTimerActive(false)

    const duration = Math.ceil(rightTimerSeconds / 60)
    setFormData((prev) => ({
      ...prev,
      rightDuration: duration.toString(),
    }))
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

  const getTotalDuration = () => {
    const leftDuration = parseInt(formData.leftDuration || "0")
    const rightDuration = parseInt(formData.rightDuration || "0")
    return leftDuration + rightDuration
  }

  const handleSaveFeed = async () => {
    // Ensure timers are stopped
    if (leftTimerActive) {
      stopLeftTimer()
    }
    if (rightTimerActive) {
      stopRightTimer()
    }

    // Set end time if not already set
    if (!formData.endTime) {
      setFormData((prev) => ({
        ...prev,
        endTime: new Date(),
      }))
    }

    // Validate based on feed type
    if (formData.feedType === "bottle" && !formData.amount) {
      setAmountError("Please enter the amount for bottle feeding")
      return
    }

    if (formData.feedType === "breastfeeding" && getTotalDuration() === 0) {
      setDurationError("Please track or enter duration for at least one breast")
      return
    }

    const feedAmount = Number(formData?.amount)
    const selectedCategory = formData.bottleType === "formula" ? "Formula Milk" : "Breast Milk"
    let newAmount = 0
    let itemId = 0
    if (selectedCategory === "Formula Milk") {
      newAmount = availableformulaMilkBottles - feedAmount
      itemId = formulaMilkId
    } else {
      newAmount = availablebreastMilkBottles - feedAmount 
      itemId = breastMilkId
    }
    console.log("newAmount:", newAmount)
    if (
      formData.feedType === "bottle" &&
      formData.bottleType === "formula" &&
      availableformulaMilkBottles < feedAmount
    ) {
      setAmountError(
        `Not enough formula milk. You need ${feedAmount} mL, but only ${availableformulaMilkBottles} mL available.`,
      )
      return
    }

    if (
      formData.feedType === "bottle" &&
      formData.bottleType === "breastmilk" &&
      availablebreastMilkBottles < feedAmount
    ) {
      setAmountError(
        `Not enough breast milk. You need ${feedAmount} mL, but only ${availablebreastMilkBottles} mL available.`,
      )
      return
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      // Format feed type for backend
      feedType: formData.feedType === "bottle" ? `bottle:${formData.bottleType}` : "breastfeeding",
      // Total duration is sum of left and right
      duration: formData.feedType === "bottle" ? formData.duration : getTotalDuration().toString(),
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

        const item = {
          name: "Milk",
          quantity: newAmount,
          category: selectedCategory,
        }
          await inventoryStore.updateItem(itemId, item)
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
      if (main === "bottle") {
        return { main: "Bottle", sub: sub === "formula" ? "Formula Milk" : "Breast Milk" }
      }
      return { main, sub }
    }

    return {
      main: feedTypeString === "breastfeeding" ? "Breast Feed" : feedTypeString,
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
                    <Text style={$feedAmount}>{feed.quantityMl.toFixed(2)} ml</Text>
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
              <Picker.Item label="Bottle" value="bottle" />
            </Picker>

            {/* Bottle Type Sub-options */}
            {formData.feedType === "bottle" && (
              <>
                <Text style={$inputLabel}>Bottle Content:</Text>
                <Picker
                  selectedValue={formData.bottleType}
                  onValueChange={(value) => handleChange("bottleType", value)}
                  style={$picker}
                >
                  <Picker.Item label="Formula Milk" value="formula" />
                  <Picker.Item label="Breast Milk" value="breastmilk" />
                </Picker>
              </>
            )}

            {/* Timer Section - Only for breastfeeding */}
            {formData.feedType === "breastfeeding" && (
              <View style={$timerSection}>
                <Text style={$inputLabel}>Breast Feeding Timer:</Text>

                {/* Breast Timer Controls */}
                <View style={$breastTimersContainer}>
                  {/* Left Breast Timer */}
                  <View style={$breastTimerCard}>
                    <View style={$timerHeader}>
                      <Text style={$breastLabel}>Left Breast</Text>
                      <Text style={$timerText}>{formatTimerDisplay(leftTimerSeconds)}</Text>
                    </View>

                    <View style={$iconButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          $iconButton,
                          leftTimerActive ? $timerButtonActive : $timerButtonInactive,
                        ]}
                        onPress={leftTimerActive ? stopLeftTimer : startLeftTimer}
                      >
                        <Text style={$iconButtonText}>L</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={$durationInput}
                        value={formData.leftDuration?.toString()}
                        onChangeText={(value) => {
                          if (/^\d*$/.test(value)) {
                            setDurationError("")
                            handleChange("leftDuration", value)
                          } else {
                            setDurationError("Please enter a valid number")
                          }
                        }}
                        placeholder="mins"
                        keyboardType="numeric"
                      />
                      <Text style={$durationLabel}>min</Text>
                    </View>
                  </View>

                  {/* Right Breast Timer */}
                  <View style={$breastTimerCard}>
                    <View style={$timerHeader}>
                      <Text style={$breastLabel}>Right Breast</Text>
                      <Text style={$timerText}>{formatTimerDisplay(rightTimerSeconds)}</Text>
                    </View>

                    <View style={$iconButtonsContainer}>
                      <TouchableOpacity
                        style={[
                          $iconButton,
                          rightTimerActive ? $timerButtonActive : $timerButtonInactive,
                        ]}
                        onPress={rightTimerActive ? stopRightTimer : startRightTimer}
                      >
                        <Text style={$iconButtonText}>R</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={$durationInput}
                        value={formData.rightDuration?.toString()}
                        onChangeText={(value) => {
                          if (/^\d*$/.test(value)) {
                            setDurationError("")
                            handleChange("rightDuration", value)
                          } else {
                            setDurationError("Please enter a valid number")
                          }
                        }}
                        placeholder="mins"
                        keyboardType="numeric"
                      />
                      <Text style={$durationLabel}>min</Text>
                    </View>
                  </View>
                </View>

                {durationError ? <Text style={$errorText}>{durationError}</Text> : null}

                <View style={$totalDurationContainer}>
                  <Text style={$totalDurationLabel}>Total Feeding Time:</Text>
                  <Text style={$totalDurationValue}>{formatDuration(getTotalDuration())}</Text>
                </View>
              </View>
            )}

            {/* Amount Input - only show for bottle feeding */}
            {formData.feedType === "bottle" && (
              <>
                <Text style={$inputLabel}>Duration:</Text>
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
                disabled={
                  (formData.feedType === "breastfeeding" && getTotalDuration() === 0) ||
                  (formData.feedType === "bottle" && (!formData.amount || !formData.duration))
                }
                style={[
                  $button,
                  ((formData.feedType === "breastfeeding" && getTotalDuration() === 0) ||
                    (formData.feedType === "bottle" && (!formData.amount || !formData.duration))) &&
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

// New styles for simplified breast timer UI
const $breastTimersContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
}

const $breastTimerCard: ViewStyle = {
  width: "48%", // Nearly half width to fit side by side
  backgroundColor: "#F0F7FF",
  borderRadius: 8,
  padding: 12,
  borderWidth: 1,
  borderColor: "#D1E3FF",
}

const $timerHeader: ViewStyle = {
  alignItems: "center",
  marginBottom: 8,
}

const $breastLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
  marginBottom: 4,
}

const $iconButtonsContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $iconButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 8,
}

const $timerButtonActive: ViewStyle = {
  backgroundColor: "#EF4444", // Red when active
}

const $timerButtonInactive: ViewStyle = {
  backgroundColor: "#3B82F6", // Blue when inactive
}

const $iconButtonText: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  color: "white",
}

const $durationInput: ViewStyle = {
  width: 50,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 4,
  padding: 4,
  backgroundColor: "white",
}

const $durationLabel: TextStyle = {
  fontSize: 12,
  color: "#666",
  marginLeft: 4,
}

const $timerText: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  color: "#333",
  fontFamily: "monospace",
}

const $totalDurationContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: "#E6F7FF",
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
  marginBottom: 12,
}

const $totalDurationLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: "#0056B3",
}

const $totalDurationValue: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "#0056B3",
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
