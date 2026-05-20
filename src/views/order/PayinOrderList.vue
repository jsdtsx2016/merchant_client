<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
            :data-callback="dataCallback" :request-auto="false" :show-export="true" @excel="exportExcel">
            <template #tableHeader="scope">
                <el-radio-group v-model="dateGroup" size="medium" @change="onDateChange">
                    <el-radio-button label="24小时">24小时</el-radio-button>
                    <el-radio-button label="今天">今天</el-radio-button>
                    <el-radio-button label="昨天">昨天</el-radio-button>
                    <el-radio-button label="最近7天">最近7天</el-radio-button>
                </el-radio-group>
            </template>
            <template #operation="scope">
                <el-button v-if="scope.row.status == 4" type="info" link :icon="RefreshLeft"
                    @click="onResendnotifyUrl(scope.row)">
                    重发回调
                </el-button>
            </template>
        </ProTable>

        <el-dialog :title="title" v-model="dialogVisible" width="30%" draggable>
            <json-viewer :value="extraData" :expanded="true" />
        </el-dialog>
        <el-dialog :modal="false" draggable v-model="notifyUrlVisible" title="请输入回调地址" width="30%">
            <el-input v-model="notifyUrl" placeholder="请输入回调地址" />
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="notifyUrlVisible = false">取消</el-button>
                    <el-button type="primary" @click="onResendnotifyUrlConfirm">确认</el-button>
                </span>
            </template>
        </el-dialog>
        <PayinOrderDrawer ref="payinOrderDrawer" />

    </div>
</template>

<script setup lang="tsx" name="payinOrderList">
import { ref, reactive, onMounted } from "vue";
import { Merchant } from "@/api/interface";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { dayjs, ElMessage } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Check, Money, RefreshLeft } from "@element-plus/icons-vue";
import PayinOrderDrawer from "./PayinOrderDrawer.vue";
import { exportPayinOrderList, getPayinOrderList, resendNotifyURL } from "@/api/modules/merchant";
const dateGroup = ref("24小时");
const amountInputVisible = ref<boolean>(false);
const MYR = ref();
const exchange = ref(1.71);
const amount = ref();
const onDateChange = () => {
    let startTime = 0;
    let endTime = dayjs().endOf('day').valueOf();
    const now = dayjs();
    switch (dateGroup.value) {
        case "24小时":
            startTime = dayjs().subtract(24, 'hour').valueOf();
            break;
        case "今天":
            startTime = dayjs().startOf('day').valueOf();
            break;
        case "昨天":
            startTime = dayjs().subtract(1, 'day').startOf('day').valueOf();
            endTime = dayjs().subtract(1, 'day').endOf('day').valueOf();
            break;
        case "最近7天":
            startTime = dayjs().subtract(7, 'day').startOf('day').valueOf();
            break;
        case "全部":
            startTime = -1;
            break;
        default:
            break;
    }
    if (startTime != -1) {
        proTable.value!.searchParam.createTime = [
            dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
            dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
        ];
    }
    else {
        proTable.value!.searchParam.createTime = null;
    }
    proTable.value?.search();
}
onMounted(() => {
    proTable.value!.searchParam.createTime = [
        dayjs(dayjs().subtract(24, 'hour').valueOf()).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
    ]
    proTable.value?.search();
    amount.value = MYR.value * exchange.value;
});
// ProTable 实例
const proTable = ref<ProTableInstance>();
const extraData = ref<string[]>();
// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});
// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
    // let startTime = 0;
    // const now = dayjs();
    // switch (dateGroup.value) {
    //     case "24小时":
    //         startTime = now.subtract(24, 'hour').valueOf();
    //         break;
    //     case "48小时":
    //         startTime = now.subtract(48, 'hour').valueOf();
    //         break;
    //     case "最近3天":
    //         startTime = dayjs().subtract(3, 'day').startOf('day').valueOf();
    //         break;
    //     case "最近7天":
    //         startTime = dayjs().subtract(7, 'day').startOf('day').valueOf();
    //         break;
    //     default:
    //         break;
    // }
    // if (startTime != -1) {
    //     proTable.value!.searchParam.createTime = [
    //         dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
    //         dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
    //     ];
    // }
    // else {
    //     proTable.value!.searchParam.createTime = null;
    // }
    return data;
};
const payinOrderDrawer = ref<InstanceType<typeof PayinOrderDrawer> | null>(null);
const dialogVisible = ref<boolean>(false);
const notifyUrlVisible = ref(false);
const notifyUrl = ref("");
const notifyRow = ref<any>();
const title = ref<string>();
// const updatePayInOrder = async (params: Agent.ResPayinOrder) => {
//     await updatePayOrder
//     await useHandleData(
//         updatePayOrder,
//         { orderId: params.id },
//         `更新订单状态【${params.id}】`,
//     );
//     proTable.value?.getTableList();
// }
let _id: string;
const rechargeConfirmed = (data: any) => {
    amount.value = "";
    amountInputVisible.value = true;
    _id = data.id;
    exchange.value = data.exchange;
    MYR.value = 0;
}
const onResendnotifyUrl = (row: any) => {
    notifyUrlVisible.value = true;
    notifyRow.value = row;
    notifyUrl.value = row.notifyUrl || "";
}
const onResendnotifyUrlConfirm = async () => {
    if (!notifyUrl.value) {
        ElMessage.error("请输入回调地址");
        return;
    }
    try {
        const result = await resendNotifyURL({ id: notifyRow.value.id, notifyUrl: notifyUrl.value });
        notifyUrlVisible.value = false;
        proTable.value?.search();
    } catch (error) {
        // ElMessage.error("重发回调失败");
    }
}
// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
const getTableList = (params: any) => {
    // params.showCreateIPAddress = columns.find(
    //   (column) => column.prop == "createIPAddress",
    // )?.isShow;
    // params.showUpdateIPAddress = columns.find(
    //   (column) => column.prop == "updateIPAddress",
    // )?.isShow;
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.createTime &&
        (newParams.createStartTime = new Date(newParams.createTime[0]).getTime());
    newParams.createTime &&
        (newParams.createEndTime = new Date(newParams.createTime[1]).getTime());
    newParams.updateTime &&
        (newParams.updateStartTime = new Date(newParams.updateTime[0]).getTime());
    newParams.updateTime &&
        (newParams.updateEndTime = new Date(newParams.updateTime[1]).getTime());
    delete newParams.createTime;
    delete newParams.updateTime;
    return getPayinOrderList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
const { BUTTONS } = useAuthButtons();
const types = ref<{ label: string, value: number, type: "" | "success" | "info" | "warning" | "danger" }[]>([
    { label: "未支付", value: 0, type: "info" },
    { label: "支付中", value: 1, type: "info" },
    { label: "支付成功", value: 2, type: "success" },
    { label: "回调成功", value: 3, type: "warning" },
    { label: "回调失败", value: 4, type: "danger" },
    { label: "已结算", value: 5, type: "success" },
    { label: "已失效", value: 6, type: "" },
    { label: "订单错误", value: 7, type: "danger" },
    { label: "订单作废", value: 8, type: "" }
])
// 表格配置项
const columns = reactive<ColumnProps<Merchant.ResPayinOrder>[]>([
    // { type: "selection", fixed: "left", width: 70 },
    {
        prop: "id",
        label: "订单号",
        width: 200,
        search: { el: "input", tooltip: "订单号，必须输全，不支持模糊查询" },
        render: (scope) => {
            return (
                <el-tooltip effect="dark" content="点击复制" placement="top">
                    <el-link link underline={false} type="info" v-copy={scope.row.id}>{scope.row.id}</el-link>
                </el-tooltip>
            );
        },
    },

    {
        prop: "productID",
        label: "产品编号",
        width: 90,
        search: { el: "input", tooltip: "产品编号" }
    },
    {
        prop: "productName",
        label: "产品名称",
        width: 90,
        search: { el: "input", tooltip: "产品名称" }
    },
    {
        prop: "merchantOrderID",
        label: "商户订单号",
        width: 200,
        search: { el: "input", tooltip: "产品编号" },
        render: (scope) => {
            return (
                <el-tooltip effect="dark" content="点击复制" placement="top">
                    <el-link link underline={false} type="info" v-copy={scope.row.merchantOrderID}>{scope.row.merchantOrderID}</el-link>
                </el-tooltip>
            );
        },
    },
    {
        prop: "amount",
        label: "人民币",
        render: (scope) => {
            const displayValue = scope.row.amount == null ? '--' : scope.row.amount / 100;
            return (
                <div>{displayValue}</div>
            );
        },
    },
    {
        prop: "fee",
        label: "费率",
        render: (scope) => {
            return (
                <div>{scope.row.fee / 100}%</div>
            );
        },
    },
    {
        prop: "status",
        label: "状态",
        enum: types,
        search: {
            el: "tree-select",
            props: { filterable: true },
            tooltip: "状态",
        },
        width: 100,
        render: (scope) => {
            return (
                <el-tag type={types.value[scope.row.status]?.type || types.value[0].type}>
                    {types.value[scope.row.status]?.label || types.value[0].label}
                </el-tag>
            );
        }
    },
    {
        prop: "subject",
        label: "商品主题",
        width: 90,
        isShow: false
    },
    {
        prop: "body",
        label: "商品描述",
        width: 90,
        isShow: false
    },
    {
        prop: "clientIP",
        label: "客户端IP",
        width: 90,
        isShow: false
    },
    {
        prop: "createTime",
        label: "创建时间",
        width: 160,
        render: (scope) => {
            return (
                <div>{dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")}</div>
            );
        },
        search: {
            el: "date-picker",
            span: 1,
            props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
            tooltip: "大于等于开始时间且小于等于结束时间",
        },
    },
    {
        prop: "updateTime",
        label: "修改时间",
        width: 160,
        render: (scope) => {
            return (
                <div>{dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss")}</div>
            );
        },
        search: {
            el: "date-picker",
            span: 1,
            props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
            tooltip: "大于等于开始时间且小于等于结束时间",
        },
    },
    {
        prop: "operation",
        fixed: "right",
        label: "操作",
        width: 160
    }
]);
const exportExcel = async () => {
    let newParams = JSON.parse(JSON.stringify(proTable.value?.searchParam));
    newParams.createTime &&
        (newParams.createStartTime = new Date(newParams.createTime[0]).getTime());
    newParams.createTime &&
        (newParams.createEndTime = new Date(newParams.createTime[1]).getTime());
    newParams.updateTime &&
        (newParams.updateStartTime = new Date(newParams.updateTime[0]).getTime());
    newParams.updateTime &&
        (newParams.updateEndTime = new Date(newParams.updateTime[1]).getTime());
    delete newParams.createTime;
    delete newParams.updateTime;
    const result = await exportPayinOrderList(newParams);
    // window.open(result.data.fileUrl, "_self");
    const a = document.createElement('a');
    a.href = result.data.fileUrl;
    a.download = ''; // 让浏览器强制下载
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
</script>