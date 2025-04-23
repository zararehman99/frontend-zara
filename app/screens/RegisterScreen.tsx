import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import { TextInput, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import { Screen, Text, TextField } from "@/components"
import { AppStackScreenProps } from "@/navigators"
import toast from "react-native-toast-message"
import configDev from "@/config/config.dev"

export const RegisterScreen: FC<AppStackScreenProps<"Register">> = observer(
  function RegisterScreen({ navigation }) {
    const authPasswordInput = useRef<TextInput>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    })

    useEffect(() => {
      return () => {
        setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" })
      }
    }, [])

    const handleChange = (name: keyof typeof formData, value: string) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }

    const handleSubmit = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${configDev.VITE_LATCH_BACKEND_URL}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.show({
            type: "success",
            text1: "Account created successfully! Redirecting to login...",
          })
          navigation.navigate("Login")
        } else {
          const errorData = await response.json()
          toast.show({
            type: "error",
            text1: errorData.message || "Signup failed. Please try again.",
          })
        }
      } catch (error) {
        console.error("Error:", error)
        toast.show({ type: "error", text1: "An unexpected error occurred. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    return (
      <Screen preset="auto" contentContainerStyle={$container}>
        <TextField
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          containerStyle={$input}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholderTx="registerScreen:emailFieldPlaceholder"
        />

        <TextField
          value={formData.firstName}
          onChangeText={(value) => handleChange("firstName", value)}
          containerStyle={$input}
          autoCapitalize="words"
          placeholderTx="registerScreen:firstNameFieldPlaceholder"
        />

        <TextField
          value={formData.lastName}
          onChangeText={(value) => handleChange("lastName", value)}
          containerStyle={$input}
          autoCapitalize="words"
          placeholderTx="registerScreen:lastNameFieldPlaceholder"
        />
        <TextField
          ref={authPasswordInput}
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          containerStyle={$input}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          placeholderTx="registerScreen:passwordFieldPlaceholder"
        />

        <TextField
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange("confirmPassword", value)}
          containerStyle={$input}
          secureTextEntry
          autoCapitalize="none"
          placeholderTx="registerScreen:confirmPasswordFieldPlaceholder"
        />

        <Text tx="registerScreen:conditions" style={$hint} />

        {/* <Button
          tx="registerScreen:tapToRegister"
          style={$tapButton}
          onPress={handleSubmit}
          disabled={loading}
        /> */}

        <TouchableOpacity style={$tapButton} onPress={handleSubmit} disabled={loading}>
          <Text style={$buttonText}>Register</Text>
        </TouchableOpacity>

        {/* <Button
          tx="registerScreen:goToLogin"
          style={$accountButton}
          onPress={}
        /> */}
        <TouchableOpacity style={$accountButton} onPress={() => navigation.navigate("Login")}>
          <Text style={$buttonText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </Screen>
    )
  },
)

const $container: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f1f5f9",
  flex: 1,
  gap: 20,
}

const $input: ViewStyle = {
  width: "80%",
  height: 50,
  fontSize: 16,
  zIndex: 1,
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}

const $tapButton: ViewStyle = {
  width: "80%",
  backgroundColor: "#16A34A",
  padding: 15,
  borderRadius: 8,
  alignItems: "center",
  position: "relative",
}

const $hint: TextStyle = {
  color: "black",
  marginBottom: 20,
  width: "80%",
}

const $accountButton: ViewStyle = {
  width: "80%",
  backgroundColor: "#3B82F6",
  padding: 15,
  borderRadius: 8,
  alignItems: "center",
  position: "relative",
}

// const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
//   color: colors.text,
//   marginBottom: spacing.md,
// })

// const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
//   marginBottom: spacing.lg,
// })

// const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
//   marginTop: spacing.xs,
// })
