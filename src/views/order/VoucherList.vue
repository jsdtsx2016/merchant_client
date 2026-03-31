<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
            :data-callback="dataCallback">
            <!-- <template #tableHeader="scope">
                <el-button type="primary" :icon="CreditCard"
                    @click="settlementSelection(scope.selectedListIds)">结算</el-button>
            </template> -->
            <!-- 表格操作 -->
            <template #operation="scope">
                <el-button type="info" link :icon="CreditCard" @click="showVoucher(scope.row.token)">
                    查看凭证
                </el-button>
                <el-button type="info" link :icon="Postcard" @click="showDetails('订单列表', scope.row.orderIDList)">
                    订单列表
                </el-button>
            </template>
        </ProTable>
        <el-dialog :title="title" v-model="dialogVisible" width="30%" draggable>
            <json-viewer :value="extraData" :expanded="true" />
        </el-dialog>
    </div>
</template>

<script setup lang="tsx" name="vucherList">
import { ref, reactive } from "vue";
import { Merchant } from "@/api/interface";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { dayjs } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Postcard } from "@element-plus/icons-vue";
import {
    Switch, CreditCard, Money,
} from "@element-plus/icons-vue";
import { getVoucherList, getVoucherURL } from "@/api/modules/merchant";

// ProTable 实例
const proTable = ref<ProTableInstance>();
const extraData = ref<string[]>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
    return data;
};
const dialogVisible = ref<boolean>(false);
const title = ref<string>();
const showVoucher = async (token: string) => {
    const result = await getVoucherURL(token);
    if (result.data) {
        window.open(result.data.url, "_bank");
    }
}
const showDetails = (dialogTitle: string, row: any) => {
    title.value = dialogTitle;
    extraData.value = row;
    dialogVisible.value = true;
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
    delete newParams.createTime;
    return getVoucherList(newParams);
};

// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
const { BUTTONS } = useAuthButtons();

// 表格配置项
const columns = reactive<ColumnProps<Merchant.ResVoucher>[]>([
    // { type: "selection", fixed: "left", width: 70 },
    {
        prop: "createTime",
        label: "结算时间",
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
        prop: "orderCount",
        label: "销量",
    },
    {
        prop: "amount",
        label: "销售额",
        render: (scope) => {
            return (
                <div>{scope.row.totalAmount / 100}元</div>
            );
        },
    },
    {
        prop: "fee",
        label: "总手续费",
        render: (scope) => {
            return (
                <div>{scope.row.totalFee / 100}元</div>
            );
        },
    },
    {
        prop: "fee",
        label: "应结金额",
        render: (scope) => {
            return (
                <div>{(scope.row.totalAmount - scope.row.totalFee) / 100}元</div>
            );
        },
    },
    {
        prop: "actualAmount",
        label: "实际结算",
        render: scope => {
            return (
                <div>{scope.row.actualAmount / 100}元</div>
            )
        }
    },
    {
        prop: "_id",
        label: "凭证编号",
        width: 120,
        search: { el: "input", tooltip: "凭证编号" }
    },
    {
        prop: "operation",
        fixed: "right",
        label: "操作",
        width: 280
    }
]);
</script>