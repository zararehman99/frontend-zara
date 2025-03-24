import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, TextStyle, ViewStyle } from "react-native"
import { Screen, Button } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useStores } from "@/models"
import configDev from "@/config/config.dev"
import Toast from "react-native-toast-message"
import { LineChart, BarChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

interface InsightsScreenProps extends AppStackScreenProps<"Insights"> {}

export const InsightsScreen: FC<InsightsScreenProps> = observer(function InsightsScreen({
  navigation,
}) {
  const {
    authenticationStore: { userId, userName },
  } = useStores()
  const [babyData, setBabyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBaby, setSelectedBaby] = useState(null)
  const [timeframe, setTimeframe] = useState("week") // week, month, year

  const screenWidth = Dimensions.get("window").width - 40

  const fetchBabyData = async () => {
    try {
      setLoading(true)
      // First, get the babies
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/get-babies/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      )
      
      if (response.ok) {
        const babies = await response.json()
        
        // For now, using mock data for insights
        // In a real app, you would fetch actual tracking data for each baby
        const babiesWithData = babies.map(baby => ({
          ...baby,
          sleepData: generateMockSleepData(timeframe),
          feedingData: generateMockFeedingData(timeframe),
          growthData: generateMockGrowthData(timeframe),
        }))
        
        setBabyData(babiesWithData)
        
        // Set the first baby as selected by default
        if (babiesWithData.length > 0 && !selectedBaby) {
          setSelectedBaby(babiesWithData[0])
        }
      } else {
        const errorData = await response.json()
        Toast.show({
          type: "error",
          text1: errorData.message || "Failed to load baby data",
          position: "top",
        })
      }
    } catch (error) {
      console.log("error", error)
      Toast.show({
        type: "error",
        text1: "Failed to load data. Please try again.",
        position: "top",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBabyData()
  }, [timeframe])

  // Mock data generators
  const generateMockSleepData = (period) => {
    const labels = period === "week" 
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
      : period === "month" 
        ? ["Week 1", "Week 2", "Week 3", "Week 4"] 
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    return {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 5) + 5), // Random sleep hours between 5-10
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // Royal blue
          strokeWidth: 2,
        },
      ],
      legend: ["Hours of Sleep"],
    }
  }

  const generateMockFeedingData = (period) => {
    const labels = period === "week" 
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
      : period === "month" 
        ? ["Week 1", "Week 2", "Week 3", "Week 4"] 
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    return {
      labels,
      datasets: [
        {
          data: labels.map(() => Math.floor(Math.random() * 4) + 4), // Random feedings between 4-8
          color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`, // Lime green
          strokeWidth: 2,
        },
      ],
      legend: ["Feedings per Day"],
    }
  }

  const generateMockGrowthData = (period) => {
    const labels = period === "week" 
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
      : period === "month" 
        ? ["Week 1", "Week 2", "Week 3", "Week 4"] 
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    let startWeight = 7.5 // Starting weight in pounds
    
    return {
      labels,
      datasets: [
        {
          data: labels.map((_, index) => {
            startWeight += (Math.random() * 0.3) // Small weight gain
            return parseFloat(startWeight.toFixed(1))
          }),
          color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`, // Hot pink
          strokeWidth: 2,
        },
      ],
      legend: ["Weight (lbs)"],
    }
  }

  const chartConfig = {
    backgroundGradientFrom: "#f3e5f5",
    backgroundGradientTo: "#f3e5f5",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <View style={$header}>
        <Text style={$headerText}>Baby Insights</Text>
        <TouchableOpacity style={$backButton} onPress={() => navigation.goBack()}>
          <Text style={$backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={$scrollView} contentContainerStyle={$scrollContent}>
          {babyData.length === 0 ? (
            <View style={$noBabiesContainer}>
              <Text style={$noBabiesText}>No baby profiles found.</Text>
              <Button
                style={$addBabyButton}
                textStyle={$buttonText}
                onPress={() => navigation.navigate("RegisterBaby")}
              >
                Add a Baby
              </Button>
            </View>
          ) : (
            <>
              {/* Baby selector */}
              <View style={$babySelector}>
                <Text style={$selectorLabel}>Select Baby:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$selectorScroll}>
                  {babyData.map((baby) => (
                    <TouchableOpacity
                      key={baby.id}
                      style={[
                        $babyButton,
                        selectedBaby && selectedBaby.id === baby.id && $babyButtonSelected,
                      ]}
                      onPress={() => setSelectedBaby(baby)}
                    >
                      <Text style={[
                        $babyButtonText,
                        selectedBaby && selectedBaby.id === baby.id && $babyButtonTextSelected,
                      ]}>
                        {baby.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Time period selector */}
              <View style={$timeSelector}>
                <Text style={$selectorLabel}>Time Period:</Text>
                <View style={$timeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      $timeButton,
                      timeframe === "week" && $timeButtonSelected,
                    ]}
                    onPress={() => setTimeframe("week")}
                  >
                    <Text style={[
                      $timeButtonText,
                      timeframe === "week" && $timeButtonTextSelected,
                    ]}>
                      Week
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      $timeButton,
                      timeframe === "month" && $timeButtonSelected,
                    ]}
                    onPress={() => setTimeframe("month")}
                  >
                    <Text style={[
                      $timeButtonText,
                      timeframe === "month" && $timeButtonTextSelected,
                    ]}>
                      Month
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      $timeButton,
                      timeframe === "year" && $timeButtonSelected,
                    ]}
                    onPress={() => setTimeframe("year")}
                  >
                    <Text style={[
                      $timeButtonText,
                      timeframe === "year" && $timeButtonTextSelected,
                    ]}>
                      Year
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedBaby && (
                <View style={$chartsContainer}>
                  {/* Sleep Chart */}
                  <View style={$chartCard}>
                    <Text style={$chartTitle}>Sleep Patterns</Text>
                    <LineChart
                      data={selectedBaby.sleepData}
                      width={screenWidth}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={$chart}
                    />
                  </View>

                  {/* Feeding Chart */}
                  <View style={$chartCard}>
                    <Text style={$chartTitle}>Feeding Frequency</Text>
                    <BarChart
                      data={selectedBaby.feedingData}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
                      }}
                      style={$chart}
                    />
                  </View>

                  {/* Growth Chart */}
                  <View style={$chartCard}>
                    <Text style={$chartTitle}>Weight Progress</Text>
                    <LineChart
                      data={selectedBaby.growthData}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
                      }}
                      bezier
                      style={$chart}
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  )
})

const $container: ViewStyle = {
  flex: 1,
  backgroundColor: "#f1f5f9",
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  paddingTop: 40,
  backgroundColor: "#8B5CF6",
}

const $headerText: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  color: "white",
}

const $backButton: ViewStyle = {
  padding: 8,
  borderRadius: 8,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
}

const $backButtonText: TextStyle = {
  color: "white",
  fontWeight: "bold",
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  padding: 20,
  paddingBottom: 40,
}

const $noBabiesContainer: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  marginTop: 40,
}

const $noBabiesText: TextStyle = {
  fontSize: 18,
  textAlign: "center",
  marginBottom: 20,
}

const $addBabyButton: ViewStyle = {
  backgroundColor: "#16A34A",
  padding: 15,
  borderRadius: 8,
  width: "80%",
}

const $buttonText: TextStyle = {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "bold",
}

const $babySelector: ViewStyle = {
  marginBottom: 20,
}

const $selectorLabel: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 8,
}

const $selectorScroll: ViewStyle = {
  flexDirection: "row",
}

const $babyButton: ViewStyle = {
  backgroundColor: "white",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 20,
  marginRight: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2,
}

const $babyButtonSelected: ViewStyle = {
  backgroundColor: "#8B5CF6",
}

const $babyButtonText: TextStyle = {
  fontSize: 16,
  color: "#333",
}

const $babyButtonTextSelected: TextStyle = {
  color: "white",
  fontWeight: "bold",
}

const $timeSelector: ViewStyle = {
  marginBottom: 20,
}

const $timeButtonsContainer: ViewStyle = {
  flexDirection: "row",
}

const $timeButton: ViewStyle = {
  backgroundColor: "white",
  paddingHorizontal: 15,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2,
}

const $timeButtonSelected: ViewStyle = {
  backgroundColor: "#8B5CF6",
}

const $timeButtonText: TextStyle = {
  fontSize: 14,
  color: "#333",
}

const $timeButtonTextSelected: TextStyle = {
  color: "white",
  fontWeight: "bold",
}

const $chartsContainer: ViewStyle = {
  gap: 20,
}

const $chartCard: ViewStyle = {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 4,
}

const $chartTitle: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 12,
  color: "#333",
}

const $chart: ViewStyle = {
  borderRadius: 8,
  marginVertical: 8,
  paddingRight: 16,
}