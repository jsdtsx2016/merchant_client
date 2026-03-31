<template>
    <el-drawer :modal="false" v-model="drawerVisible" :destroy-on-close="true" size="450px"
        :title="`${drawerProps.title}`">
        <el-form ref="ruleFormRef" label-width="auto" label-suffix=" :" :rules="rules" :disabled="drawerProps.isView"
            :model="drawerProps.row" :hide-required-asterisk="drawerProps.isView">
            <el-form-item label="三方订单号" prop="merchantOrderID">
                <el-input v-model="drawerProps.row!.merchantOrderID" :readonly="drawerProps.title == '新增'"
                    placeholder="三方订单号" clearable />
            </el-form-item>
            <el-form-item label="币种" prop="currency">
                <el-input v-model="drawerProps.row!.currency" :readonly="drawerProps.title == '新增'" placeholder="币种"
                    clearable />
            </el-form-item>
            <!-- <el-form-item label="金额(单位分)" prop="amount">
                <el-input v-model="drawerProps.row!.amount" :readonly="drawerProps.title == '新增'" placeholder="金额"
                    clearable />
            </el-form-item> -->
            <el-form-item label="支付结果前端跳转URL" prop="returnUrl">
                <el-input v-model="drawerProps.row!.returnUrl" :readonly="drawerProps.title == '新增'"
                    placeholder="支付结果前端跳转URL" clearable />
            </el-form-item>
            <el-form-item label="支付结果回调URL" prop="notifyUrl">
                <el-input v-model="drawerProps.row!.notifyUrl" :readonly="drawerProps.title == '新增'"
                    placeholder="支付结果后台回调URL" clearable />
            </el-form-item>
            <el-form-item label="商品主题" prop="subject">
                <el-input v-model="drawerProps.row!.subject" :readonly="drawerProps.title == '新增'" placeholder="商品主题"
                    clearable />
            </el-form-item>
            <el-form-item label="商品描述" prop="body">
                <el-input v-model="drawerProps.row!.body" :readonly="drawerProps.title == '新增'" placeholder="商品描述"
                    clearable />
            </el-form-item>
            <el-form-item label="扩展参数" prop="param1">
                <el-input v-model="drawerProps.row!.param1" :readonly="drawerProps.title == '新增'" placeholder="扩展参数"
                    clearable />
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

<script setup lang="ts" name="AgentDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Merchant } from "@/api/interface";
const rules = reactive({
    id: [{ required: true, message: "请填写编号" }],
    name: [{ required: true, message: "请填写名称" }],
    feePercent: [{ required: true, message: "请填写费率" }],
    status: [{ required: true, message: "请选择是否开启" }],
    telegramGroupID: [{ required: true, message: "请填写电报群编号" }],
    key: [{ required: true, message: "请填写接口密钥" }],
    // payInBackUrl: [{ required: true, message: "请填写充值回调地址" }],
});
interface DrawerProps {
    title: string;
    isView: boolean;
    row: Partial<Merchant.ResPayinOrder>;
    api?: (params: any) => Promise<any>;
    getTableList?: () => void;
}
// const resetKey = async () => {
//     drawerProps.value.row.key = md5(Date.now() + "WAdmin" + Math.random()).toUpperCase();
// };
const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
    isView: false,
    title: "",
    row: {},
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
    drawerProps.value = params;
    drawerVisible.value = true;
    params.row.currency = 'cny';
    // drawerProps.value.row.feePercent = drawerProps.value.row.fee! / 100 || 0;
    // params.row["ipWhiteListArray"] = params.row.ipWhiteList?.join("\n");
    // params.row["productListArray"] = params.row.productList?.join("\n");
};

// 提交数据（新增/新增）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
    ruleFormRef.value!.validate(async (valid) => {
        if (!valid) return;
        try {
            await drawerProps.value.api!(drawerProps.value.row);
            ElMessage.success({
                message: `${drawerProps.value.title}成功！`,
            });
            drawerProps.value.getTableList!();
            drawerVisible.value = true;
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
</style>