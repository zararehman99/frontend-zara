import { Instance, SnapshotOut, types, flow } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Toast from "react-native-toast-message"
import configDev from "@/config/config.dev"

// Define the Child model
export const ChildModel = types.model("Child", {
  id: types.identifierNumber,
  userId: types.number,
  name: types.string,
  age: types.number,
  weight: types.number,
  height: types.number,
  imageBase: types.maybeNull(types.string),
  birthDate: types.string,
  gender: types.string,
  createdAt: types.string,
  updatedAt: types.string,
  pumpSessions: types.array(types.frozen()), // assuming it's a complex data structure
  healthLogs: types.array(types.frozen()), // assuming it's a complex data structure
  feeds: types.array(types.frozen()), // assuming it's a complex data structure
  sleepLogs: types.array(types.frozen()),
  tushLogs: types.array(types.frozen()),
})

// Define the ChildStore model
export const ChildStoreModel = types
  .model("ChildStore")
  .props({
    children: types.array(ChildModel),
    loading: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    fetchChildren: flow(function* (userId: string) {
      store.setProp("loading", true) // Set loading state
      try {
        const response = yield fetch(
          `${configDev.VITE_LATCH_BACKEND_URL}/api/babies/get-babies/${userId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        )
        if (response.ok) {
          const data = yield response.json()
          store.setProp("children", data) // Update store with fetched data
        } else {
          const errorData = yield response.json()
          Toast.show({
            type: "error",
            text1: errorData.message || "Invalid info. Please try again.",
            position: "top",
          })
        }
      } catch (error) {
        console.error("Error fetching babies:", error)
      } finally {
        store.setProp("loading", false) // Reset loading state
      }
    }),
  }))
  .views((store) => ({
    get childrenForList() {
      return store.children
    },
    getChildById(id: number) {
      return store.children.find((child) => child.id === id)
    },
  }))

export interface ChildStore extends Instance<typeof ChildStoreModel> {}
export interface ChildStoreSnapshot extends SnapshotOut<typeof ChildStoreModel> {}
