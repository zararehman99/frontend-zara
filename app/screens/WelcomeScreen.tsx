import { observer } from "mobx-react-lite"
import { FC, useEffect } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
  ScrollView,
} from "react-native"
import { Screen } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useStores } from "@/models"
import BabyProfileCard from "@/components/BabyCard"
import { Shadow } from "react-native-shadow-2"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen({
  navigation,
}) {
  const {
    authenticationStore: { userId, userName, logout },
    childStore,
  } = useStores()

  useEffect(() => {
    childStore.fetchChildren(userId)
  }, [])

  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <View style={$topSection}>
        <Text style={$welcomeHeading}>Welcome Back,</Text>
        <Text style={$userName}>{userName}!</Text>

        <TouchableOpacity style={$logoutButton} onPress={logout}>
          <Text style={$logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={$contentSection}>
        {childStore.loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={$activityIndicator} />
        ) : childStore.childrenForList.length > 0 ? (
          <ScrollView
            contentContainerStyle={$babyListContainer}
            showsVerticalScrollIndicator={false}
          >
            {childStore.childrenForList.map((b) => (
              <BabyProfileCard key={b.id} baby={b} />
            ))}
          </ScrollView>
        ) : (
          <Text style={$emptyStateText}>
            No baby profiles found. Get started by adding a new baby!
          </Text>
        )}
      </View>

      <View style={$actionsSection}>
        <Shadow distance={5} startColor="rgba(99, 102, 241, 0.15)" style={$buttonShadow}>
          <TouchableOpacity
            style={$addBabyButton}
            onPress={() => navigation.navigate("RegisterBaby")}
          >
            <Text style={$buttonText}>Add New Baby</Text>
          </TouchableOpacity>
        </Shadow>

        <Shadow distance={5} startColor="rgba(139, 92, 246, 0.15)" style={$buttonShadow}>
          <TouchableOpacity style={$inventory} onPress={() => navigation.navigate("Inventory")}>
            <Text style={$buttonText}>Manage Inventory</Text>
          </TouchableOpacity>
        </Shadow>

        {/* <Shadow distance={5} startColor="rgba(139, 92, 246, 0.15)" style={$buttonShadow}>
          <TouchableOpacity style={$inventory} onPress={() => navigation.navigate("Calendar")}>
            <Text style={$buttonText}>Manage Calendar</Text>
          </TouchableOpacity>
        </Shadow> */}

        <Shadow distance={5} startColor="rgba(139, 92, 246, 0.15)" style={$buttonShadow}>
          <TouchableOpacity style={$insightsButton} onPress={() => navigation.navigate("Insights")}>
            <Text style={$buttonText}>View Insights</Text>
          </TouchableOpacity>
        </Shadow>

        <Shadow distance={5} startColor="rgba(59, 130, 246, 0.15)" style={$buttonShadow}>
          <TouchableOpacity style={$aiButton} onPress={() => navigation.navigate("Chat")}>
            <Text style={$buttonText}>AI Assistant</Text>
          </TouchableOpacity>
        </Shadow>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#f1f5f9",
  paddingHorizontal: 24,
}

const $activityIndicator: ViewStyle = {
  marginVertical: 30,
}

const $topSection: ViewStyle = {
  paddingTop: 60,
  paddingBottom: 24,
}

const $welcomeHeading: TextStyle = {
  fontSize: 22,
  fontWeight: "500",
  color: "#64748B",
}

const $userName: TextStyle = {
  fontSize: 32,
  fontWeight: "bold",
  color: "#1E293B",
  marginTop: 4,
}

const $logoutButton: ViewStyle = {
  position: "absolute",
  top: 60,
  right: 0,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#EF4444",
}

const $logoutText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: "#EF4444",
}

const $contentSection: ViewStyle = {
  flex: 1,
  paddingVertical: 12,
}

const $babyListContainer: ViewStyle = {
  paddingBottom: 16,
  gap: 16,
}

const $emptyStateText: TextStyle = {
  fontSize: 16,
  color: "#64748B",
  textAlign: "center",
  marginTop: 40,
  lineHeight: 24,
}

const $actionsSection: ViewStyle = {
  paddingVertical: 24,
  gap: 16,
}

const $buttonShadow: ViewStyle = {
  width: "100%",
  borderRadius: 16,
}

const $addBabyButton: ViewStyle = {
  backgroundColor: "#10B981",
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: "center",
}

const $inventory: ViewStyle = {
  backgroundColor: "#10B981",
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: "center",
}

const $insightsButton: ViewStyle = {
  backgroundColor: "#8B5CF6",
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: "center",
}

const $aiButton: ViewStyle = {
  backgroundColor: "#3B82F6",
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: "center",
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "600",
}
