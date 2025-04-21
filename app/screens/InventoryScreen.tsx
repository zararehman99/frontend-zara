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
} from "react-native"
import { AppStackScreenProps } from "../navigators"
import { Screen } from "@/components"
import { useStores } from "@/models"
import Toast from "react-native-toast-message"
import { Picker } from "@react-native-picker/picker"

interface InventoryItem {
  id: string
  item: string
  quantity: number
  category: string
}

interface InventoryScreenProps extends AppStackScreenProps<"Inventory"> {}

export const InventoryScreen: FC<InventoryScreenProps> = observer(function InventoryScreen({
  navigation,
}) {
  const {
    inventoryStore,
    authenticationStore: { userId },
  } = useStores()

  const [quantity, setQuantity] = useState("")
  const [selectedItem, setSelectedItem] = useState("Milk")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [quantityError, setQuantityError] = useState(false)
  const [categoryError, setCategoryError] = useState(false)
  const itemCategoryOptions: Record<string, string[]> = {
    Milk: ["Breast Milk", "Formula Milk"],
    Nappy: ["Size 1", "Size 2", "Size 3", "Size 4"],
    // Nappy: ["1", "2", "3", "4"],
    Wipes: ["Wet", "Dry"],
    Bottle: ["Plastic", "Glass"],
  }

  const handleAddItem = async () => {
    if (isNaN(Number(quantity)) || quantity.trim() === "") {
      setQuantityError(true)
      Toast.show({ type: "error", text1: "Quantity must be a number" })
      return
    }
    if (!selectedCategory) {
      setCategoryError(true)
      Toast.show({ type: "error", text1: "Please select a category" })
      return
    }

    const item = {
      name: selectedItem,
      quantity: Number(quantity),
      category: selectedCategory,
    }
      await inventoryStore.addItem(userId, item)
      inventoryStore.fetchInventory(userId)
  }

  const handleDeleteItem = async (itemId: string) => {
      await inventoryStore.deleteItem(userId, Number(itemId))
      inventoryStore.fetchInventory(userId)
  }

  useEffect(() => {
    if (userId) {
      inventoryStore.fetchInventory(userId)
    }
  }, [userId])

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={$itemCard}>
      <View style={$itemCardContainer}>
        <View>
          <Text style={$itemName}>{item.item}</Text>
          <Text style={$itemDetails}>
            Quantity: {item.quantity} | {item.item === "Nappy" ? "" : "Category:"} {""}
            {item.category}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={$deleteButton}>
          <Text style={$deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Screen preset="scroll" contentContainerStyle={$container}>
      <TouchableOpacity style={$backButton} onPress={() => navigation.goBack()}>
        <Text style={$backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={$heading}>Inventory Management</Text>

      <Text style={$label}>Select Item:</Text>
      <View style={$pickerWrapper}>
        <Picker
          style={$input}
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

      <TextInput
        placeholder="Quantity"
        style={[$input, quantityError && $inputError]}
        value={quantity}
        onChangeText={(text) => {
          setQuantity(text)
          setQuantityError(false)
        }}
        keyboardType="numeric"
      />

      <Text style={$label}>Select {selectedItem === "Nappy" ? "Size" : "Category"}:</Text>
      <View style={[$radioGroup, categoryError && $radioGroupError]}>
        {itemCategoryOptions[selectedItem]?.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[$radioButton, selectedCategory === cat && $radioButtonSelected]}
            onPress={() => {
              setSelectedCategory(cat)
              setCategoryError(false)
            }}
          >
            <Text style={selectedCategory === cat ? $radioTextSelected : $radioText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={$saveButton} onPress={handleAddItem}>
        <Text style={$saveButtonText}>+ Add Item</Text>
      </TouchableOpacity>
      {inventoryStore.loading ? (
        <View style={$loaderWrapper}>
          <Text style={$loaderText}>Loading Inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={inventoryStore.inventoryForList.map((item) => ({
            ...item, // Spread the entire object
            id: String(item.id), // Convert `id` to string for FlatList compatibility
          }))}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={$flatListStyle}
          contentContainerStyle={$contentContainerStyle}
        />
      )}
    </Screen>
  )
})

const $flatListStyle: ViewStyle = {
  width: "100%",
  marginTop: 20,
}

const $contentContainerStyle: ViewStyle = {
  paddingBottom: 20,
}

const $loaderWrapper: ViewStyle = {
  paddingVertical: 32,
  alignItems: "center",
  justifyContent: "center",
}

const $loaderText: TextStyle = {
  fontSize: 16,
  color: "#000",
  fontStyle: "italic",
}

const $container: ViewStyle = {
  padding: 20,
  flexGrow: 1,
  backgroundColor: "#f1f5f9",
  alignItems: "center",
}

const $heading: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center",
}
const $label: TextStyle = {
  fontSize: 16,
  fontWeight: "600",
  marginTop: 10,
  alignSelf: "flex-start",
}
const $input: TextStyle = {
  backgroundColor: "#ffffff",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
  fontSize: 16,
  width: "100%",
}
const $pickerWrapper: ViewStyle = {
  backgroundColor: "#ffffff",
  borderRadius: 8,
  marginBottom: 10,
  width: "100%",
}
const $radioGroup: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 20,
  marginTop: 5,
}
const $radioButton: ViewStyle = {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "#ccc",
  backgroundColor: "#f0f0f0",
  marginRight: 10,
}
const $radioButtonSelected: ViewStyle = {
  backgroundColor: "#007bff",
  borderColor: "#007bff",
}
const $radioText: TextStyle = {
  color: "#000",
}
const $radioTextSelected: TextStyle = {
  color: "#fff",
  fontWeight: "bold",
}
const $saveButton: ViewStyle = {
  backgroundColor: "#4caf50",
  padding: 15,
  borderRadius: 8,
  alignItems: "center",
  width: "100%",
}
const $saveButtonText: TextStyle = {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
}
const $itemCard: ViewStyle = {
  backgroundColor: "#ffffff",
  padding: 15,
  borderRadius: 10,
  marginBottom: 12,
  width: "100%",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 3,
}

const $itemCardContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $itemName: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
}
const $itemDetails: TextStyle = {
  fontSize: 14,
  color: "#555",
  marginTop: 4,
}
const $deleteButton: ViewStyle = {
  backgroundColor: "#dc2626",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
}
const $deleteButtonText: TextStyle = {
  color: "#fff",
  fontWeight: "bold",
}
const $backButton: ViewStyle = {
  alignSelf: "flex-start",
  marginBottom: 10,
}
const $backButtonText: TextStyle = {
  fontSize: 16,
  color: "#007bff",
}

const $inputError: ViewStyle = {
  borderColor: "#dc2626",
  borderWidth: 2,
}

const $radioGroupError: ViewStyle = {
  borderWidth: 2,
  borderColor: "#dc2626",
  borderRadius: 10,
  padding: 6,
}
