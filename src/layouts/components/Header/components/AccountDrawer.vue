<template>
  <el-drawer :modal="false" wrapperClosable v-model="drawerVisible" :destroy-on-close="true" size="480px"
    :title="`${drawerProps.title}`">
    <el-form ref="ruleFormRef" label-width="auto" label-suffix=" :" :rules="rules" :disabled="drawerProps.isView"
      :model="drawerProps.row" :hide-required-asterisk="drawerProps.isView">
      <el-form-item label="头像" prop="type">
        <el-dropdown trigger="click">
          <div class="avatar">
            <img :src="avatarList[parseInt(drawerProps.row.avatar!) - 1]" alt="修改头像" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(avatar, index) in avatarList" :key="avatar"
                @click="drawerProps.row!.avatar = index + 1 + ''">
                <div class="avatar">
                  <img :src="avatar" alt="修改头像" />
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item label="商户号" prop="id">
        <div>{{ drawerProps.row!.id }}</div>
      </el-form-item>
      <el-form-item label="商户名" prop="name">
        <div>{{ drawerProps.row!.name }}</div>
      </el-form-item>
      <el-form-item label="登录账号" prop="username">
        <div>{{ drawerProps.row!.username }}</div>
      </el-form-item>
      <el-form-item label="登录密码" prop="password">
        <el-input v-model="drawerProps.row!.password" type="password" placeholder="不填不修改">
        </el-input>
      </el-form-item>
      <el-form-item label="登录密钥" prop="sercetKey">
        <div class="row">
          <el-tooltip effect="dark" content="点击复制" placement="top">
            <el-link link type="info" :underline="false" v-copy="drawerProps.row!.sercetKey">{{
              drawerProps.row!.sercetKey }}</el-link>
          </el-tooltip>
          <el-tooltip effect="dark" content="生成" placement="top">
            <el-button type="danger" plain :icon="RefreshRight" @click="resetSercetKey"></el-button>
          </el-tooltip>
        </div>
      </el-form-item>
      <el-form-item label="登录验证码" prop="code">
        <el-input v-model="drawerProps.row!.code" placeholder="请输入验证码">
        </el-input>
      </el-form-item>
      <!-- <el-form-item label="IP白名单" prop="ipWhiteListArray">
        <el-input v-model="drawerProps.row!['ipWhiteListArray']" type="textarea" autosize />
      </el-form-item> -->
      <el-form-item label="接口密钥" prop="key">
        <div class="row">
          <!-- <el-input v-model="drawerProps.row!.key" placeholder="不填不修改" type="key" disabled>
          </el-input> -->
          <el-tooltip effect="dark" content="点击复制" placement="top">
            <el-link link type="info" :underline="false" v-copy="drawerProps.row!.key">{{
              drawerProps.row!.key }}</el-link>
          </el-tooltip>
          <el-tooltip effect="dark" content="生成" placement="top">
            <el-button type="danger" plain :icon="RefreshRight" @click="resetKey"></el-button>
          </el-tooltip>
        </div>
      </el-form-item>
      <!-- <el-form-item label="接口回调地址：" prop="notifyUrl">
        <el-input v-model="drawerProps.row!.notifyUrl" placeholder="请填写回调地址">
        </el-input>
      </el-form-item> -->
      <!--
      <el-form-item label="电报群编号" prop="telegramGroupID">
        <el-input v-model="drawerProps.row!.telegramGroupID" placeholder="请填写电报群编号" clearable />
      </el-form-item> -->
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false"> 取消 </el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="AccountDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Merchant } from "@/api/interface";
import { RefreshRight } from "@element-plus/icons-vue";
import { avatarList } from "@/api/helper/avatars";
import { generateSecret } from "@/api/modules/merchant";
import md5 from "md5";
const resetSercetKey = async () => {
  let result = await generateSecret();
  drawerProps.value.row.sercetKey = result.data;
};
const resetKey = async () => {
  drawerProps.value.row.key = md5(Date.now() + "WAdmin" + Math.random()).toUpperCase();
};
const rules = reactive({
  code: [{ required: true, message: "请输入验证码" }],
  notifyUrl: [
    {
      pattern: /^https?:\/\/[^.]+\.[^.]+\S*$/,
      message: "请输入有效的 http/https 回调地址",
      trigger: "blur"
    }
  ]
});
interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<Merchant.ResMerchant>;
  api?: (params: any) => Promise<any>;
  init?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  params.row.avatar = (params.row.avatar || (Math.ceil(Math.random() * 9) + "") as any);
  params.row["ipWhiteListArray"] = params.row.ipWhiteList?.join("\n");
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      const row = { ...drawerProps.value.row };
      // if (row.notifyUrl) {
      //   const reg = /^https?:\/\/.+/
      //   reg.test(row.notifyUrl.trim());
      //   ElMessage.error("回调地址格式错误!")
      //   return;
      // }

      row.password && (row.password = md5(row.password));
      row.ipWhiteList = row["ipWhiteListArray"]?.split("\n") || [];
      delete row["ipWhiteListArray"];
      await drawerProps.value.api!(row);
      drawerVisible.value = false;
      drawerProps.value.init!();
      ElMessage.success({
        message: `${drawerProps.value.title}成功！`,
      });
      // drawerProps.value.getTableList!();
    } catch (error) {
    }
  });
};

defineExpose({
  acceptParams,
});
</script>
<style scoped lang="scss">
.row {
  display: flex;
  flex-direction: row;
  gap: 5px;
  width: 100%;
}

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