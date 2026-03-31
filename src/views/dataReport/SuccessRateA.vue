<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
            :data-callback="dataCallback" :request-auto="false">
            <template #tableHeader="scope">
                <el-radio-group v-model="dateGroup" size="medium" @change="onDateChange">
                    <el-radio-button label="24小时">24小时</el-radio-button>
                    <el-radio-button label="今天">今天</el-radio-button>
                    <el-radio-button label="昨天">昨天</el-radio-button>
                    <el-radio-button label="最近7天">最近7天</el-radio-button>
                </el-radio-group>
            </template>
            <!-- 表格操作 -->
            <template #operation="scope">
            </template>
        </ProTable>
    </div>
</template>

<script setup lang="tsx" name="productList">
import { ref, reactive, onMounted } from "vue";
import { DataReport, ResPage } from "@/api/interface";
import { useAuthButtons } from "@/hooks/useAuthButtons";
import { dayjs } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { getSuccessRateA } from "@/api/modules/dataReport";

// ProTable 实例
const proTable = ref<ProTableInstance>();

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: ResPage<DataReport.SuccessRateA>) => {
    // const newList: DataReport.SuccessRateA[] = [];
    // const temp: { [key: string]: DataReport.SuccessRateA } = {};
    // for (let i = 0; i < data.list.length; i++) {
    //     const item = data.list[i];
    //     item["id"] = item.agentID;
    //     if (!temp[item.agentID]) {
    //         const parentData = {
    //             agentID: item.agentID,
    //             amount: item.amount,
    //             totalOrders: item.totalOrders,
    //             successOrders: item.successOrders,
    //             agentName: "全部",
    //             id: item.agentID,
    //             children: []
    //         };
    //         temp[item.agentID] = parentData;
    //         newList.push(parentData);
    //     }
    //     else {
    //         const parentData = temp[item.agentID];
    //         parentData.successOrders += item.successOrders;
    //         parentData.totalOrders += item.totalOrders;
    //     }
    //     temp[item.agentID].children.push(item);
    //     temp[item.agentID].children.sort((a, b) => {
    //         if (a.amount > b.amount) {
    //             return 1;
    //         }
    //         else {
    //             return -1;
    //         }
    //     })
    // }
    // data.list = newList;
    return data;
};
const url = ref("");
// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
const getTableList = (params: any) => {
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.updateTime &&
        (newParams.updateStartTime = new Date(newParams.updateTime[0]).getTime());
    newParams.updateTime &&
        (newParams.updateEndTime = new Date(newParams.updateTime[1]).getTime());
    delete newParams.updateTime;
    return getSuccessRateA(newParams);
};
const dateGroup = ref("24小时");
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
        proTable.value!.searchParam.updateTime = [
            dayjs(startTime).format("YYYY-MM-DD HH:mm:ss"),
            dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
        ];
    }
    else {
        proTable.value!.searchParam.updateTime = null;
    }
    proTable.value?.search();
}
onMounted(() => {
    proTable.value!.searchParam.updateTime = [
        dayjs(dayjs().subtract(24, 'hour').valueOf()).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(dayjs().endOf('day').valueOf()).format("YYYY-MM-DD HH:mm:ss")
    ]
    proTable.value?.search();
});
// 页面按钮权限（按钮权限既可以使用 hooks，也可以直接使用 v-auth 指令，指令适合直接绑定在按钮上，hooks 适合根据按钮权限显示不同的内容）
const { BUTTONS } = useAuthButtons();
// 表格配置项
const columns = reactive<ColumnProps<DataReport.SuccessRateA>[]>([
    {
        prop: "updateTime",
        label: "修改时间",
        isShow: false,
        search: {
            el: "date-picker",
            span: 1,
            props: { type: "datetimerange", valueFormat: "YYYY-MM-DD HH:mm:ss" },
            tooltip: "大于等于开始时间且小于等于结束时间",
        },
    },
    {
        prop: "agentID",
        label: "商户编号",
        isShow: false,
        search: { el: "input", tooltip: "商户的编号" },
    },
    {
        prop: "agentName",
        label: "商户",
    },
    // {
    //   prop: "group",
    //   label: "分组",
    //   search: { el: "input", tooltip: "用户的分组" },
    // },
    // {
    //     prop: "amount",
    //     label: "产品面值",
    //     render: (scope) => {
    //         return (
    //             <div>{!scope.row.children ? (scope.row.amount / 100 + '元') : '-'}</div>
    //         );
    //     },
    // },
    {
        prop: "successRate",
        label: "成功率",
        render: (scope) => {
            return (
                <el-progress percentage={scope.row.totalOrders ? (scope.row.successOrders / scope.row.totalOrders * 100).toFixed(2) : 0}></el-progress>
                // <div>{scope.row.totalOrders ? (scope.row.successOrders / scope.row.totalOrders * 100).toFixed(2) : 0}%</div>
            );
        },
    },
    {
        prop: "successOrders",
        label: "成功数",
    },
    {
        prop: "totalOrders",
        label: "总数",
    },
]);
</script>