import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import { Modal, View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"

import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

import { TextInput } from "react-native-gesture-handler"

interface BabyHealthSleepScreenProps extends AppStackScreenProps<"BabyHealthSleep"> {}

export const BabyHealthSleepScreen: FC<BabyHealthSleepScreenProps> = observer(
  function BabyHealthSleepScreen(_props) {
    const { navigation } = _props
    const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

    const [sleepModalVisible, setSleepModalVisible] = useState(false)
    const [entryModalVisible, setEntryModalVisible] = useState(false)
    const [tipsModalVisible, setTipsModalVisible] = useState(false)

    function goBack() {
      navigation.goBack()
    }

    return (
      <Screen preset="scroll" contentContainerStyle={$screenContainer}>
        <Header title="Baby Health & Sleep" leftIcon="back" onLeftPress={goBack} />

        <ScrollView style={$scrollContainer}>
          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Sleep Tracker</Text>
            <View style={$card}>
              <Text style={$cardTitle}>Last Sleep</Text>
              <Text style={$cardText}>Duration: 3h 24m</Text>
              <Text style={$cardText}>Quality: Good</Text>
              <Button
                style={$trackerButton}
                textStyle={$buttonText}
                onPress={() => setSleepModalVisible(true)}
              >
                Record Sleep
              </Button>
            </View>
          </View>

          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Health Journal</Text>
            <View style={$card}>
              <Text style={$cardTitle}>Recent Notes</Text>
              <Text style={$cardText}>• Diaper change: 5 today</Text>
              <Text style={$cardText}>• Temperature: 98.6°F (Normal)</Text>
              <Button
                style={$trackerButton}
                textStyle={$buttonText}
                onPress={() => setEntryModalVisible(true)}
              >
                Add Entry
              </Button>
            </View>
          </View>

          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Sleep Tips</Text>
            <View style={$card}>
              <Text style={$cardText}>• Establish a regular bedtime routine</Text>
              <Text style={$cardText}>• Keep the room at 68-72°F (20-22°C)</Text>
              <Text style={$cardText}>• Use white noise to mask disruptive sounds</Text>
              <Button
                style={$infoButton}
                textStyle={$buttonText}
                onPress={() => setTipsModalVisible(true)}
              >
                More Tips
              </Button>
            </View>
          </View>
        </ScrollView>

        <View style={[$bottomButtonContainer, $bottomContainerInsets]}>
          <Button style={$bottomButton} textStyle={$buttonText} onPress={goBack}>
            Back to Home
          </Button>
        </View>

        {/* Record Sleep Modal */}
        <Modal visible={sleepModalVisible} transparent={true} animationType="fade">
          <View style={$modalOverlay}>
            <View style={$modalContainer}>
              <Text style={$modalTitle}>Record Sleep</Text>
              <TextInput style={$input} placeholder="Enter duration (e.g., 3h 24m)" />
              <TextInput style={$input} placeholder="Enter sleep quality (e.g., Good)" />
              <View style={$buttonContainer}>
                <Button
                  style={$button}
                  textStyle={$buttonText}
                  onPress={() => setSleepModalVisible(false)}
                >
                  Save
                </Button>
                <Button
                  style={$cancelButton}
                  textStyle={$buttonText}
                  onPress={() => setSleepModalVisible(false)}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={entryModalVisible} transparent={true} animationType="fade">
          <View style={$modalOverlay}>
            <View style={$modalContainer}>
              <Text style={$modalTitle}>Add Health Entry</Text>
              <TextInput style={$input} placeholder="Diaper changes today" />
              <TextInput style={$input} placeholder="Current temperature (°F)" />
              <View style={$buttonContainer}>
                <Button
                  style={$button}
                  textStyle={$buttonText}
                  onPress={() => setEntryModalVisible(false)}
                >
                  Save
                </Button>
                <Button
                  style={$cancelButton}
                  textStyle={$buttonText}
                  onPress={() => setEntryModalVisible(false)}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* More Tips Modal */}
        <Modal visible={tipsModalVisible} transparent={true} animationType="fade">
          <View style={$modalOverlay}>
            <View style={$modalContainer}>
              <Text style={$modalTitle}>More Sleep Tips</Text>
              <Text style={$cardText}>
                • Keep naps consistent and avoid overstimulation before bedtime.
              </Text>
              <Text style={$cardText}>• Create a calm and dark sleep environment.</Text>
              <Text style={$cardText}>• Be patient as sleep patterns evolve.</Text>
              <Button
                style={$button}
                textStyle={$buttonText}
                onPress={() => setTipsModalVisible(false)}
              >
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </Screen>
    )
  },
)

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

const $trackerButton: ViewStyle = {
  backgroundColor: "#007AFF",
  borderRadius: 8,
  marginTop: 12,
  height: 40,
}

const $infoButton: ViewStyle = {
  backgroundColor: "#5AC8FA",
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
