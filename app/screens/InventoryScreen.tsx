import { observer } from "mobx-react-lite"
import { FC, useEffect, useState } from "react"
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native"
import { AppStackScreenProps } from "../navigators"
import { Screen } from "@/components"
import { useStores } from "@/models"
import Toast from "react-native-toast-message"
import configDev from "@/config/config.dev"
import { Picker } from "@react-native-picker/picker"

interface InventoryItem {
  id: string
  name: string
  quantity: number
  category: string
}

interface InventoryScreenProps extends AppStackScreenProps<"Inventory"> {}

export const InventoryScreen: FC<InventoryScreenProps> = observer(function InventoryScreen({
  navigation,
}) {
  const {
    authenticationStore: { userId },
  } = useStores()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [quantity, setQuantity] = useState("")
  const [selectedItem, setSelectedItem] = useState("Milk")
  const [selectedCategory, setSelectedCategory] = useState("")

  const itemCategoryOptions: Record<string, string[]> = {
    Milk: ["Frozen", "Liquid"],
    Diaper: ["XL", "Medium", "Small"],
    Wipes: ["Wet", "Dry"],
    Bottle: ["Plastic", "Glass"],
  }

  const fetchInventory = async () => {
    // setInventory(dummyData)
    try {
      const res = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/get/${userId}`,
      )
      const data = await res.json()
      console.log("data", data)
      setInventory(data)
    } catch (err) {
      console.error("Error fetching inventory", err)
      Toast.show({
        type: "error",
        text1: "Failed to load inventory",
        position: "top",
      })
    }
  }

  const handleAddItem = async () => {
    if (isNaN(Number(quantity))) {
      Toast.show({ type: "error", text1: "Quantity must be a number" })
      return
    }

    const item = {
      name: selectedItem,
      quantity: Number(quantity),
      category: selectedCategory,
    }

    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/add/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        },
      )

      if (response.ok) {
        Toast.show({ type: "success", text1: "Item added successfully!" })
        setQuantity("")
        setSelectedItem("Milk")
        setSelectedCategory("")
        fetchInventory()
      } else {
        const errorData = await response.json()
        Toast.show({ type: "error", text1: errorData.message || "Something went wrong." })
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to add item" })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/inventory/delete/${itemId}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        Toast.show({ type: "success", text1: "Item deleted successfully!" })
        fetchInventory()
      } else {
        const errorData = await response.json()
        Toast.show({ type: "error", text1: errorData.message || "Failed to delete item." })
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Network error while deleting item." })
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.itemCard}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={styles.itemName}>{item.item}</Text>
          <Text style={styles.itemDetails}>
            Quantity: {item.quantity} | Category: {item.category}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Inventory Management</Text>

      {/* Item Picker */}
      <Text style={styles.label}>Select Item:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          style={styles.input}
          selectedValue={selectedItem}
          onValueChange={(itemValue) => {
            setSelectedItem(itemValue)
            setSelectedCategory("")
          }}
        >
          {Object.keys(itemCategoryOptions).map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
      </View>

      {/* Quantity Input */}
      <TextInput
        placeholder="Quantity"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      {/* Category Radio Buttons */}
      <Text style={styles.label}>Select Category:</Text>
      <View style={styles.radioGroup}>
        {itemCategoryOptions[selectedItem]?.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.radioButton, selectedCategory === cat && styles.radioButtonSelected]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={selectedCategory === cat ? styles.radioTextSelected : styles.radioText}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
        <Text style={styles.saveButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Inventory List */}
      <FlatList
        data={inventory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ width: "100%", marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  )
})

const $container: ViewStyle = {
  padding: 20,
  flexGrow: 1,
  backgroundColor: "#f1f5f9",
  alignItems: "center",
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  } as ViewStyle,
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  } as TextStyle,

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  } as TextStyle,
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    alignSelf: "flex-start",
  } as TextStyle,
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    width: "100%",
  } as TextStyle,
  pickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  } as ViewStyle,
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    marginTop: 5,
  } as ViewStyle,
  radioButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  } as ViewStyle,
  radioButtonSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  } as ViewStyle,
  radioText: {
    color: "#000",
  } as TextStyle,
  radioTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  } as TextStyle,
  saveButton: {
    backgroundColor: "#4caf50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  } as ViewStyle,
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  } as TextStyle,
  itemCard: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  } as ViewStyle,
  itemName: {
    fontSize: 18,
    fontWeight: "600",
  } as TextStyle,
  itemDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  } as TextStyle,
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  } as ViewStyle,
  backButtonText: {
    fontSize: 16,
    color: "#007bff",
  } as TextStyle,
})
