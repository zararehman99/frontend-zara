import { observer } from "mobx-react-lite"
import { FC } from "react"
import { ImageBackground, TextStyle, View, ViewStyle } from "react-native"
import { Button, Screen } from "@/components"
import { useStores } from "../models"
import { AppStackScreenProps } from "../navigators"
import { $styles } from "@/theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"

const welcomeFace = require("../../assets/images/welcomeImage.jpg") // Background image

const latchLogo = require("../../assets/images/latchLogo.png") // latch logo

interface BabyInfoScreenProps extends AppStackScreenProps<"BabyInfo"> {}

export const BabyInfoScreen: FC<BabyInfoScreenProps> = observer(function BabyInfocreen(_props) {
  const { navigation, route } = _props
  const {
    authenticationStore: { logout },
  } = useStores()
  const { babyId } = route.params
  function goNext() {
    navigation.navigate("Chat")
  }

  function goToFeeds() {
    navigation.navigate("Feeds", { babyId: babyId })
  }

  function goToBabyHealthSleep() {
    navigation.navigate("BabyHealthSleep", { babyId: babyId })
  }

  function goToPump() {
    navigation.navigate("Pump", { babyId: babyId })
  }

  function goToBabyWellnessTracker() {
    navigation.navigate("TinyTushTracker", { babyId: babyId })
  }
  const $topContainerInsets = useSafeAreaInsetsStyle(["top"])

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <ImageBackground
        source={welcomeFace}
        style={$backgroundImage}
        resizeMode="cover"
      ></ImageBackground>
      {/* <ImageBackground source={latchLogo} style={$logo} resizeMode="center"></ImageBackground> */}
      {/* Logout button at top right */}
      <View style={[$logoutButtonContainer, $topContainerInsets]}>
        <Button style={$logoutButton} textStyle={$buttonText} onPress={() => navigation.goBack()}>
          Back
        </Button>
      </View>

      <View style={$buttonContainer}>
        <Button style={$button} textStyle={$buttonText} onPress={goToFeeds}>
          Feeds
        </Button>
        <Button style={$button} textStyle={$buttonText} onPress={goToBabyHealthSleep}>
          Baby Health & Sleep
        </Button>
        <Button style={$button} textStyle={$buttonText} onPress={goToPump}>
          Pump
        </Button>
        {/* <Button style={$button} textStyle={$buttonText} onPress={goToBabyWellnessTracker}>
        Tiny Tush 
        </Button> */}
        <Button style={$aiButton} textStyle={$buttonText} onPress={goNext}>
          AI Assistant
        </Button>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f3e5f5",
  flex: 1,
  gap: 20,
}

const $logo: ViewStyle = {
  width: "50%",
  height: "22%",
  position: "relative",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  top: 10,
  transform: [{ translateX: -"50%" }],

  padding: 20,
}

const $backgroundImage: ViewStyle = {
  flex: 1,
  width: "100%",
  height: "100%",
  position: "absolute",
}

const $buttonContainer: ViewStyle = {
  flexDirection: "column",
  justifyContent: "center", // Center vertically
  alignItems: "center", // Center horizontally
  gap: 20,
}

const $aiButton: ViewStyle = {
  backgroundColor: "#3B82F6",
  marginBottom: 20,
  width: 200, // Optional: Set fixed width for AI button
  height: 50, // Optional: Set fixed height for AI button
}

const $logoutButtonContainer: ViewStyle = {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 10,
}

const $button: ViewStyle = {
  width: 200, // Fixed width
  height: 50, // Fixed height
  backgroundColor: "#10B981",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 10,
  shadowColor: "#2c6e37",
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
  backgroundColor: "#8B5CF6", // Red color for logout
  width: 100, // Making it smaller than the other buttons
  height: 10,
  borderRadius: 6,
}
