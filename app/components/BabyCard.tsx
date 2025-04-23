import React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import { Shadow } from "react-native-shadow-2"
import { useNavigation } from "@react-navigation/native"
import { formatAge } from "@/utils/dateUtils"

const BabyProfileCard = ({ baby }) => {
  const navigation = useNavigation()

  return (
    <Shadow distance={5} startColor="rgba(148, 163, 184, 0.1)" style={styles.shadow}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => navigation.navigate("BabyInfo", { babyId: baby.id })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              baby.profilePic
                ? { uri: baby.profilePic }
                : require("../../assets/images/baby_profile.jpg")
            }
            style={styles.image}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{baby.name}</Text>
          <Text style={styles.age}>{formatAge(baby.birthDate)}</Text>
        </View>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate("BabyInfo", { babyId: baby.id })}
        >
          <Text style={styles.trackText}>Track</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Shadow>
  )
}

const styles = StyleSheet.create({
  shadow: {
    width: "100%",
    borderRadius: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 16,
    padding: 16,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  age: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  trackButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
  },
  trackText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8B5CF6",
  },
})

export default BabyProfileCard
