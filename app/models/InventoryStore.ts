import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Toast from "react-native-toast-message"
import configDev from "@/config/config.dev"

// Define the Inventory model
export const InventoryModel = types.model("Inventory", {
  id: types.identifierNumber,
  item: types.string,
  quantity: types.number,
  category: types.string,
})

// Define the InventoryStore model
export const InventoryStoreModel = types
  .model("InventoryStore", {
    inventory: types.array(InventoryModel),
    loading: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    fetchInventory: flow(function* (userId: string) {
      store.setProp("loading", true)
      try {
        const response = yield fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/get/${userId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        )
        if (response.ok) {
          const data = yield response.json()
          store.setProp("inventory", data)
        } else {
          const errorData = yield response.json()
          Toast.show({
            type: "error",
            text1: errorData.message || "Invalid info. Please try again.",
            position: "top",
          })
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        store.setProp("loading", false)
      }
    }),

    addItem: flow(function* (userId: string, newItem: { name: string; quantity: number; category: string }) {
        try {
        const response = yield fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/add/${userId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem),
          }
        )
        if (response.ok) {
          Toast.show({
            type: "success",
            text1: "Item added successfully",
          })
        } else {
          const errorData = yield response.json()
          Toast.show({
            type: "error",
            text1: errorData.message || "Error adding item.",
          })
        }
      } catch (error) {
        console.error("Error adding item:", error)
        Toast.show({
          type: "error",
          text1: "Network error while adding item.",
        })
      }
    }),

    deleteItem: flow(function* (userId: string, itemId: number) {
      try {
        const response = yield fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/delete/${itemId}`,
          {
            method: "DELETE",
          }
        )
        if (response.ok) {
          Toast.show({
            type: "success",
            text1: "Item deleted successfully",
          })
        } else {
          const errorData = yield response.json()
          Toast.show({
            type: "error",
            text1: errorData.message || "Failed to delete item.",
          })
        }
      } catch (error) {
        console.error("Error deleting item:", error)
        Toast.show({
          type: "error",
          text1: "Network error while deleting item.",
        })
      }
    }),

  updateItem: flow(function* (itemId: number, updatedItem: { name: string; quantity: number; category: string }) {
    try {
      const response = yield fetch(
        `${configDev.VITE_LATCH_BACKEND_URL}/api/users/inventory/update/${itemId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        }
      )
      // if (response.ok) {
      //   Toast.show({
      //     type: "success",
      //     text1: "Item updated successfully",
      //   })
      // } else {
      //   const errorData = yield response.json()
      //   Toast.show({
      //     type: "error",
      //     text1: errorData.message || "Failed to update item.",
      //   })
      // }
    } catch (error) {
      console.error("Error updating item:", error)
      // Toast.show({
      //   type: "error",
      //   text1: "Network error while updating item.",
      // })
    }
  })
}))
  .views((store) => ({
    get inventoryForList() {
      return store.inventory
    },
  }))

export interface InventoryStore extends Instance<typeof InventoryStoreModel> {}
export interface InventoryStoreSnapshot extends SnapshotOut<typeof InventoryStoreModel> {}
