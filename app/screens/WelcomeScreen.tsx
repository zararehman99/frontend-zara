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

  function goToFeeds() {
    navigation.navigate("Feeds")
  }

  function goToBabyHealthSleep() {
    navigation.navigate("BabyHealthSleep")
  }

  function goToPump() {
    navigation.navigate("Pump")
  }

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const $topContainerInsets = useSafeAreaInsetsStyle(["top"])

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <ImageBackground source={welcomeFace} style={$backgroundImage} resizeMode="cover">
        {/* Logout button at top right */}
        <View style={[$logoutButtonContainer, $topContainerInsets]}>
          <Button style={$logoutButton} onPress={logout}>
            Logout
          </Button>
        </View>
        
        <View style={$buttonContainer}>
          <Button style={$button} textStyle={$buttonText}  onPress={goToFeeds}>Feeds</Button>
          <Button style={$button} textStyle={$buttonText} onPress={goToBabyHealthSleep}>Baby Health & Sleep</Button>
          <Button style={$button} textStyle={$buttonText} onPress={goToPump}>Pump</Button>
          <Button style={$aiButton} onPress={goNext}>
            AI Assistant
          </Button>
        </View>

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
  justifyContent: "center", // Center vertically
  alignItems: "center", // Center horizontally
  gap: 20,
}

const $aiButton: ViewStyle = {
  backgroundColor: "#007AFF",
  marginBottom: 20,
  width: 200, // Optional: Set fixed width for AI button
  height: 50, // Optional: Set fixed height for AI button
}

const $logoutButtonContainer: ViewStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  zIndex: 10,
}

const $button: ViewStyle = {
  width: 200, // Fixed width
  height: 50, // Fixed height
  backgroundColor: "#101519", // Nice blue color
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, // Shadow for Android
}

const $buttonText: TextStyle = {
  color: "#FFFFFF", // Set text color for button text (white)
  fontSize: 16, // Set font size (optional)
  fontWeight: "bold", // Set font weight (optional)
}

const $logoutButton: ViewStyle = {
  backgroundColor: "#FF3B30", // Red color for logout
  width: 100, // Making it smaller than the other buttons
  height: 40,
  borderRadius: 8,
}