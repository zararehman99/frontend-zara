import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { Modal, View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { TextInput } from "react-native-gesture-handler"

interface PumpScreenProps extends AppStackScreenProps<"Pump"> {}

export const PumpScreen: FC<PumpScreenProps> = observer(function PumpScreen(_props) {
  const { navigation } = _props

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  const [sessionModalVisible, setSessionModalVisible] = useState(false)
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false)
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false)

  function goBack() {
    navigation.goBack()
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$screenContainer}>
      <Header title="Pump Tracking" leftIcon="back" onLeftPress={goBack} />

      <ScrollView style={$scrollContainer}>
        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Today&apos;s Sessions</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Last Session</Text>
            <Text style={$cardText}>Time: 9:45 AM</Text>
            <Text style={$cardText}>Duration: 18 minutes</Text>
            <Text style={$cardText}>Volume: 4 oz (120 ml)</Text>
            <Button
              style={$primaryButton}
              textStyle={$buttonText}
              onPress={() => setSessionModalVisible(true)}
            >
              Start New Session
            </Button>
          </View>
        </View>

        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Inventory</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Stored Milk</Text>
            <Text style={$cardText}>Refrigerated: 12 oz (355 ml)</Text>
            <Text style={$cardText}>Frozen: 28 oz (830 ml)</Text>
            <Text style={$cardText}>Oldest batch: 3 days ago</Text>
            <Button
              style={$secondaryButton}
              textStyle={$buttonText}
              onPress={() => setInventoryModalVisible(true)}
            >
              Update Inventory
            </Button>
          </View>
        </View>

        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Stats</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Weekly Summary</Text>
            <Text style={$cardText}>Total sessions: 18</Text>
            <Text style={$cardText}>Average duration: 22 minutes</Text>
            <Text style={$cardText}>Total volume: 52 oz (1540 ml)</Text>
            <Button
              style={$secondaryButton}
              textStyle={$buttonText}
              onPress={() => setStatisticsModalVisible(true)}
            >
              View Full Statistics
            </Button>
          </View>
        </View>
      </ScrollView>

      <View style={[$bottomButtonContainer, $bottomContainerInsets]}>
        <Button style={$bottomButton} textStyle={$buttonText} onPress={goBack}>
          Back to Home
        </Button>
      </View>

      <Modal visible={sessionModalVisible} transparent={true} animationType="fade">
        <View style={$modalOverlay}>
          <View style={$modalContainer}>
            <Text style={$modalTitle}>Start New Session</Text>
            <TextInput style={$input} placeholder="Enter session duration (e.g., 3h 24m)" />
            <TextInput style={$input} placeholder="Enter session volume (e.g., 4 oz)" />
            <View style={$buttonContainer}>
              <Button
                style={$button}
                textStyle={$buttonText}
                onPress={() => setSessionModalVisible(false)}
              >
                Save
              </Button>
              <Button
                style={$cancelButton}
                textStyle={$buttonText}
                onPress={() => setSessionModalVisible(false)}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={inventoryModalVisible} transparent={true} animationType="fade">
        <View style={$modalOverlay}>
          <View style={$modalContainer}>
            <Text style={$modalTitle}>Update Inventory</Text>
            <TextInput style={$input} placeholder="Enter amount of milk to add (e.g., 4 oz)" />
            <TextInput style={$input} placeholder="Enter type of milk (e.g., Frozen)" />
            <View style={$buttonContainer}>
              <Button
                style={$button}
                textStyle={$buttonText}
                onPress={() => setInventoryModalVisible(false)}
              >
                Save
              </Button>
              <Button
                style={$cancelButton}
                textStyle={$buttonText}
                onPress={() => setInventoryModalVisible(false)}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={statisticsModalVisible} transparent={true} animationType="fade">
        <View style={$modalOverlay}>
          <View style={$modalContainer}>
            <Text style={$modalTitle}>View Full Statistics</Text>
            <Text style={$cardText}>Total sessions: 18</Text>
            <Text style={$cardText}>Average duration: 22 minutes</Text>
            <Text style={$cardText}>Total volume: 52 oz (1540 ml)</Text>
            <Button
              style={$button}
              textStyle={$buttonText}
              onPress={() => setStatisticsModalVisible(false)}
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </Screen>
  )
})

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
}

const $modalContainer: ViewStyle = {
  width: "80%",
  backgroundColor: "white",
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
  backgroundColor: "#007AFF",
  flex: 1,
  marginHorizontal: 5,
}

const $cancelButton: ViewStyle = {
  flex: 1,
  backgroundColor: "red",
  marginLeft: 5,
}

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: "#F8F9FA",
}

const $scrollContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: 16,
}

const $sectionContainer: ViewStyle = {
  marginTop: 20,
  marginBottom: 10,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
  color: "#333",
}

const $card: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  marginBottom: 16,
}

const $cardTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 12,
  color: "#333",
}

const $cardText: TextStyle = {
  fontSize: 16,
  color: "#555",
  marginBottom: 8,
  lineHeight: 22,
}

const $primaryButton: ViewStyle = {
  backgroundColor: "#FF9500",
  borderRadius: 8,
  marginTop: 12,
  height: 40,
}

const $secondaryButton: ViewStyle = {
  backgroundColor: "#5856D6",
  borderRadius: 8,
  marginTop: 12,
  height: 40,
}

const $bottomButtonContainer: ViewStyle = {
  padding: 16,
  backgroundColor: "#F8F9FA",
}

const $bottomButton: ViewStyle = {
  backgroundColor: "#101519",
  borderRadius: 10,
  height: 50,
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}
