<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
            :data-callback="dataCallback" :request-auto="false" row-key="_id">
            <template #tableHeader="scope">
                <el-radio-group v-model="dateGroup" size="medium" @change="onDateChange">
                    <el-radio-button label="最近15天">最近15天</el-radio-button>
                    <el-radio-button label="1个月">1个月</el-radio-button>
                    <el-radio-button label="2个月">2个月</el-radio-button>
                    <el-radio-button label="3个月">3个月</el-radio-button>
                </el-radio-group>
            </template>
        </ProTable>
    </div>
</template>

<script setup lang="tsx" name="balanceRecords">
import { ref, reactive, onMounted } from "vue";
import { DataReport } from "@/api/interface";
import { dayjs } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { getMergedPayinSellStatistics } from "@/api/modules/dataReport";
const dateGroup = ref("最近15天");
const onDateChange = () => {
    let startTime = 0;
    const now = dayjs();
    switch (dateGroup.value) {
        case "最近15天":
            startTime = dayjs().subtract(15, 'day').startOf('day').valueOf();
            break;
        case "1个月":
            startTime = dayjs().subtract(1, 'month').startOf('day').valueOf();
            break;
        case "2个月":
            startTime = dayjs().subtract(2, 'month').startOf('day').valueOf();
            break;
        case "3个月":
            startTime = dayjs().subtract(3, 'month').startOf('day').valueOf();
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
        dayjs(dayjs().subtract(15, 'day').startOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
    ]
    proTable.value?.search();
});
// ProTable 实例
const proTable = ref<ProTableInstance>();
// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

const dataCallback = (data: any) => {
    return data;
};
const getTableList = async (params: any) => {
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.createTime &&
        (newParams.createStartTime = new Date(newParams.createTime[0]).getTime());
    newParams.createTime &&
        (newParams.createEndTime = new Date(newParams.createTime[1]).getTime());
    delete newParams.createTime;
    return getMergedPayinSellStatistics(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<DataReport.ResSellOrderStatistics>[]>([
    {
        prop: "date",
        label: "日期",
        render: (scope) => {
            return (
                <span>{dayjs(scope.row.date).format("YYYY-MM-DD")}</span>
            );
        },
    },
    {
        prop: "purchasePrice",
        label: "产品销售额",
        render: (scope) => {
            return (
                <div>{scope.row.purchasePriceTotal / 100}元（{scope.row.faceValueTotal / 100}元）</div>
            );
        },
    },
    {
        prop: "suoding",
        label: "产品锁定金额",
        render: (scope) => {
            return (
                <div>{scope.row.purchasePriceLocked > 0 ? '-' : ''}{(scope.row.purchasePriceLocked) / 100}元（{scope.row.faceValueLocked > 0 ? '-' : ''}{(scope.row.faceValueLocked) / 100}元）</div>
            );
        },
    },
    {
        prop: "purchasePrice2",
        label: "产品实际销售额",
        render: (scope) => {
            return (
                <div>{(scope.row.purchasePriceTotal - scope.row.purchasePriceLocked) / 100}元（{(scope.row.faceValueTotal - scope.row.faceValueLocked) / 100}元）</div>
            );
        },
    },
    {
        prop: "amount",
        label: "核销金额",
        render: (scope) => {
            return (
                <div>{(scope.row.amount) / 100}元</div>
            );
        },
    },
    {
        prop: "feeAmount",
        label: "核销手续费",
        render: (scope) => {
            return (
                <div>{(scope.row.feeAmount) / 100}元</div>
            );
        },
    },
    {
        prop: "createTime",
        label: "时间",
        isShow: false,
        search: {
            el: "date-picker",
            span: 1,
            props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
            tooltip: "大于等于开始时间且小于等于结束时间",
        },
    },
]);
</script>