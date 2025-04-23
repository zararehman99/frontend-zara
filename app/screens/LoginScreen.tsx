import { observer } from "mobx-react-lite"
import Toast from "react-native-toast-message"
import { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, ImageBackground, TextStyle, ViewStyle, TouchableOpacity } from "react-native"
import { Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "../components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { type ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { ActivityIndicator } from "react-native"
import configDev from "@/config/config.dev"

const loginFace = require("../../assets/images/loginFace.jpg")

export const LoginScreen: FC<AppStackScreenProps<"Login">> = observer(function LoginScreen({
  navigation,
}) {
  const authPasswordInput = useRef<TextInput>(null)

  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      authEmail,
      setAuthEmail,
      setAuthToken,
      setUserId,
      setUserName,
      validationError,
    },
  } = useStores()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    // Here is where you could fetch credentials from keychain or storage
    // and pre-fill the form fields.
    setAuthEmail("test1@gmail.com")
    setAuthPassword("khalid")

    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      setAuthPassword("")
      setAuthEmail("")
    }
  }, [setAuthEmail])

  const error = isSubmitted ? validationError : ""

  const isLoginDisabled = !authEmail.trim() || !authPassword.trim()

  async function login() {
    if (isSubmitted) return
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) {
      setIsSubmitted(false)
      Toast.show({
        type: "error",
        text1: "Invalid Credentials",
        text2: "Please check your inputs",
      })
      return
    }

    try {
      const response = await fetch(`${configDev.VITE_LATCH_BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Something went wrong")
      }

      const data = await response.json()
      if (data.user) {
        const userID = data.user.id
        setUserId(userID.toString())
        setUserName(data.user.firstName)
      }
      if (data.token) {
        setAuthToken(data.token)
        setAuthEmail("")
        setAuthPassword("")
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "You are now logged in",
        })
      } else {
        throw new Error("No token received")
      }
    } catch (error) {
      console.error("Login error:", error.message)
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: error.message || "Something went wrong",
      })
    } finally {
      setIsSubmitted(false)
    }
  }

  //   // Make a request to your server to get an authentication token.
  //   // If successful, reset the fields and set the token.
  //   setIsSubmitted(false)
  //   setAuthPassword("")
  //   setAuthEmail("")

  //   // We'll mock this with a fake token.
  //   setAuthToken(String(Date.now()))
  // }

  function register() {
    navigation.navigate("Register")
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral800],
  )

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <ImageBackground source={loginFace} style={$backgroundImage} resizeMode="cover">
        {" "}
      </ImageBackground>
      {/* <ImageBackground source={loginLogo} style={$logo} resizeMode="cover"></ImageBackground> */}

      <Text
        testID="login-heading"
        tx="loginScreen:welcome"
        preset="heading"
        style={themed($logIn)}
      />
      <Text testID="login-heading" tx="loginScreen:babi" preset="heading" style={themed($logIn)} />
      {/* <Text tx="loginScreen:enterDetails" preset="subheading" style={themed($enterDetails)} /> */}
      {attemptsCount > 2 && (
        <Text tx="loginScreen:hint" size="sm" weight="light" style={themed($hint)} />
      )}

      <TextField
        value={authEmail}
        onChangeText={setAuthEmail}
        containerStyle={$input}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen:emailFieldLabel"
        placeholderTx="loginScreen:emailFieldPlaceholder"
        helper={error}
        status={error ? "error" : undefined}
        onSubmitEditing={() => authPasswordInput.current?.focus()}
      />

      <TextField
        ref={authPasswordInput}
        value={authPassword}
        onChangeText={setAuthPassword}
        containerStyle={$input}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isAuthPasswordHidden}
        labelTx="loginScreen:passwordFieldLabel"
        placeholderTx="loginScreen:passwordFieldPlaceholder"
        onSubmitEditing={login}
        RightAccessory={PasswordRightAccessory}
      />

      <TouchableOpacity
        style={[
          $button,
          { justifyContent: "center" },
          isLoginDisabled && { backgroundColor: "#A5A5A5" },
        ]}
        disabled={isLoginDisabled}
        onPress={login}
      >
        {isSubmitted ? (
          <>
            <Text style={$buttonText}>Loading</Text>
            <ActivityIndicator style={{ marginLeft: 10 }} size="small" color="#FFFFFF" />
          </>
        ) : (
          <Text style={$buttonText}>Tap to Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={$accountButton} onPress={register}>
        <Text style={$buttonText}>Create an Account</Text>
      </TouchableOpacity>
    </Screen>
  )
})

const $backgroundImage: ViewStyle = {
  flex: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
  margin: 0,
  padding: 10,
}

const $logIn: ThemedStyle<TextStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.sm,
})

const $hint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.tint,
  marginBottom: spacing.md,
})

const $input: ViewStyle = {
  width: "80%",
  height: 50,
  marginBottom: 15,
  fontSize: 16,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
  zIndex: 1,
}

const $container: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f3e5f5",
  flex: 1,
  gap: 20,
}

const $button: ViewStyle = {
  marginTop: 30,
  width: "80%",
  backgroundColor: "#16A34A",
  padding: 15,
  borderRadius: 8,
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}

const $accountButton: ViewStyle = {
  width: "80%",
  backgroundColor: "#3B82F6",
  padding: 15,
  borderRadius: 8,
  alignItems: "center",
  position: "relative",
}
