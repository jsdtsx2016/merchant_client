<template>
  <div class="footer flx-center">
    <div>© 商户管理系统 v{{ version }}</div>
  </div>
</template>
<script setup lang="ts">
import { checkVersion } from "@/api/modules/system";
import { ElMessageBox } from "element-plus";
import { ref, onMounted } from "vue";

const version = ref("1.0.5");
onMounted(async () => {
  // const result = await checkVersion(version.value, "merchant");
  // if (result.data.reload) {
  //   await ElMessageBox.alert(
  //     "检测到有新的版本，如遇重复提示请按Ctrl+F5强制刷新！",
  //     "发现新版本",
  //     {
  //       confirmButtonText: "更新系统",
  //       type: "warning",
  //       showClose: true,
  //     },
  //   );
  //   window.location.reload();
  // }
});
</script>
<style scoped lang="scss">
@import "./index";
</style>
