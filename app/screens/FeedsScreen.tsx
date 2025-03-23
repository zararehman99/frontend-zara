import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { Image, Modal, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Header, Screen, Text } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { TextInput } from "react-native-gesture-handler"

const babyImage = require("../../assets/images/baby_profile.jpg") // Replace with your actual baby image path

interface FeedsScreenProps extends AppStackScreenProps<"Feeds"> {}

export const FeedsScreen: FC<FeedsScreenProps> = observer(function FeedsScreen(_props) {
  const { navigation } = _props

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [feedType, setFeedType] = useState("")
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  const handleSaveFeed = () => {
    console.log({ feedType, amount, duration })
    toggleModal()
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <Header title="Baby Feeds" leftIcon="back" onLeftPress={() => navigation.goBack()} />

      <View style={$profileContainer}>
        <Image source={babyImage} style={$profileImage} resizeMode="cover" />

        <View style={$profileInfo}>
          <Text style={$nameText}>Baby Noah</Text>
          <Text style={$ageText}>6 months old</Text>

          <View style={$statsContainer}>
            <View style={$statItem}>
              <Text style={$statValue}>8</Text>
              <Text style={$statLabel}>Feeds Today</Text>
            </View>
            <View style={$statItem}>
              <Text style={$statValue}>24 oz</Text>
              <Text style={$statLabel}>Today&apos;s Intake</Text>
            </View>
            <View style={$statItem}>
              <Text style={$statValue}>3h 20m</Text>
              <Text style={$statLabel}>Avg. Interval</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Rest of the component remains the same */}
      <View style={$feedHistoryContainer}>
        <Text style={$sectionTitle}>Recent Feeds</Text>

        <View style={$feedItem}>
          <View style={$feedTimeContainer}>
            <Text style={$feedTime}>8:30 AM</Text>
            <Text style={$feedDate}>Today</Text>
          </View>
          <View style={$feedDetailsContainer}>
            <Text style={$feedType}>Breast Feed</Text>
            <Text style={$feedDuration}>18 minutes</Text>
          </View>
        </View>

        <View style={$feedItem}>
          <View style={$feedTimeContainer}>
            <Text style={$feedTime}>5:45 AM</Text>
            <Text style={$feedDate}>Today</Text>
          </View>
          <View style={$feedDetailsContainer}>
            <Text style={$feedType}>Bottle Feed</Text>
            <Text style={$feedAmount}>4 oz formula</Text>
          </View>
        </View>

        <View style={$feedItem}>
          <View style={$feedTimeContainer}>
            <Text style={$feedTime}>11:30 PM</Text>
            <Text style={$feedDate}>Yesterday</Text>
          </View>
          <View style={$feedDetailsContainer}>
            <Text style={$feedType}>Breast Feed</Text>
            <Text style={$feedDuration}>15 minutes</Text>
          </View>
        </View>
      </View>

      <Button style={$addFeedButton} onPress={toggleModal}>
        Add New Feed
      </Button>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={$modalOverlay}>
          <View style={$modalCotainer}>
            <Text style={$modalTitle}>Add New Feed</Text>
            <TextInput
              style={$input}
              value={feedType}
              onChangeText={setFeedType}
              placeholder="Feed Type (Breast/Bottle)"
            />
            <TextInput
              style={$input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount (oz)"
              keyboardType="numeric"
            />
            <TextInput
              style={$input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Duration (mins)"
              keyboardType="numeric"
            />
            <View style={$buttonContainer}>
              <Button style={$button} onPress={handleSaveFeed}>
                Save Feed
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
  backgroundColor: "#4CD964", // Green color for add action
  borderRadius: 10,
  height: 50,
}
