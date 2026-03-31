<template>
  <el-dropdown trigger="click">
    <div class="avatar">
      <img :src="avatarList[avatar - 1] || avatarList[0]" alt="avatar" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="openDialog('infoRef')">
          <el-icon>
            <User />
          </el-icon>{{ $t("header.personalData") }}
        </el-dropdown-item>
        <!-- <el-dropdown-item @click="openDialog('passwordRef')">
          <el-icon>
            <Lock />
          </el-icon>{{ $t("header.safeData") }}
        </el-dropdown-item> -->
        <el-dropdown-item divided @click="logout">
          <el-icon>
            <SwitchButton />
          </el-icon>{{ $t("header.logout") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <!-- infoDialog -->
  <InfoDialog ref="infoRef" />
  <!-- passwordDialog -->
  <PasswordDialog ref="passwordRef" />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { LOGIN_URL } from "@/config";
import { useRouter } from "vue-router";
import { logoutApi } from "@/api/modules/login";
import { useUserStore } from "@/stores/modules/user";
import { ElMessageBox, ElMessage } from "element-plus";
import InfoDialog from "./InfoDialog.vue";
import { avatarList } from "@/api/helper/avatars";
import { getMerchantInfo } from "@/api/modules/merchant";

const router = useRouter();
const userStore = useUserStore();
const avatar = computed(() => userStore.userInfo.avatar);

// 退出登录
const logout = () => {
  ElMessageBox.confirm("您是否确认退出登录?", "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    // 1.执行退出登录接口
    await logoutApi();

    // 2.清除 Token
    userStore.setToken("");

    // 3.重定向到登陆页
    router.replace(LOGIN_URL);
    ElMessage.success("退出登录成功！");
  });
};

// 打开修改密码和个人信息弹窗
const infoRef = ref<InstanceType<typeof InfoDialog> | null>(null);
const openDialog = async (ref: string) => {
  if (ref == "infoRef") {
    const cardmerchantInfoResult = await getMerchantInfo();
    const { password, ...cardmerchant } = cardmerchantInfoResult.data;
    infoRef.value?.openDrawer(cardmerchant);
  }
};
</script>

<style scoped lang="scss">
.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
