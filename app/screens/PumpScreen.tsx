import { observer } from "mobx-react-lite"
import { FC } from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Button, Text, Screen, Header } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { $styles } from "@/theme"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

interface PumpScreenProps extends AppStackScreenProps<"Pump"> {}

export const PumpScreen: FC<PumpScreenProps> = observer(function PumpScreen(_props) {
  const { themed, theme } = useAppTheme()
  const { navigation } = _props

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const $topContainerInsets = useSafeAreaInsetsStyle(["top"])

  function goBack() {
    navigation.goBack()
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$screenContainer}>
      <Header
        title="Pump Tracking"
        leftIcon="back"
        onLeftPress={goBack}
      />
      
      <ScrollView style={$scrollContainer}>
        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Today's Sessions</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Last Session</Text>
            <Text style={$cardText}>Time: 9:45 AM</Text>
            <Text style={$cardText}>Duration: 18 minutes</Text>
            <Text style={$cardText}>Volume: 4 oz (120 ml)</Text>
            <Button style={$primaryButton} textStyle={$buttonText}>Start New Session</Button>
          </View>
        </View>

        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Inventory</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Stored Milk</Text>
            <Text style={$cardText}>Refrigerated: 12 oz (355 ml)</Text>
            <Text style={$cardText}>Frozen: 28 oz (830 ml)</Text>
            <Text style={$cardText}>Oldest batch: 3 days ago</Text>
            <Button style={$secondaryButton} textStyle={$buttonText}>Update Inventory</Button>
          </View>
        </View>

        <View style={$sectionContainer}>
          <Text style={$sectionTitle}>Stats</Text>
          <View style={$card}>
            <Text style={$cardTitle}>Weekly Summary</Text>
            <Text style={$cardText}>Total sessions: 18</Text>
            <Text style={$cardText}>Average duration: 22 minutes</Text>
            <Text style={$cardText}>Total volume: 52 oz (1540 ml)</Text>
            <Button style={$secondaryButton} textStyle={$buttonText}>View Full Statistics</Button>
          </View>
        </View>
      </ScrollView>

      <View style={[$bottomButtonContainer, $bottomContainerInsets]}>
        <Button
          style={$bottomButton}
          textStyle={$buttonText}
          onPress={goBack}
        >
          Back to Home
        </Button>
      </View>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: "#F8F9FA",
}

const $scrollContainer: ViewStyle = {
  flex: 1,
  paddingHorizontal: 16,
}

const $sectionContainer: ViewStyle = {
  marginTop: 20,
  marginBottom: 10,
}

const $sectionTitle: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
  color: "#333",
}

const $card: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  marginBottom: 16,
}

const $cardTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 12,
  color: "#333",
}

const $cardText: TextStyle = {
  fontSize: 16,
  color: "#555",
  marginBottom: 8,
  lineHeight: 22,
}

const $primaryButton: ViewStyle = {
  backgroundColor: "#FF9500",
  borderRadius: 8,
  marginTop: 12,
  height: 40,
}

const $secondaryButton: ViewStyle = {
  backgroundColor: "#5856D6",
  borderRadius: 8,
  marginTop: 12,
  height: 40,
}

const $bottomButtonContainer: ViewStyle = {
  padding: 16,
  backgroundColor: "#F8F9FA",
}

const $bottomButton: ViewStyle = {
  backgroundColor: "#101519",
  borderRadius: 10,
  height: 50,
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}