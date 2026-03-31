<template>
    <div class="descriptions-container">
        <el-descriptions title="用户信息" :column="2">
            <template #extra>
                <el-button type="primary" @click="openDrawer">编辑</el-button>
            </template>
            <el-descriptions-item label="商户号：">
                {{ merchantInfo?.id }}
            </el-descriptions-item>
            <el-descriptions-item label="商户名称：">
                {{ merchantInfo?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="登录账号">
                {{ merchantInfo?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="接口密钥">
                <el-tooltip effect="dark" content="点击复制" placement="top">
                    <el-link link type="info" :underline="false" v-copy="merchantInfo?.key"> {{ merchantInfo?.key
                        }}</el-link>
                </el-tooltip>
            </el-descriptions-item>
            <!-- <el-descriptions-item label="接口回调地址">
                {{ merchantInfo?.notifyUrl }}
            </el-descriptions-item> -->
            <!-- <el-descriptions-item label="IP白名单：">
                {{ ipWhiteListArray }}
            </el-descriptions-item> -->
        </el-descriptions>
        <AccountDrawer ref="drawerRef" />
    </div>
</template>

<script setup lang="tsx" name="BaseInfo">
import { Merchant } from "@/api/interface";
import { getMerchantInfo } from "@/api/modules/merchant";
import { editSelfAccount } from "@/api/modules/system";
import AccountDrawer from "@/layouts/components/Header/components/AccountDrawer.vue";
import { onMounted, ref } from "vue";

const drawerRef = ref<InstanceType<typeof AccountDrawer> | null>(null);
const merchantInfo = ref<Merchant.ResMerchant | null>(null);
const ipWhiteListArray = ref('');
const size = ref('操作');
const init = async () => {
    const res = await getMerchantInfo();
    merchantInfo.value = res.data;
    ipWhiteListArray.value = merchantInfo.value?.ipWhiteList?.join("\n");
}
onMounted(() => {
    init();
});
// 打开修改密码和个人信息弹窗
const openDrawer = async (row: Partial<Merchant.ResMerchant> = {}) => {
    const params = {
        title: "修改个人信息",
        isView: false,
        row: { ...merchantInfo.value, password: '' },
        api: editSelfAccount,
        init: init
    };
    drawerRef.value?.acceptParams(params);
};
</script>
<style scoped>
.descriptions-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
    padding: 24px;
    background: #ffffff;
}

/* 按钮居中核心样式 */
.btn-container {
    margin-top: 20px;
    /* 和描述列表拉开间距 */
    text-align: center;
    /* 水平居中 */
}

/* 可选：优化按钮样式，和整体风格匹配 */
.btn-container .el-button {
    padding: 8px 20px;
    font-size: 14px;
}

/* 描述列表样式优化（可选） */
.el-descriptions {
    --el-descriptions-item-label-width: 100px;
    /* 统一标签宽度 */
}
</style>