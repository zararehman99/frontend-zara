import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
} from "react-native"
import { Screen, Button } from "@/components"
import { AppStackScreenProps } from "../navigators"
import { useStores } from "@/models"
import Toast from "react-native-toast-message"
import { LineChart, BarChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { getSnapshot } from "mobx-state-tree"
import { format, parseISO, startOfDay, differenceInDays } from "date-fns"

interface InsightsScreenProps extends AppStackScreenProps<"Insights"> {}

export const InsightsScreen: FC<InsightsScreenProps> = observer(function InsightsScreen({
  navigation,
}) {
  const {
    authenticationStore: { userId },
    childStore
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
      await childStore.fetchChildren(userId)
      const snapshot = getSnapshot(childStore.childrenForList)
      
      if (snapshot && snapshot.length > 0) {
        // Transform the data to include the tracking data
        const babiesWithData = snapshot.map(baby => ({
          ...baby,
          sleepData: generateSleepData(baby.sleepLogs, timeframe),
          feedingData: generateFeedingData(baby.feedLogs, timeframe),
          healthData: generateHealthData(baby.healthLogs, timeframe),
        }))
        
        setBabyData(babiesWithData)
        
        // Set the first baby as selected by default if none selected
        if (babiesWithData.length > 0 && !selectedBaby) {
          setSelectedBaby(babiesWithData[0])
        }
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

  // Get labels based on timeframe
  const getLabels = (timeframe) => {
    const today = new Date()
    
    if (timeframe === "week") {
      // Last 7 days
      return [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return format(d, "EEE")
      })
    } else if (timeframe === "month") {
      // Last 4 weeks
      return ["Week 1", "Week 2", "Week 3", "Week 4"]
    } else {
      // Last 6 months
      return [...Array(6)].map((_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return format(d, "MMM")
      })
    }
  }

  // Sleep data processing
  const generateSleepData = (sleepLogs, timeframe) => {
    const labels = getLabels(timeframe)
    const today = new Date()
    
    // Initialize data array with zeros
    const data = new Array(labels.length).fill(0)
    
    if (sleepLogs && sleepLogs.length > 0) {
      // Process logs based on timeframe
      sleepLogs.forEach(log => {
        const logDate = new Date(log.createdAt)
        
        if (timeframe === "week") {
          const dayIndex = 6 - differenceInDays(today, startOfDay(logDate))
          if (dayIndex >= 0 && dayIndex < 7) {
            data[dayIndex] += log.durationMins / 60 // Convert minutes to hours
          }
        } else if (timeframe === "month") {
          const dayDiff = differenceInDays(today, startOfDay(logDate))
          if (dayDiff >= 0 && dayDiff < 28) {
            const weekIndex = Math.floor(dayDiff / 7)
            if (weekIndex < 4) {
              data[3 - weekIndex] += log.durationMins / 60 // Convert minutes to hours
            }
          }
        } else {
          // Year (6 months)
          const monthDiff = today.getMonth() - logDate.getMonth() + 
            (today.getFullYear() - logDate.getFullYear()) * 12
          if (monthDiff >= 0 && monthDiff < 6) {
            data[5 - monthDiff] += log.durationMins / 60 // Convert minutes to hours
          }
        }
      })
    }
    
    return {
      labels,
      datasets: [
        {
          data: data.map(val => Math.max(val, 0)), // Ensure no negative values
          color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`, // Royal blue
          strokeWidth: 2,
        },
      ],
      legend: ["Hours of Sleep"],
    }
  }

  // Feeding data processing
  const generateFeedingData = (feedLogs, timeframe) => {
    const labels = getLabels(timeframe)
    const today = new Date()
    
    // Initialize data array with zeros
    const data = new Array(labels.length).fill(0)
    
    if (feedLogs && feedLogs.length > 0) {
      // Count feedings for each day/week/month
      feedLogs.forEach(log => {
        const logDate = new Date(log.feedTime || log.createdAt)
        
        if (timeframe === "week") {
          const dayIndex = 6 - differenceInDays(today, startOfDay(logDate))
          if (dayIndex >= 0 && dayIndex < 7) {
            data[dayIndex]++
          }
        } else if (timeframe === "month") {
          const dayDiff = differenceInDays(today, startOfDay(logDate))
          if (dayDiff >= 0 && dayDiff < 28) {
            const weekIndex = Math.floor(dayDiff / 7)
            if (weekIndex < 4) {
              data[3 - weekIndex]++
            }
          }
        } else {
          // Year (6 months)
          const monthDiff = today.getMonth() - logDate.getMonth() + 
            (today.getFullYear() - logDate.getFullYear()) * 12
          if (monthDiff >= 0 && monthDiff < 6) {
            data[5 - monthDiff]++
          }
        }
      })
    }
    
    return {
      labels,
      datasets: [
        {
          data: data,
          color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`, // Lime green
          strokeWidth: 2,
        },
      ],
      legend: ["Feedings per Day"],
    }
  }

  // Health data (weight/growth) processing
  const generateHealthData = (healthLogs, timeframe) => {
    const labels = getLabels(timeframe)
    
    // Start with the baby's initial weight
    let weight = selectedBaby ? selectedBaby.weight : 7.5
    
    // Create a simple growth progression
    const data = labels.map((_, index) => {
      // Small weight gain based on index
      return parseFloat((weight + (index * 0.2)).toFixed(1))
    })
    
    return {
      labels,
      datasets: [
        {
          data,
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
      <TouchableOpacity style={$backButton} onPress={() => navigation.goBack()}>
        <Text style={$backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={$heading}>Insights</Text>

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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={$selectorScroll}
                >
                  {babyData.map((baby) => (
                    <TouchableOpacity
                      key={baby.id}
                      style={[
                        $babyButton,
                        selectedBaby && selectedBaby.id === baby.id && $babyButtonSelected,
                      ]}
                      onPress={() => setSelectedBaby(baby)}
                    >
                      <Text
                        style={[
                          $babyButtonText,
                          selectedBaby && selectedBaby.id === baby.id && $babyButtonTextSelected,
                        ]}
                      >
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
                    style={[$timeButton, timeframe === "week" && $timeButtonSelected]}
                    onPress={() => setTimeframe("week")}
                  >
                    <Text
                      style={[$timeButtonText, timeframe === "week" && $timeButtonTextSelected]}
                    >
                      Week
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[$timeButton, timeframe === "month" && $timeButtonSelected]}
                    onPress={() => setTimeframe("month")}
                  >
                    <Text
                      style={[$timeButtonText, timeframe === "month" && $timeButtonTextSelected]}
                    >
                      Month
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[$timeButton, timeframe === "year" && $timeButtonSelected]}
                    onPress={() => setTimeframe("year")}
                  >
                    <Text
                      style={[$timeButtonText, timeframe === "year" && $timeButtonTextSelected]}
                    >
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
                    <Text style={$chartSubtitle}>Hours of sleep</Text>
                    <LineChart
                      data={selectedBaby.sleepData}
                      width={screenWidth}
                      height={220}
                      chartConfig={chartConfig}
                      bezier
                      style={$chart}
                    />
                    {selectedBaby.sleepLogs && selectedBaby.sleepLogs.length === 0 && (
                      <Text style={$noDataText}>No sleep data available</Text>
                    )}
                  </View>

                  {/* Feeding Chart */}
                  <View style={$chartCard}>
                    <Text style={$chartTitle}>Feeding Frequency</Text>
                    <Text style={$chartSubtitle}>Number of feedings</Text>
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
                    {(!selectedBaby.feedLogs || selectedBaby.feedLogs.length === 0) && (
                      <Text style={$noDataText}>No feeding data available</Text>
                    )}
                  </View>

                  {/* Growth Chart */}
                  <View style={$chartCard}>
                    <Text style={$chartTitle}>Weight Progress</Text>
                    <Text style={$chartSubtitle}>Weight in lbs</Text>
                    <LineChart
                      data={selectedBaby.healthData}
                      width={screenWidth}
                      height={220}
                      chartConfig={{
                        ...chartConfig,
                        color: (opacity = 1) => `rgba(255, 105, 180, ${opacity})`,
                      }}
                      bezier
                      style={$chart}
                    />
                    <Text style={$warningText}>
                      *Weight is estimated based on initial weight of {selectedBaby.weight} lbs
                    </Text>
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
  padding: 20,
  flex: 1,
  backgroundColor: "#f1f5f9",
  alignItems: "center",
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

const $heading: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center",
}

const $backButton: ViewStyle = {
  alignSelf: "flex-start",
  marginBottom: 10,
}

const $backButtonText: TextStyle = {
  fontSize: 16,
  color: "#007bff",
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
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
  textAlign: "center",
  color: "#333",
}

const $chartSubtitle: TextStyle = {
  fontSize: 14,
  textAlign: "center",
  color: "#666",
  marginBottom: 8,
}

const $chart: ViewStyle = {
  borderRadius: 8,
  marginVertical: 8,
  padding: 16,
}

const $noDataText: TextStyle = {
  textAlign: "center",
  fontSize: 14,
  color: "#666",
  fontStyle: "italic",
  marginTop: 10,
}

const $warningText: TextStyle = {
  textAlign: "center",
  fontSize: 12,
  color: "#666",
  fontStyle: "italic",
  marginTop: 5,
}