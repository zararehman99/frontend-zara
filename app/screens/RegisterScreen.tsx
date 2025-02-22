import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState, useRef } from "react"
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "@/components"
import { useStores } from "@/models"
import { useAppTheme } from "@/utils/useAppTheme"
import { AppStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme"

export const RegisterScreen: FC<AppStackScreenProps<"Register">> = observer(
  function RegisterScreen({ navigation }) {
    const authPasswordInput = useRef<TextInput>(null)

    const [email, setEmail] = useState("")
    const [fullName, setFullName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const {
      authenticationStore: { setAuthEmail, setAuthToken, validationError },
    } = useStores()

    const {
      themed,
      theme: { colors },
    } = useAppTheme()

    useEffect(() => {
      return () => {
        setEmail("")
        setPassword("")
        setConfirmPassword("")
      }
    }, [])

    function register() {
      setIsSubmitted(true)
      if (!email || !password || password !== confirmPassword) return

      // Mock authentication
      setAuthToken(String(Date.now()))
      navigation.navigate("Login")
    }

    return (
      <Screen preset="auto" contentContainerStyle={themed($screenContentContainer)}>
        {/* <Text tx="registerScreen:welcome" preset="heading" />
        <Text tx="registerScreen:enterDetails" preset="subheading" /> */}

        <TextField
          value={email}
          onChangeText={setEmail}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholderTx="registerScreen:emailFieldPlaceholder"
        />

        <TextField
          value={fullName}
          onChangeText={setFullName}
          containerStyle={themed($textField)}
          autoCapitalize="none"
          placeholderTx="registerScreen:fullNameFieldPlaceholder"
        />

        <TextField
          ref={authPasswordInput}
          value={password}
          onChangeText={setPassword}
          containerStyle={themed($textField)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          placeholderTx="registerScreen:passwordFieldPlaceholder"
        />

        <TextField
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          containerStyle={themed($textField)}
          secureTextEntry
          autoCapitalize="none"
          placeholderTx="registerScreen:confirmPasswordFieldPlaceholder"
        />

        <Text tx="registerScreen:conditions" style={themed($hint)}  />

        <Button tx="registerScreen:tapToRegister" style={themed($tapButton)} onPress={register} />

        <Button tx="registerScreen:goToLogin" style={themed($tapButton)} onPress={() => navigation.navigate("Login")} />
      </Screen>
    )
  }
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