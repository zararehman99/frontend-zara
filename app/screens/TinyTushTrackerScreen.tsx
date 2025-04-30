import { observer } from "mobx-react-lite"
import { FC, useState, useEffect } from "react"
import { Modal, View, ViewStyle, TextStyle, ScrollView, TouchableOpacity } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { Picker } from "@react-native-picker/picker"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { TextInput } from "react-native-gesture-handler"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { useStores } from "@/models"
import { format } from "date-fns" // Assuming date-fns is available
import { getSnapshot } from "mobx-state-tree"

interface TinyTushTrackerScreenProps extends AppStackScreenProps<"TinyTushTracker"> {}

export const TinyTushTrackerScreen: FC<TinyTushTrackerScreenProps> = observer(
  function TinyTushTrackerScreen(_props) {
    const { navigation, route } = _props
    const babyId = route.params.babyId
    const { childStore } = useStores()
    const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
    const [baby, setBaby] = useState(null)
    const [tushModalVisible, setTushModalVisible] = useState(false)
    const [tushLogs, setTushLogs] = useState([])
    const [tushType, setTushType] = useState("")
    const [tushDataForm, setTushDataForm] = useState({
      stoolFrequency: "",
      stoolConsistency: "",
      diaperCondition: "",
      abnormalities: "",
      additionalNotes: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
    })

    const formatTushLogs = (rawLogs) => {
      if (!rawLogs || !Array.isArray(rawLogs)) return []
      
      return rawLogs.map(log => {
        // Format date and time from createdAt
        const date = new Date(log.createdAt)
        const formattedDate = format(date, "yyyy-MM-dd")
        const formattedTime = format(date, "h:mm a")
        
        // Generate meaningful details based on log data
        let details = ""
        if (log.eventType === "poop") {
          details = log.stoolConsistency ? `Consistency: ${log.stoolConsistency}` : ""
          if (log.stoolFrequency) {
            details += details ? `, Frequency: ${log.stoolFrequency}` : `Frequency: ${log.stoolFrequency}`
          }
        } else if (log.eventType === "urine") {
          details = log.diaperCondition ? `Diaper: ${log.diaperCondition}` : ""
        }
        
        // Add abnormalities and notes if present
        if (log.abnormalities) {
          details += details ? `\nAbnormalities: ${log.abnormalities}` : `Abnormalities: ${log.abnormalities}`
        }
        if (log.additionalNotes) {
          details += details ? `\nNotes: ${log.additionalNotes}` : `Notes: ${log.additionalNotes}`
        }
        
        // If no details at all, add a placeholder
        if (!details) {
          details = "No additional details"
        }
        
        return {
          id: log.id,
          date: formattedDate,
          time: formattedTime,
          eventType: log.eventType.charAt(0).toUpperCase() + log.eventType.slice(1), // Capitalize first letter
          details
        }
      }).sort((a, b) => {
        // Sort by date and time (newest first)
        const dateA = new Date(`${a.date} ${a.time}`)
        const dateB = new Date(`${b.date} ${b.time}`)
        return dateB - dateA
      })
    }

    useEffect(() => {
      const fetchedBaby = childStore.getChildById(parseInt(babyId))
      setBaby(fetchedBaby)
      setTushLogs(formatTushLogs(fetchedBaby?.tushLogs))
    }, [babyId])

    const handleSaveTushData = async () => {
      console.log("tush data form", tushDataForm)
      try {
        const response = await fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/${babyId}/tush-log`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...tushDataForm,
              eventType: tushType,
            }),
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
          // Here you would ideally refresh logs
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

    const resetForm = () => {
      setTushType("")
      setTushDataForm({
        stoolFrequency: "",
        stoolConsistency: "",
        diaperCondition: "",
        abnormalities: "",
        additionalNotes: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
      })
    }

    const closeModal = () => {
      resetForm()
      setTushModalVisible(false)
    }

    function goBack() {
      navigation.goBack()
    }

    return (
      <Screen preset="scroll" contentContainerStyle={$screenContainer}>
        <Header title="Tiny Tush Tracker" leftIcon="back" onLeftPress={goBack} />

        <ScrollView style={$scrollContainer}>
          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Tush History</Text>
            <View style={$card}>
              {/* Event Feed (List of Logs) */}
              {tushLogs.length > 0 ? (
                tushLogs.map((log, index) => (
                  <View key={index} style={$logEntry}>
                    <View style={$logHeader}>
                      <View style={$logDateContainer}>
                        <Text style={$logDate}>{log.date}</Text>
                        <Text style={$logTime}>{log.time}</Text>
                      </View>
                      <View style={[$badgeContainer, log.eventType === "Poop" ? $poopBadge : $urineBadge]}>
                        <Text style={$badgeText}>{log.eventType}</Text>
                      </View>
                    </View>
                    <Text style={$logDetails}>{log.details}</Text>
                  </View>
                ))
              ) : (
                <View style={$emptyLogContainer}>
                  <Text style={$noLogsText}>No tush events logged yet</Text>
                  <Text style={$noLogsSubtext}>Tap the button below to log your first event</Text>
                </View>
              )}

              {/* Button to open modal for new log */}
              <Button
                style={$trackerButton}
                textStyle={$buttonText}
                onPress={() => setTushModalVisible(true)}
              >
                Log New Event
              </Button>
            </View>
          </View>

          <View style={$sectionContainer}>
            <Text style={$sectionTitle}>Tush Care Tips</Text>
            <View style={$card}>
              <View style={$tipItem}>
                <View style={$tipIcon}>
                  <Text style={$tipIconText}>💧</Text>
                </View>
                <Text style={$tipText}>Keep baby's diaper dry and clean</Text>
              </View>
              
              <View style={$tipItem}>
                <View style={$tipIcon}>
                  <Text style={$tipIconText}>🧴</Text>
                </View>
                <Text style={$tipText}>Apply diaper rash cream after changes</Text>
              </View>
              
              <View style={$tipItem}>
                <View style={$tipIcon}>
                  <Text style={$tipIconText}>🧼</Text>
                </View>
                <Text style={$tipText}>Always wash hands after diaper changes</Text>
              </View>
              
              <Button
                style={$infoButton}
                textStyle={$buttonText}
                onPress={() => console.log("TIPS PRESSED")}
              >
                More Tush Care Tips
              </Button>
            </View>
          </View>
        </ScrollView>

        {/* Enhanced Tush Data Modal */}
        <Modal visible={tushModalVisible} transparent={true} animationType="slide">
          <View style={$modalOverlay}>
            <View style={$modalContainer}>
              <View style={$modalHeader}>
                <Text style={$modalTitle}>New Tush Event</Text>
                <TouchableOpacity style={$closeIcon} onPress={closeModal}>
                  <Text style={$closeIconText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={$modalScrollView}>
                <View style={$formSection}>
                  <Text style={$formSectionTitle}>Event Details</Text>
                  
                  {/* Date and Time */}
                  <View style={$formRow}>
                    <View style={$formHalfColumn}>
                      <Text style={$inputLabel}>Date</Text>
                      <TextInput
                        value={tushDataForm.date}
                        onChangeText={(value) => handleChange("date", value)}
                        style={$dateTimeInput}
                        placeholder="YYYY-MM-DD"
                      />
                    </View>
                    <View style={$formHalfColumn}>
                      <Text style={$inputLabel}>Time</Text>
                      <TextInput
                        value={tushDataForm.time}
                        onChangeText={(value) => handleChange("time", value)}
                        style={$dateTimeInput}
                        placeholder="HH:MM"
                      />
                    </View>
                  </View>

                  {/* Type Selection Buttons */}
                  <Text style={$inputLabel}>Event Type</Text>
                  <View style={$typeSelectionContainer}>
                    <TouchableOpacity
                      style={[
                        $typeButton,
                        tushType === "poop" && $typeButtonActive,
                        $poopTypeButton,
                      ]}
                      onPress={() => setTushType("poop")}
                    >
                      <Text style={[
                        $typeButtonText,
                        tushType === "poop" && $typeButtonTextActive
                      ]}>💩 Poop</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        $typeButton,
                        tushType === "urine" && $typeButtonActive,
                        $urineTypeButton,
                      ]}
                      onPress={() => setTushType("urine")}
                    >
                      <Text style={[
                        $typeButtonText,
                        tushType === "urine" && $typeButtonTextActive
                      ]}>💧 Urine</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {tushType === "poop" && (
                  <View style={$formSection}>
                    <Text style={$formSectionTitle}>Stool Details</Text>
                    
                    {/* Stool Consistency */}
                    <Text style={$inputLabel}>Consistency</Text>
                    <View style={$input}>
                      <Picker
                        selectedValue={tushDataForm.stoolConsistency}
                        onValueChange={(value) => handleChange("stoolConsistency", value)}
                        style={$picker}
                      >
                        <Picker.Item label="Select consistency" value="" />
                        <Picker.Item label="Firm" value="firm" />
                        <Picker.Item label="Soft" value="soft" />
                        <Picker.Item label="Loose" value="loose" />
                        <Picker.Item label="Watery" value="watery" />
                      </Picker>
                    </View>

                    {/* Stool Frequency */}
                    <Text style={$inputLabel}>Frequency</Text>
                    <View style={$input}>
                      <Picker
                        selectedValue={tushDataForm.stoolFrequency}
                        onValueChange={(value) => handleChange("stoolFrequency", value)}
                        style={$picker}
                      >
                        <Picker.Item label="Select frequency" value="" />
                        <Picker.Item label="Once a day" value="once_a_day" />
                        <Picker.Item label="Twice a day" value="twice_a_day" />
                        <Picker.Item label="Multiple times a day" value="multiple_times_a_day" />
                        <Picker.Item label="Other" value="other" />
                      </Picker>
                    </View>
                  </View>
                )}

                {tushType === "urine" && (
                  <View style={$formSection}>
                    <Text style={$formSectionTitle}>Urine Details</Text>
                    
                    {/* Diaper Condition */}
                    <Text style={$inputLabel}>Diaper Condition</Text>
                    <View style={$input}>
                      <Picker
                        selectedValue={tushDataForm.diaperCondition}
                        onValueChange={(value) => handleChange("diaperCondition", value)}
                        style={$picker}
                      >
                        <Picker.Item label="Select condition" value="" />
                        <Picker.Item label="Dry" value="dry" />
                        <Picker.Item label="Slightly Wet" value="slightly_wet" />
                        <Picker.Item label="Very Wet" value="wet" />
                        <Picker.Item label="Soaked" value="soaked" />
                      </Picker>
                    </View>
                  </View>
                )}

                {tushType && (
                  <View style={$formSection}>
                    <Text style={$formSectionTitle}>Additional Information</Text>
                    
                    {/* Abnormalities */}
                    <Text style={$inputLabel}>Any abnormalities or concerns?</Text>
                    <TextInput
                      value={tushDataForm.abnormalities}
                      onChangeText={(value) => handleChange("abnormalities", value)}
                      style={$textAreaInput}
                      placeholder="E.g., unusual color, blood, mucus"
                      multiline={true}
                      numberOfLines={3}
                    />

                    {/* Notes */}
                    <Text style={$inputLabel}>Additional Notes</Text>
                    <TextInput
                      value={tushDataForm.additionalNotes}
                      onChangeText={(value) => handleChange("additionalNotes", value)}
                      style={$textAreaInput}
                      placeholder="E.g., signs of discomfort, time since last feeding"
                      multiline={true}
                      numberOfLines={3}
                    />
                  </View>
                )}
              </ScrollView>

              <View style={$modalFooter}>
                <Button
                  disabled={!tushType}
                  style={[$saveButton, !tushType && $disabledButton]}
                  textStyle={$saveButtonText}
                  onPress={handleSaveTushData}
                >
                  Save Event
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Screen>
    )
  },
)

// Modal Styles
const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end", // Modal slides up from bottom
}

const $modalContainer: ViewStyle = {
  backgroundColor: "white",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  maxHeight: "85%",
  paddingBottom: 30, // Extra padding for bottom area
}

const $modalHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F0F0",
}

const $modalTitle: TextStyle = {
  fontSize: 22,
  fontWeight: "bold",
  color: "#333",
}

const $closeIcon: ViewStyle = {
  padding: 5,
}

const $closeIconText: TextStyle = {
  fontSize: 24,
  color: "#999",
}

const $modalScrollView: ViewStyle = {
  padding: 20,
  maxHeight: "70%",
}

const $modalFooter: ViewStyle = {
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: "#F0F0F0",
}

// Form Styles
const $formSection: ViewStyle = {
  marginBottom: 20,
}

const $formSectionTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 15,
  color: "#333",
}

const $formRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 15,
}

const $formHalfColumn: ViewStyle = {
  width: "48%",
}

const $inputLabel: TextStyle = {
  fontSize: 14,
  fontWeight: "500",
  color: "#666",
  marginBottom: 8,
}

const $input: ViewStyle = {
  borderWidth: 1,
  borderColor: "#E0E0E0",
  borderRadius: 10,
  marginBottom: 15,
  backgroundColor: "#F8F8F8",
  overflow: "hidden",
}

const $picker: ViewStyle = {
  height: 50,
  width: "100%",
}

const $dateTimeInput: ViewStyle = {
  borderWidth: 1,
  borderColor: "#E0E0E0",
  borderRadius: 10,
  padding: 12,
  marginBottom: 15,
  backgroundColor: "#F8F8F8",
}

const $textAreaInput: ViewStyle = {
  borderWidth: 1,
  borderColor: "#E0E0E0",
  borderRadius: 10,
  padding: 12,
  marginBottom: 15,
  backgroundColor: "#F8F8F8",
  textAlignVertical: "top",
  minHeight: 80,
}

const $typeSelectionContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 15,
}

const $typeButton: ViewStyle = {
  flex: 1,
  padding: 15,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  marginHorizontal: 5,
}

const $poopTypeButton: ViewStyle = {
  borderColor: "#A0522D",
  backgroundColor: "#FFF8DC",
}

const $urineTypeButton: ViewStyle = {
  borderColor: "#4682B4",
  backgroundColor: "#F0F8FF",
}

const $typeButtonActive: ViewStyle = {
  transform: [{ scale: 1.05 }],
}

const $typeButtonText: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
}

const $typeButtonTextActive: TextStyle = {
  fontWeight: "bold",
}

const $saveButton: ViewStyle = {
  backgroundColor: "#007AFF",
  borderRadius: 12,
  padding: 15,
}

const $saveButtonText: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  color: "white",
  textAlign: "center",
}

const $disabledButton: ViewStyle = {
  backgroundColor: "#B0C4DE",
}

// Main Screen Styles
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
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 12,
  color: "#333",
}

const $card: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 18,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
  marginBottom: 16,
}

// Log Entry Styles
const $logEntry: ViewStyle = {
  marginBottom: 15,
  padding: 12,
  backgroundColor: "#F8F8F8",
  borderRadius: 12,
  borderLeftWidth: 4,
  borderLeftColor: "#007AFF",
}

const $logHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
}

const $logDateContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $logDate: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  color: "#333",
}

const $logTime: TextStyle = {
  fontSize: 14,
  color: "#666",
  marginLeft: 8,
}

const $badgeContainer: ViewStyle = {
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 20,
}

const $poopBadge: ViewStyle = {
  backgroundColor: "#A0522D20",
}

const $urineBadge: ViewStyle = {
  backgroundColor: "#4682B420",
}

const $badgeText: TextStyle = {
  fontSize: 12,
  fontWeight: "bold",
}

const $logDetails: TextStyle = {
  fontSize: 14,
  color: "#555",
  lineHeight: 20,
}

const $emptyLogContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
}

const $noLogsText: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  color: "#999",
  textAlign: "center",
}

const $noLogsSubtext: TextStyle = {
  fontSize: 14,
  color: "#AAA",
  textAlign: "center",
  marginTop: 8,
}

// Button Styles
const $trackerButton: ViewStyle = {
  backgroundColor: "#007AFF",
  borderRadius: 12,
  padding: 16,
  marginTop: 10,
}

const $buttonText: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  color: "white",
  textAlign: "center",
}

// Tips Styles
const $tipItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
}

const $tipIcon: ViewStyle = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#F0F8FF",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
}

const $tipIconText: TextStyle = {
  fontSize: 18,
}

const $tipText: TextStyle = {
  fontSize: 16,
  color: "#555",
  flex: 1,
}

const $infoButton: ViewStyle = {
  backgroundColor: "#4CAF50",
  borderRadius: 12,
  padding: 16,
  marginTop: 10,
}