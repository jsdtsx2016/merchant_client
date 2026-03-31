<template>
  <AccountDrawer ref="drawerRef" />
</template>

<script setup lang="ts">
import { System } from "@/api/interface";
import { editSelfAccount } from "@/api/modules/system";
import AccountDrawer from "./AccountDrawer.vue";
import { ref } from "vue";

const drawerRef = ref<InstanceType<typeof AccountDrawer> | null>(null);
const openDrawer = async (row: Partial<System.ResAccount> = {}) => {
  const params = {
    title: "修改个人信息",
    isView: false,
    row: { ...row },
    api: editSelfAccount
  };
  drawerRef.value?.acceptParams(params);
};

defineExpose({ openDrawer });
</script>
