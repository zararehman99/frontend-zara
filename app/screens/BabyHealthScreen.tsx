import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { Modal, View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { Picker } from "@react-native-picker/picker"

import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

import { TextInput } from "react-native-gesture-handler"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { useStores } from "@/models"

interface BabyHealthSleepScreenProps extends AppStackScreenProps<"BabyHealthSleep"> {}

export const BabyHealthSleepScreen: FC<BabyHealthSleepScreenProps> = observer(
  function BabyHealthSleepScreen(_props) {
    const { navigation, route } = _props
    const babyId = route.params.babyId
    const { childStore } = useStores()
    const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
    const [baby, setBaby] = useState(null)
    const [sleepModalVisible, setSleepModalVisible] = useState(false)
    const [entryModalVisible, setEntryModalVisible] = useState(false)
    const [tipsModalVisible, setTipsModalVisible] = useState(false)
    const [sleepFormData, setSleepFormData] = useState({
      sleepDuration: "",
      sleepQuality: "",
    })
    const [healthFormData, setHealthFormData] = useState({
      diaperChange: "",
      temperature: "",
    })
    const [sleepDurationError, setSleepDurationError] = useState("")
    const [diaperChangeError, setDiaperChangeError] = useState("")
    const [temperatureError, setTemperatureError] = useState("")
    const [lastSleep, setLastSleep] = useState(null)

    useEffect(() => {
      // If this method triggers an async fetch but returns the current value synchronously
      childStore.getChildById(parseInt(babyId))

      // Make sure this is getting the latest value from the store
      const currentBaby = childStore.getChildById(parseInt(babyId))
      setBaby(currentBaby)
      console.log("Baby data:", currentBaby)

      if (currentBaby?.sleepLogs && currentBaby.sleepLogs.length > 0) {
        const sortedSleepData = [...currentBaby.sleepLogs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )
        console.log("Sorted sleep data:", sortedSleepData)
        setLastSleep(sortedSleepData[0])
      }
    }, [babyId])

    const handleSaveSleepLog = async () => {
      console.log("sleep form data", sleepFormData)
      try {
        const response = await fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/sleep-log`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sleepFormData),
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
          setSleepModalVisible(false)
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
    const handleSaveHealthLog = async () => {
      console.log("sleep form data", healthFormData)
      try {
        const response = await fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/health-log`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(healthFormData),
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
          setEntryModalVisible(false)
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

    function goBack() {
      navigation.goBack()
    }

    const handleChange = (name: keyof typeof sleepFormData, value: string) => {
      setSleepFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

    const handleHealthChange = (name: keyof typeof healthFormData, value: string) => {
      setHealthFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

    const formatDuration = (durationMins) => {
      const hours = Math.floor(durationMins / 60)
      const minutes = durationMins % 60
      return `${hours}h ${minutes}m`
    }

    return (
      <Screen preset="scroll" contentContainerStyle={$screenContainer}>
        <Header title="Baby Health & Sleep" leftIcon="back" onLeftPress={goBack} />

        <ScrollView style={$scrollContainer}>
          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Sleep Tracker</Text>
            <View style={$card}>
              <Text style={$cardTitle}>Last Sleep</Text>
              {lastSleep ? (
                <>
                  <Text style={$cardText}>Duration: {formatDuration(lastSleep.durationMins)}</Text>
                  <Text style={$cardText}>Quality: {lastSleep?.sleepQuality}</Text>
                  <Button
                    style={$trackerButton}
                    textStyle={$buttonText}
                    onPress={() => setSleepModalVisible(true)}
                  >
                    Record Sleep
                  </Button>
                </>
              ) : (
                <Text style={$cardText}>No sleep data available.</Text>
              )}
            </View>
          </View>

          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Health Journal</Text>
            <View style={$card}>
              <Text style={$cardTitle}>Recent Notes</Text>
              {baby?.healthLogs?.length > 0 ? (
                (() => {
                  const latestLog = [...baby.healthLogs].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                  )[0]

                  return (
                    <>
                      <Text style={$cardText}>
                        • Nappy change: {latestLog.diaperChanges || 0} today
                      </Text>
                      <Text style={$cardText}>
                        • Temperature: {latestLog.temperature || "N/A"}°F
                      </Text>
                    </>
                  )
                })()
              ) : (
                <Text style={$cardText}>No health logs available.</Text>
              )}

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
              <TextInput
                style={$input}
                value={sleepFormData.sleepDuration?.toString()}
                placeholder="Enter duration (e.g., 3h 24m)"
                onChangeText={(value) => {
                  if (/^\d*$/.test(value)) {
                    // Only allow digits and h, m, s
                    setSleepDurationError("") // Clear error if valid
                    handleChange("sleepDuration", value === "" ? "" : value)
                  } else {
                    setSleepDurationError("Please enter a valid duration")
                  }
                }}
              />
              {sleepDurationError ? (
                <Text style={{ color: "red" }}>{sleepDurationError}</Text>
              ) : null}
              <Picker
                style={$input}
                selectedValue={sleepFormData.sleepQuality}
                onValueChange={(value) => handleChange("sleepQuality", value)}
              >
                <Picker.Item label="Select Sleep Quality" value="" enabled={false} />
                <Picker.Item label="Best" value="best" />
                <Picker.Item label="Good" value="good" />
                <Picker.Item label="Bad" value="bad" />
              </Picker>
              {/* <TextInput style={$input} placeholder="Enter sleep quality (e.g., Good)" /> */}
              <View style={$buttonContainer}>
                <Button
                  disabled={!sleepFormData.sleepDuration || !sleepFormData.sleepQuality}
                  style={[
                    $button,
                    (!sleepFormData.sleepDuration || !sleepFormData.sleepQuality) &&
                      $disabledButton,
                  ]}
                  onPress={handleSaveSleepLog}
                >
                  <Text style={$buttonText}> Save </Text>
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
              <TextInput
                value={healthFormData.diaperChange?.toString()}
                onChangeText={(value) => {
                  if (/^\d*$/.test(value)) {
                    // Only allow digits
                    setDiaperChangeError("") // Clear error if valid
                    handleHealthChange("diaperChange", value === "" ? "" : Number(value))
                  } else {
                    setDiaperChangeError("Please enter a valid number")
                  }
                }}
                style={$input}
                placeholder="Diaper changes today"
              />
              {diaperChangeError ? <Text style={{ color: "red" }}>{diaperChangeError}</Text> : null}
              <TextInput
                value={healthFormData.temperature?.toString()}
                onChangeText={(value) => {
                  if (/^\d*$/.test(value)) {
                    // Only allow digits
                    setTemperatureError("") // Clear error if valid
                    handleHealthChange("temperature", value === "" ? "" : Number(value))
                  } else {
                    setTemperatureError("Please enter a valid number")
                  }
                }}
                style={$input}
                placeholder="Current temperature (°F)"
              />
              {temperatureError ? <Text style={{ color: "red" }}>{temperatureError}</Text> : null}
              <View style={$buttonContainer}>
                <Button
                  disabled={!healthFormData.diaperChange || !healthFormData.temperature}
                  style={[
                    $button,
                    (!healthFormData.diaperChange || !healthFormData.temperature) &&
                      $disabledButton,
                  ]}
                  onPress={handleSaveHealthLog}
                >
                  <Text style={$buttonText}>Save</Text>
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
