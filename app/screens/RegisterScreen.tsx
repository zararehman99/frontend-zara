import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { useAppTheme } from "@/utils/useAppTheme"
import { AppStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme"
import toast from "react-native-toast-message"
import configDev from "@/config/config.dev"

export const RegisterScreen: FC<AppStackScreenProps<"Register">> = observer(
  function RegisterScreen({ navigation }) {
    const authPasswordInput = useRef<TextInput>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    })
    const {
      authenticationStore: { setAuthToken },
    } = useStores()
    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    useEffect(() => {
      return () => {
        setFormData({ email: "", fullName: "", password: "", confirmPassword: "" })
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
      <Screen preset="auto" contentContainerStyle={themed($screenContentContainer)}>
        <TextField
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholderTx="registerScreen:emailFieldPlaceholder"
        />

        <TextField
          value={formData.fullName}
          onChangeText={(value) => handleChange("fullName", value)}
          containerStyle={themed($textField)}
          autoCapitalize="words"
          placeholderTx="registerScreen:fullNameFieldPlaceholder"
        />

        <TextField
          ref={authPasswordInput}
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          containerStyle={themed($textField)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          placeholderTx="registerScreen:passwordFieldPlaceholder"
        />

        <TextField
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange("confirmPassword", value)}
          containerStyle={themed($textField)}
          secureTextEntry
          autoCapitalize="none"
          placeholderTx="registerScreen:confirmPasswordFieldPlaceholder"
        />

        <Text tx="registerScreen:conditions" style={themed($hint)} />

        <Button
          tx="registerScreen:tapToRegister"
          style={themed($tapButton)}
          onPress={handleSubmit}
          disabled={loading}
        />

        <Button
          tx="registerScreen:goToLogin"
          style={themed($tapButton)}
          onPress={() => navigation.navigate("Login")}
        />
      </Screen>
    )
  },
)

const $screenContentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})
