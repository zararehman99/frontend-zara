import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleSheet,
  Alert,
} from "react-native"
import { AppStackScreenProps } from "../navigators"
import { Screen } from "@/components"
import { useStores } from "@/models"
import Toast from "react-native-toast-message"
import configDev from "@/config/config.dev"
import DateTimePicker from "@react-native-community/datetimepicker"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  description: string
  type: string
}

interface CalendarScreenProps extends AppStackScreenProps<"Calendar"> {}

export const CalendarScreen: FC<CalendarScreenProps> = observer(function CalendarScreen({
  navigation,
}) {
  const {
    authenticationStore: { userId },
  } = useStores()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState("Appointment")

  const eventTypes = ["Appointment", "Feeding", "Sleep", "Medication", "Other"]

  const dummyEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Doctor's Appointment",
      date: "2025-04-10",
      time: "10:00 AM",
      description: "Wellness checkup",
      type: "Appointment",
    },
    {
      id: "2",
      title: "Feeding Time",
      date: "2025-04-08",
      time: "08:00 AM",
      description: "Morning bottle",
      type: "Feeding",
    },
    {
      id: "3",
      title: "Medication",
      date: "2025-04-09",
      time: "12:00 PM",
      description: "Vitamin D drops",
      type: "Medication",
    },
  ]

  const fetchEvents = async () => {
    // For demo purposes, use dummy data
    // Comment this out when connecting to a real API
    setEvents(dummyEvents)

    // Uncomment this section when connecting to the backend
    /*
    try {
      const res = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/users/calendar/get/${userId}`,
      )
      const data = await res.json()
      setEvents(data)
    } catch (err) {
      console.error("Error fetching calendar events", err)
      Toast.show({
        type: "error",
        text1: "Failed to load calendar events",
        position: "top",
      })
    }
    */
  }

  const handleAddEvent = async () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Please enter an event title" })
      return
    }

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0]
    }

    const formatTime = (time: Date) => {
      return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const event = {
      title: title,
      date: formatDate(date),
      time: formatTime(time),
      description: description,
      type: selectedEventType,
    }

    // For demo purposes, just add to local state
    // Comment this out when connecting to a real API
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
    }
    setEvents([...events, newEvent])
    Toast.show({ type: "success", text1: "Event added successfully!" })

    // Uncomment this section when connecting to the backend
    /*
    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/users/calendar/add/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        },
      )

      if (response.ok) {
        Toast.show({ type: "success", text1: "Event added successfully!" })
        fetchEvents()
      } else {
        const errorData = await response.json()
        Toast.show({ type: "error", text1: errorData.message || "Something went wrong." })
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to add event" })
    }
    */

    // Reset form fields
    setTitle("")
    setDescription("")
    setDate(new Date())
    setTime(new Date())
    setSelectedEventType("Appointment")
  }

  const handleDeleteEvent = async (eventId: string) => {
    // For demo purposes, delete from local state
    // Comment this out when connecting to a real API
    setEvents(events.filter((event) => event.id !== eventId))
    Toast.show({ type: "success", text1: "Event deleted successfully!" })

    // Uncomment this section when connecting to the backend
    /*
    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/calendar/delete/${eventId}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        Toast.show({ type: "success", text1: "Event deleted successfully!" })
        fetchEvents()
      } else {
        const errorData = await response.json()
        Toast.show({ type: "error", text1: errorData.message || "Failed to delete event." })
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Network error while deleting event." })
    }
    */
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date
    setShowDatePicker(false)
    setDate(currentDate)
  }

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time
    setShowTimePicker(false)
    setTime(currentTime)
  }

  const renderItem = ({ item }: { item: CalendarEvent }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTypeTag}>
          <Text style={styles.eventTypeText}>{item.type}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>
        {item.date} at {item.time}
      </Text>
      {item.description && <Text style={styles.eventDescription}>{item.description}</Text>}
    </View>
  )

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Calendar Events</Text>

      {/* Event Form */}
      <TextInput
        placeholder="Event Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Description (optional)"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Date Picker */}
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>Date: {date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
      )}

      {/* Time Picker */}
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.dateButtonText}>
          Time: {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker value={time} mode="time" display="default" onChange={onTimeChange} />
      )}

      {/* Event Type Selection */}
      <Text style={styles.label}>Event Type:</Text>
      <View style={styles.typeButtons}>
        {eventTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, selectedEventType === type && styles.selectedTypeButton]}
            onPress={() => setSelectedEventType(type)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedEventType === type && styles.selectedTypeButtonText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleAddEvent}>
        <Text style={styles.saveButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      {/* Events List */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  padding: 20,
  flexGrow: 1,
  backgroundColor: "#f1f5f9",
  alignItems: "center",
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  } as TextStyle,
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
  } as TextStyle,
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    alignSelf: "flex-start",
  } as TextStyle,
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    width: "100%",
  } as TextStyle,
  dateButton: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "flex-start",
  } as ViewStyle,
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  } as TextStyle,
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    marginTop: 5,
  } as ViewStyle,
  typeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    marginBottom: 10,
  } as ViewStyle,
  selectedTypeButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  } as ViewStyle,
  typeButtonText: {
    color: "#000",
  } as TextStyle,
  selectedTypeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  } as TextStyle,
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  } as ViewStyle,
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  } as TextStyle,
  eventCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  } as ViewStyle,
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  eventTypeTag: {
    backgroundColor: "#e0f2fe",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  } as ViewStyle,
  eventTypeText: {
    color: "#0369a1",
    fontSize: 12,
    fontWeight: "500",
  } as TextStyle,
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  } as TextStyle,
  eventDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  } as TextStyle,
  eventDescription: {
    fontSize: 14,
    color: "#666",
  } as TextStyle,
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  } as ViewStyle,
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  } as TextStyle,
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  } as ViewStyle,
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
  } as TextStyle,
})
