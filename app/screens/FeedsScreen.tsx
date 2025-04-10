import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { Image, Modal, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Header, Screen, Text } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { TextInput } from "react-native-gesture-handler"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { useStores } from "@/models"
import { Picker } from "@react-native-picker/picker"
import { format } from "date-fns"

const babyImage = require("../../assets/images/baby_profile.jpg") // Replace with your actual baby image path

interface FeedsScreenProps extends AppStackScreenProps<"Feeds"> {}

export const FeedsScreen: FC<FeedsScreenProps> = observer(function FeedsScreen(_props) {
  const { navigation, route } = _props
  const babyId = route.params.babyId
  const { childStore } = useStores()
  const [baby, setBaby] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [amountError, setAmountError] = useState("")
  const [durationError, setDurationError] = useState("")
  const [formData, setFormData] = useState({
    feedType: "",
    amount: "",
    duration: "",
  })

  useEffect(() => {
    childStore.getChildById(parseInt(babyId))
    setBaby(childStore.getChildById(parseInt(babyId)))
  }, [])

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const handleSaveFeed = async () => {
    console.log("formData", formData)
    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      )
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Baby Information Submitted Successfully!",
          visibilityTime: 3000,
          autoHide: true,
          position: "top",
        })
        toggleModal()
      } else {
        const errorData = await response.json()
        Toast.show({
          type: "error",
          text1: errorData.message || "invalid info. Please try again",
          position: "top",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      Toast.show({ type: "error", text1: "An unexpected error occurred. Pleas try again" })
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
              <Text style={$statValue}>{baby?.feeds.length}</Text>
              <Text style={$statLabel}>Feeds Today</Text>
            </View>
            <View style={$statItem}>
              <Text style={$statValue}>
                {(baby?.feeds.reduce((sum, f) => sum + f.quantityMl, 0) / 29.57).toFixed(2)} oz
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

      {/* Rest of the component remains the same */}
      <View style={$feedHistoryContainer}>
        <Text style={$sectionTitle}>Recent Feeds</Text>

        {baby?.feeds.map((feed) => {
          const localTime = new Date(feed.feedTime)
          const timeStr = format(localTime, "hh:mm a")
          const dateStr = format(localTime, "d MMMM, yyyy")

          return (
            <View key={feed.id} style={$feedItem}>
              <View style={$feedTimeContainer}>
                <Text style={$feedTime}>{timeStr}</Text>
                <Text style={$feedDate}>{dateStr}</Text>
              </View>
              <View style={$feedDetailsContainer}>
                <Text style={$feedType}>
                  {feed.feedType === "breastfeeding" ? "Breast Feed" : "Bottle Feed"}
                </Text>
                <Text style={$feedDuration}>{feed.durationMins} minutes</Text>
                <Text style={$feedAmount}>{(feed.quantityMl / 29.57).toFixed(2)} oz</Text>
              </View>
            </View>
          )
        })}
      </View>

      <Button style={$addFeedButton} onPress={toggleModal}>
        <Text style={$buttonText}>Add New Feed</Text>
      </Button>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={$modalOverlay}>
          <View style={$modalCotainer}>
            <Text style={$modalTitle}>Add New Feed</Text>
            {/* <TextInput
              style={$input}
              value={formData.feedType}
              onChangeText={(value) => handleChange("feedType", value)}
              placeholder="Feed Type (Breast/Bottle)"
            /> */}
            <Picker
              selectedValue={formData.feedType}
              onValueChange={(value) => handleChange("feedType", value)}
              style={$input}
            >
              <Picker.Item label="Breastfeeding" value="breastfeeding" />
              <Picker.Item label="Bottle" value="bottle" />
            </Picker>
            <TextInput
              style={$input}
              value={formData.amount?.toString()}
              onChangeText={(value) => {
                if (/^\d*$/.test(value)) {
                  // Only allow digits
                  setAmountError("") // Clear error if valid
                  handleChange("amount", value === "" ? "" : Number(value))
                } else {
                  setAmountError("Please enter a valid number")
                }
              }}
              placeholder="Amount (oz)"
              keyboardType="numeric"
            />
            {amountError ? <Text style={{ color: "red" }}>{amountError}</Text> : null}
            <TextInput
              style={$input}
              value={formData.duration?.toString()}
              onChangeText={(value) => {
                if (/^\d*$/.test(value)) {
                  // Only allow digits
                  setDurationError("") // Clear error if valid
                  handleChange("duration", value === "" ? "" : Number(value))
                } else {
                  setDurationError("Please enter a valid number")
                }
              }}
              placeholder="Duration (mins)"
              keyboardType="numeric"
            />
            {durationError ? <Text style={{ color: "red" }}>{durationError}</Text> : null}
            <View style={$buttonContainer}>
              <Button
                disabled={!formData.feedType || !formData.amount || !formData.duration}
                style={[
                  $button,
                  (!formData.feedType || !formData.amount || !formData.duration) && $disabledButton,
                ]}
                onPress={handleSaveFeed}
              >
                <Text style={$buttonText}>Save Feed</Text>
              </Button>
              <Button style={$cancelButton} onPress={toggleModal}>
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
}

const $modalCotainer: ViewStyle = {
  width: "80%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
}

const $modalTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
}

const $input: ViewStyle = {
  width: "100%",
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginBottom: 10,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 10,
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
  backgroundColor: "red",
  marginLeft: 5,
}

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

// Changed from ViewStyle to ImageStyle for the profile image
const $profileImage: ImageStyle = {
  width: 120,
  height: 120,
  borderRadius: 60,
  alignSelf: "center",
  marginBottom: 16,
  borderWidth: 3,
  borderColor: "#E0E0E0",
}

// Rest of the style definitions remain the same
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
  color: "#333",
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
  backgroundColor: "#10B981", // Green color for add action
  borderRadius: 10,
  height: 50,
}

const $buttonText: TextStyle = {
  color: "#FFFFFF", // Set text color for button text (white)
  fontSize: 16, // Set font size (optional)
  fontWeight: "bold", // Set font weight (optional)
}
