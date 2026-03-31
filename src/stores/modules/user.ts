import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore({
  id: "w-user",
  state: (): UserState => ({
    token: "",
    userInfo: {
      _id: "",
      username: "",
      password: "",
      role: "",
      sercetKey: "",
      createTime: 0,
      creator: "",
      createIP: "",
      createIPAddress: "",
      updateTime: 0,
      updateIPAddress: "",
      updateIP: "",
      avatar: "",
      token: ""
    },
  }),
  getters: {},
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
    getToken() {
      console.log("token::" + this.token);
      return this.token;
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    },
  },
  persist: piniaPersistConfig("w-user"),
});
