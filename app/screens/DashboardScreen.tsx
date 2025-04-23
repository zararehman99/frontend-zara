import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { ImageBackground, View, Text, ViewStyle, TouchableOpacity, TextStyle } from "react-native"
import { Screen, Button } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useStores } from "@/models"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import BabyProfileCard from "@/components/BabyCard"

const latchLogo = require("../../assets/images/latchLogo.png") // latch logo
const dashboardFace = require("../../assets/images/dashboard.jpg") // Background image

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const {
    authenticationStore: { userId, userName, logout },
  } = useStores()
  const [baby, setBaby] = useState([])
  function goNext() {
    navigation.navigate("Chat")
  }

  const getBabies = async () => {
    const response = await fetch(
      `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/get-babies/${userId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    )
    if (response.ok) {
      const data = await response.json()
      setBaby(data)
    } else {
      const errorData = await response.json()
      Toast.show({
        type: "error",
        text1: errorData.message || "invalid info. Please try again.",
        position: "top",
      })
    }
  }

  useEffect(() => {
    getBabies()
  }, [])

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <ImageBackground source={dashboardFace} style={$dashboardStyle} resizeMode="cover">
        {" "}
      </ImageBackground>
      <ImageBackground source={latchLogo} style={$logo} resizeMode="center">
        {" "}
      </ImageBackground>
      <View style={$header}></View>

      {/* Welcome Text */}
      <Text style={$welcomeText}>Welcome, {userName}!</Text>

      {/* Baby Profile Section */}
      {/* <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate("BabyInfo")}>
        <Avatar.Image size={60} source={babyImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.babyName}>Daniel, 2y. 2 mo.</Text>
          <Text style={styles.updateText}>Update profile</Text>
        </View>
        <Icon name="pencil" size={24} color="#6200ea" />
      </TouchableOpacity> */}
      {/* Baby Profile Section */}
      {baby && baby.map((baby) => <BabyProfileCard key={baby.id} baby={baby} />)}

      {/* Get Started Button */}
      <TouchableOpacity style={$button} onPress={() => navigation.navigate("BabyInfo")}>
        <Text style={$buttonText}>Get Started</Text>
      </TouchableOpacity>

      <Button style={$aiButton} textStyle={$buttonText} onPress={goNext}>
        AI Assistant
      </Button>
    </Screen>
  )
})

const $dashboardStyle: ViewStyle = {
  top: 0,
  // flex: 1,
  width: "100%",
  height: "155%",
  position: "absolute",
}

const $welcomeText: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginTop: 20,
  top: 10,
}

const $header: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
  gap: 10,
  position: "absolute",
  left: 20,
  top: 20,
}

const $container: ViewStyle = {
  alignItems: "center",
  backgroundColor: "#F7F8FC",
  flex: 1,
  gap: 20,
  left: 0,
  paddingTop: 50,
  position: "absolute",
  right: 0,
  top: 0,
}

const $button: ViewStyle = {
  marginTop: 30,
  width: "80%",
  backgroundColor: "#2c7a3dcc",
  padding: 15,
  borderRadius: 8,
  alignItems: "center",
  position: "relative",
}

// const styles = StyleSheet.create({
//   container: {
//     alignItems: "center",
//     backgroundColor: BACKGROUND_COLOR,
//     flex: 1,
//     gap: 20,
//     left: 0,
//     paddingTop: 50,
//     position: "absolute",
//     right: 0,
//     top: 0,
//   },
//   header: {
//     alignItems: "center",
//     flexDirection: "row",
//     gap: 10,
//     position: "absolute",
//     left: 20,
//     top: 20,
//   },
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginTop: 20,
//     top: 10,

//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     padding: 15,
//     borderRadius: 12,
//     width: "40%",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//     top: 10,
//   },
//   button: {
//     marginTop: 30,
//     width: "80%",
//     backgroundColor: "#2c7a3dcc",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     position: "relative",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// })

const $logo: ViewStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  margin: 0,
  padding: 20,
}

const $aiButton: ViewStyle = {
  backgroundColor: "#007bffb2",

  marginBottom: 20,
  width: "80%",
}

const $buttonText: TextStyle = {
  color: "#FFFFFF", // Set text color for button text (white)
  fontSize: 16, // Set font size (optional)
  fontWeight: "bold", // Set font weight (optional)
}
