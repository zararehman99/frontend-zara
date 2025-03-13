import { observer } from "mobx-react-lite" 
import { FC } from "react"
import { Image, ImageBackground, TextStyle, View, ViewStyle } from "react-native"
import { Button, Text, Screen } from "@/components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { $styles, type ThemedStyle } from "@/theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"


const welcomeFace = require("../../assets/images/9.jpg") // Background image

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(_props) {
  const { themed, theme } = useAppTheme()
  const { navigation } = _props
  const { authenticationStore: { logout } } = useStores()

  function goNext() {
    navigation.navigate("Chat")
  }

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
  <ImageBackground source={welcomeFace} style={$backgroundImage} resizeMode="cover">
  <View style={$buttonContainer}>
          <Button style={$button} onPress={() => console.log("Feeds clicked")}>Feeds</Button>
          <Button style={$button} onPress={() => console.log("Baby Health & Sleep clicked")}>Baby Health & Sleep</Button>
          <Button style={$button} onPress={() => console.log("Pump clicked")}>Pump</Button>
        </View>

        <Button style={$aiButton} onPress={goNext}>
          AI Assistant
        </Button>
  </ImageBackground>
</Screen>

  )
})

const $backgroundImage: ViewStyle = {
  flex: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
}

const $buttonContainer: ViewStyle = {
  flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
}

const $button: ViewStyle = {
  width: 200, // Fixed width
  height: 50, // Fixed height
  backgroundColor: "#007AFF", // Nice blue color
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, // Shadow for Android
}

const $aiButton: ViewStyle = {
  backgroundColor: "#007AFF",
  marginBottom: 20,
}