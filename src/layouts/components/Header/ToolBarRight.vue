<template>
  <div class="tool-bar-ri">
    <div class="header-icon">
      <AssemblySize id="assemblySize" />
      <!-- <Language id="language" /> -->
      <SearchMenu id="searchMenu" />
      <ThemeSetting id="themeSetting" />
      <Fullscreen id="fullscreen" />
    </div>
    <span class="username">{{ username }}</span>
    <!--  <span class="balance">余额：{{ balance / 100 }}元</span>-->
    <Avatar />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useUserStore } from "@/stores/modules/user";
import AssemblySize from "./components/AssemblySize.vue";
import SearchMenu from "./components/SearchMenu.vue";
import ThemeSetting from "./components/ThemeSetting.vue";
import Fullscreen from "./components/Fullscreen.vue";
import Avatar from "./components/Avatar.vue";
import { getMerchantInfo } from "@/api/modules/merchant";

const userStore = useUserStore();
const username = computed(() => userStore.userInfo.username);
// const balance = ref(0);
let lastRefreshTime = 0; // 上次刷新时间
let animationFrameId: number | null = null;
let alertIsShow = false;
// 刷新用户信息
const refeshUserInfo = async () => {
  lastRefreshTime = Date.now(); // 更新上次刷新时间
  const result = await getMerchantInfo(false);
  // balance.value = result.data.balance;
  // if (balance.value < 100 && !alertIsShow) {
  //   alertIsShow = true;
  //   await ElMessageBox.alert('商户余额不足，请到自助充值页面充值', '余额提醒', {
  //     confirmButtonText: '知道了',
  //     type: 'warning',
  //   });
  //   alertIsShow = false;
  //   // router.push('/record/balanceRecharge');
  // }
};

// 时间检查循环
const checkTime = () => {
  const now = Date.now();
  // 如果距离上次刷新超过60秒，执行刷新
  if (now - lastRefreshTime >= 60 * 1000) {
    refeshUserInfo();
  }
  // 继续下一帧检查
  // animationFrameId = requestAnimationFrame(checkTime);
};

onMounted(() => {
  // 初始加载一次
  // refeshUserInfo();
  // 启动时间检查循环
  // animationFrameId = requestAnimationFrame(checkTime);
});

// 组件卸载时停止循环
onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 25px;

  .header-icon {
    display: flex;
    align-items: center;

    &>* {
      margin-left: 21px;
      color: var(--el-header-text-color);
    }
  }

  .username {
    margin-left: 20px;
    font-size: 15px;
    color: var(--el-header-text-color);
  }

  .balance {
    margin-right: 20px;
    margin-left: 10px;
    font-size: 14px;
    color: var(--el-color-primary);
  }
}
</style>
