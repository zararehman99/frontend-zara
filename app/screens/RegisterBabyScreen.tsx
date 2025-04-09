import { observer } from "mobx-react-lite"
import { FC, useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { launchImageLibrary } from "react-native-image-picker"
import Toast from "react-native-toast-message" // Import Toast for notifications
import configDev from "@/config/config.dev"
import { useStores } from "@/models"
interface RegisterBabyScreenProps extends AppStackScreenProps<"RegisterBaby"> {}

export const RegisterBabyScreen: FC<RegisterBabyScreenProps> = observer(
  function RegisterBabyScreen(_props) {
    const { navigation } = _props
    const {
      authenticationStore: { userId, userName, logout },
    } = useStores()

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
      babyName: "",
      babyAge: "",
      babyWeight: "",
      babyHeight: "",
      gender: "",
      imageUri: null,
      birthDate: new Date(),
    })

    const handleChange = (name: keyof typeof formData, value: string) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
    // Check if all fields are filled
    // const isFormValid = babyName && babyAge && babyWeight && babyHeight && gender && birthDate

    const handleSubmit = async () => {
      setLoading(true)
      console.log("formData", formData)
      try {
        const response = await fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/create-baby/${userId}`,
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
          navigation.navigate("Welcome")
        } else {
          const errorData = await response.json()
          Toast.show({
            type: "error",
            text1: errorData.message || "invalid info. Please try again.",
            position: "top",
          })
        }
      } catch (error) {
        console.error("Error:", error)
        Toast.show({ type: "error", text1: "An unexpected error occurred. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    const pickImage = () => {
      launchImageLibrary({ mediaType: "photo", includeBase64: false }, (response) => {
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri)
        }
      })
    }

    return (
      <Screen preset="fixed" contentContainerStyle={$container}>
        <Header title="back to home" leftIcon="back" onLeftPress={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={$formContainer}>
          <Text style={$title}>Enter Baby's Information</Text>

          <TextInput
            style={$input}
            placeholder="Baby Name"
            value={formData.babyName}
            onChangeText={(value) => handleChange("babyName", value)}
          />
          <TextInput
            style={$input}
            placeholder="Age (months)"
            keyboardType="numeric"
            value={formData.babyAge}
            onChangeText={(value) => handleChange("babyAge", value)}
          />
          <TextInput
            style={$input}
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={formData.babyWeight}
            onChangeText={(value) => handleChange("babyWeight", value)}
          />
          <TextInput
            style={$input}
            placeholder="Height (cm)"
            keyboardType="numeric"
            value={formData.babyHeight}
            onChangeText={(value) => handleChange("babyHeight", value)}
          />

          <View style={$pickerContainer}>
            <Text style={$pickerLabel}>Birth Date</Text>
            <input
              type="date"
              style={$dateInput}
              // style={$dateInput} // Apply styles manually
              value={
                formData.birthDate ? new Date(formData.birthDate).toISOString().split("T")[0] : ""
              } // Format YYYY-MM-DD
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </View>

          {/* Gender Dropdown with fixed UI */}
          <View style={$pickerContainer}>
            <Text style={$pickerLabel}>Gender</Text>
            <View style={$pickerWrapper}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(itemValue) => handleChange("gender", itemValue)}
                style={$picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>
          </View>

          {/* Image Picker */}
          <View style={$imagePickerContainer}>
            <TouchableOpacity style={$imageButton} onPress={pickImage}>
              <Text style={$imageButtonText}>Select Baby Image</Text>
            </TouchableOpacity>
            {formData.imageUri && (
              <Image source={{ uri: formData.imageUri }} style={$imagePreview} />
            )}
          </View>

          <TouchableOpacity
            style={$button}
            onPress={handleSubmit}
            // disabled={!isFormValid}
          >
            <Text style={$buttonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </Screen>
    )
  },
)

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#f1f5f9", // Light background color
  padding: 20,
}

const $formContainer: ViewStyle = {
  flexGrow: 1,
  justifyContent: "center",
  paddingVertical: 30,
}

const $title: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
  color: "#333", // Darker text for better readability
}

const $input: ViewStyle = {
  width: "100%",
  height: 50,
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  marginBottom: 15,
  paddingHorizontal: 15,
  fontSize: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
}

const $dateInput: ViewStyle = {
  width: "100%",
  height: 50,
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  paddingHorizontal: 15,
  fontSize: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
}

const $pickerContainer: ViewStyle = {
  width: "100%",
  marginBottom: 15,
}

const $pickerLabel: TextStyle = {
  fontSize: 16,
  marginBottom: 5,
  color: "#000",
}

const $pickerWrapper: ViewStyle = {
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  height: 50,
  justifyContent: "center",
}

const $picker: ViewStyle = {
  backgroundColor: "#fff",
  width: "100%",
  height: 50,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#fff",
  padding: 10,
}

const $imagePickerContainer: ViewStyle = {
  marginBottom: 20,
  alignItems: "center",
}

const $imageButton: ViewStyle = {
  backgroundColor: "#3B82F6", // Blue color for the button
  paddingVertical: 15,
  paddingHorizontal: 30,
  borderRadius: 10,
  marginBottom: 10,
}

const $imageButtonText: TextStyle = {
  color: "#fff",
  fontSize: 16,
}

const $imagePreview: ViewStyle = {
  width: 150,
  height: 150,
  marginTop: 10,
  borderRadius: 10,
}

const $button: ViewStyle = {
  backgroundColor: "#10B981", // Blue color for the button
  paddingVertical: 15,
  borderRadius: 10,
  marginTop: 20,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
}

const $buttonText: TextStyle = {
  color: "#fff",
  fontSize: 18,
  fontWeight: "bold",
}

const $dateButton: ViewStyle = {
  padding: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 5,
  alignItems: "center",
  backgroundColor: "#f8f8f8",
}

const $dateButtonText: TextStyle = {
  fontSize: 16,
  color: "#333",
}
