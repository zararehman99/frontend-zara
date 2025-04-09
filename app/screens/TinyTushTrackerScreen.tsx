import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { Modal, View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { Picker } from "@react-native-picker/picker"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { TextInput } from "react-native-gesture-handler"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { useStores } from "@/models"

interface TinyTushTrackerScreenProps extends AppStackScreenProps<"TinyTushTracker"> {}

export const TinyTushTrackerScreen: FC<TinyTushTrackerScreenProps> = observer(
  function TinyTushTrackerScreen(_props) {
    const { navigation, route } = _props
    const babyId = route.params.babyId
    const { childStore } = useStores()
    const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
    const [baby, setBaby] = useState(null)
    const [tushModalVisible, setTushModalVisible] = useState(false)
    const [tushType, setTushType] = useState("")
    const [tushDataForm, setTushDataForm] = useState({
      stoolFrequency: "",
      stoolConsistency: "",
      diaperCondition: "",
      abnormalities: "",
      additionalNotes: "",
    })

    const logs = [
      {
        date: "2025-04-09",
        time: "10:30 AM",
        eventType: "Poop",
        details: "Normal consistency, no discomfort",
      },
      { date: "2025-04-09", time: "3:00 PM", eventType: "Urine", details: "Clear color, no pain" },
      // More logs...
    ]

    useEffect(() => {
      const fetchedBaby = childStore.getChildById(parseInt(babyId))
      setBaby(fetchedBaby)
    }, [babyId])

    const handleSaveTushData = async () => {
      console.log("tush data form", tushDataForm)
      try {
        const response = await fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/tush-log`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tushDataForm),
          },
        )
        if (response.ok) {
          Toast.show({
            type: "success",
            text1: "Tush Tracker Updated Successfully!",
            visibilityTime: 3000,
            autoHide: true,
            position: "top",
          })
          setTushModalVisible(false)
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
        Toast.show({ type: "error", text1: "An unexpected error occurred. Please try again." })
      }
    }

    const handleChange = (name: keyof typeof tushDataForm, value: string) => {
      setTushDataForm((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

    function goBack() {
      navigation.goBack()
    }

    return (
      <Screen preset="scroll" contentContainerStyle={$screenContainer}>
        <Header title="Tiny Tush Tracker" leftIcon="back" onLeftPress={goBack} />

        <ScrollView style={$scrollContainer}>
          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Tush Tracker</Text>
            <View style={$card}>
              <Text style={$cardTitle}>Last Tush Log</Text>

              {/* Event Feed (List of Logs) */}
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <View key={index} style={$logEntry}>
                    <Text style={$logText}>Date: {log.date}</Text>
                    <Text style={$logText}>Time: {log.time}</Text>
                    <Text style={$logText}> {log.eventType}</Text>
                    <Text style={$logText}>Additional Details: {log.details}</Text>
                  </View>
                ))
              ) : (
                <Text style={$noLogsText}>No logs available.</Text>
              )}

              {/* Button to open modal for new log */}
              <Button
                style={$trackerButton}
                textStyle={$buttonText}
                onPress={() => setTushModalVisible(true)}
              >
                Log New Tush Event
              </Button>
            </View>
          </View>

          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Tush Care Tips</Text>
            <View style={$card}>
              <Text style={$cardText}>• Keep baby’s diaper dry and clean regularly</Text>
              <Text style={$cardText}>• Apply diaper rash cream after each change</Text>
              <Text style={$cardText}>• Always wash hands after diaper changes</Text>
              <Button
                style={$infoButton}
                textStyle={$buttonText}
                onPress={() => console.log("TIPS PRESSED")}
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

        {/* Enhanced Tush Data Modal */}
        <Modal visible={tushModalVisible} transparent={true} animationType="fade">
          <View style={$modalOverlay}>
            <View style={$modalContainer}>
              <Text style={$modalTitle}>Log Tush Event</Text>

              {/* Type of Tush (Poop or Urine) */}
              <Picker
                style={$input}
                selectedValue={tushType}
                onValueChange={(value) => setTushType(value)}
              >
                <Picker.Item label="Select Event Type" value="" />
                <Picker.Item label="Poop" value="poop" />
                <Picker.Item label="Urine" value="urine" />
              </Picker>

              {tushType === "poop" && (
                <>
                  {/* Stool Consistency */}
                  <Picker
                    style={$input}
                    selectedValue={tushDataForm.stoolConsistency}
                    onValueChange={(value) => handleChange("stoolConsistency", value)}
                  >
                    <Picker.Item label="Select Stool Consistency" value="" />
                    <Picker.Item label="Firm" value="firm" />
                    <Picker.Item label="Soft" value="soft" />
                    <Picker.Item label="Loose" value="loose" />
                    <Picker.Item label="Watery" value="watery" />
                  </Picker>

                  {/* Stool Frequency */}
                  <Picker
                    style={$input}
                    selectedValue={tushDataForm.stoolFrequency}
                    onValueChange={(value) => handleChange("stoolFrequency", value)}
                  >
                    <Picker.Item label="Select Stool Frequency" value="" />
                    <Picker.Item label="Once a day" value="once_a_day" />
                    <Picker.Item label="Twice a day" value="twice_a_day" />
                    <Picker.Item label="Multiple times a day" value="multiple_times_a_day" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </>
              )}

              {tushType === "urine" && (
                <>
                  {/* Diaper Condition */}
                  <Picker
                    style={$input}
                    selectedValue={tushDataForm.diaperCondition}
                    onValueChange={(value) => handleChange("diaperCondition", value)}
                  >
                    <Picker.Item label="Select Diaper Condition" value="" />
                    <Picker.Item label="Dry" value="dry" />
                    <Picker.Item label="Wet" value="wet" />
                    <Picker.Item label="Slightly Wet" value="slightly_wet" />
                    <Picker.Item label="Soiled" value="soiled" />
                  </Picker>
                </>
              )}

              {/* Abnormalities */}
              <TextInput
                value={tushDataForm.abnormalities}
                onChangeText={(value) => handleChange("abnormalities", value)}
                style={$input}
                placeholder="Any abnormalities or concerns?"
              />

              {/* Notes */}
              <TextInput
                value={tushDataForm.additionalNotes}
                onChangeText={(value) => handleChange("additionalNotes", value)}
                style={$input}
                placeholder="Additional Notes (e.g., signs of discomfort)"
              />

              <View style={$buttonContainer}>
                <Button
                  disabled={!tushType}
                  style={[$button, !tushType && $disabledButton]}
                  onPress={handleSaveTushData}
                >
                  <Text style={$buttonText}>Save</Text>
                </Button>
                <Button
                  style={$cancelButton}
                  textStyle={$buttonText}
                  onPress={() => setTushModalVisible(false)}
                >
                  Cancel
                </Button>
              </View>
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

const $disabledButton: ViewStyle = {
  backgroundColor: "#A0A0A0",
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
}

const $infoButton: ViewStyle = {
  backgroundColor: "#4CAF50", // Green color for info button
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 20,
  marginTop: 10,
}

const $buttonText: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "white", // White color for button text
  textAlign: "center",
}

const $bottomButtonContainer: ViewStyle = {
  position: "absolute",
  bottom: 16,
  left: 0,
  right: 0,
  paddingHorizontal: 16,
}

const $logEntry: ViewStyle = {
  marginVertical: 8,
}

const $logText: TextStyle = {
  fontSize: 14,
  color: "#333",
}

const $noLogsText: TextStyle = {
  fontSize: 14,
  color: "#999",
  marginTop: 10,
}

const $bottomButton: ViewStyle = {
  backgroundColor: "#007AFF", // Primary button color (blue)
  borderRadius: 12, // Rounded corners
  paddingVertical: 14, // Vertical padding for a taller button
  paddingHorizontal: 20, // Horizontal padding for a wider button
  alignItems: "center", // Center the text horizontally
  justifyContent: "center", // Center the text vertically
  shadowColor: "#000", // Add shadow for depth
  shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
  shadowOpacity: 0.15, // Slight opacity for the shadow
  shadowRadius: 4, // Blur radius for the shadow
  elevation: 3, // Shadow for Android
}

// const $buttonText: TextStyle = {
//   fontSize: 18, // Bigger font size for the button text
//   fontWeight: "bold", // Bold text for emphasis
//   color: "white", // White text color for contrast
//   textAlign: "center", // Center the text horizontally
// }
