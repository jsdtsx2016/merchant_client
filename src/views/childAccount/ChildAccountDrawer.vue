<template>
    <el-drawer :modal="false" wrapperClosable v-model="drawerVisible" :destroy-on-close="true" size="450px"
        :title="`${drawerProps.title}`">
        <el-form ref="ruleFormRef" label-width="auto" label-suffix=" :" :rules="rules" :disabled="drawerProps.isView"
            :model="drawerProps.row" :hide-required-asterisk="drawerProps.isView">
            <el-alert style="margin-bottom: 10px;" :closable="false" type="warning"
                :title="`员工账号的用户名有前缀，登录的时候要输全，如：${userStore.userInfo.username}-1`"></el-alert>
            <el-form-item label="用户名" prop="username">
                <div style="display: flex;flex: 1;flex-direction: row;gap: 4px;">
                    <span v-if="drawerProps.title == '新增'">{{ userStore.userInfo.username }}-</span>
                    <el-input v-model="drawerProps.row!.username" placeholder="请填写用户名"
                        :readonly="drawerProps.title != '新增'" />
                </div>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="drawerProps.row!.password" type="password"
                    :placeholder="drawerProps.title == '新增' ? '请输入密码' : '不填不修改'">
                </el-input>
            </el-form-item>
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
            <el-form-item label="验证器密钥" prop="sercetKey">
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
            <el-form-item label="冻结" prop="locked">
                <el-select v-model="drawerProps.row!.locked" placeholder="请选择是否冻结" clearable>
                    <el-option label="否" :value="false" />
                    <el-option label="是" :value="true" />
                </el-select>
            </el-form-item>
            <el-form-item label="菜单权限" prop="authMenuList">
                <TreeFilter ref="treeFilterRef" :defaultValue="drawerProps.row.authMenuList" id="path" label="name"
                    multiple :data="menuList" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="drawerVisible = false"> 取消 </el-button>
            <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">
                确定
            </el-button>
        </template>
    </el-drawer>
</template>

<script setup lang="ts" name="ChannelDrawer">
import TreeFilter from "@/components/TreeFilter/index.vue";
import { ref, reactive, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { RefreshRight } from "@element-plus/icons-vue";
import { avatarList } from "@/api/helper/avatars";
import { useAuthStore } from "@/stores/modules/auth";
import { generateSecret } from "@/api/modules/merchant";
import { useUserStore } from "@/stores/modules/user";
import md5 from "md5";
import { Merchant } from "@/api/interface";
const userStore = useUserStore();
const authStore = useAuthStore();
const menuList = computed(() => {
    // 从authStore获取原始菜单列表，然后过滤掉path为"/childAccount"的项
    return authStore.showTreeListGet.filter(item => item.path !== "/childAccount" && item.path !== "/home/index");
});

const resetSercetKey = async () => {
    let result = await generateSecret();
    drawerProps.value.row.sercetKey = result.data;
};
const rules = reactive({
    username: [{ required: true, message: "请填写用户名" }],
    role: [{ required: true, message: "请选择角色" }],
    password: [{ required: true, message: "请输入密码" }],
    locked: [{ required: true, message: "请选择是否冻结" }],
    sercetKey: [{ required: true, message: "请输入密钥" }]
});
interface DrawerProps {
    title: string;
    isView: boolean;
    row: Partial<Merchant.ResChildAccount>;
    api?: (params: any) => Promise<any>;
    getTableList?: () => void;
}
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
    isView: false,
    title: "",
    row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
    params.row.password = "";
    params.row.avatar = (params.row.avatar || (Math.ceil(Math.random() * 9) + "") as any);
    if (params.title == "新增") {
        params.row.authMenuList = ["/walmart/account"];
        params.row.locked = false;
    }
    drawerProps.value = params;
    drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const treeFilterRef = ref<InstanceType<typeof TreeFilter> | null>(null);
const handleSubmit = () => {
    ruleFormRef.value!.validate(async (valid) => {
        if (!valid) return;
        try {
            const row = { ...drawerProps.value.row };
            row.password && (row.password = md5(md5(row.password)));
            const checkedKeys = treeFilterRef.value?.treeRef?.getCheckedKeys() || [];
            row.authMenuList = checkedKeys as string[];
            await drawerProps.value.api!(row);
            ElMessage.success({
                message: `${drawerProps.value.title}成功！`,
            });
            drawerProps.value.getTableList!();
            drawerVisible.value = false;
        } catch (error) {
            console.log(error);
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