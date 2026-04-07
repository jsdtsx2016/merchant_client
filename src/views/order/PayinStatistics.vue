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
import { Merchant } from "@/api/interface";
import { dayjs } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { getPayinStatistics } from "@/api/modules/merchant";
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
    const totalData = data.list.reduce((prev, curr) => {
        return {
            amount: prev.amount + curr.amount,
            feeAmount: prev.feeAmount + curr.feeAmount
        };
    }, { amount: 0, feeAmount: 0 });
    data.list.unshift({
        date: 0,
        agentName: "全部",
        amount: totalData.amount,
        feeAmount: totalData.feeAmount
    });
    data.list.forEach((item: any) => {
        item.zonghelv = item.feeAmount / item.amount;
        item.children?.sort((a: any, b: any) => {
            return b.feeAmount - a.feeAmount;
        });
        item.children?.forEach((child: any) => {
            child.zonghelv = child.feeAmount / child.amount;
        });
    });
    //检查综合费率数据，如果比后一条数据是增长则显示红色，下降则显示绿色
    data.list.forEach((item: any, index: number) => {
        if (index === 0 || index === data.list.length - 1) {
            item.zonghelvColor = "black";
        }
        else {
            if (item.zonghelv > data.list[index + 1].zonghelv) {
                item.zonghelvColor = "red";
            }
            else if (item.zonghelv < data.list[index + 1].zonghelv) {
                item.zonghelvColor = "green";
            }
            else {
                item.zonghelvColor = "black";
            }
        }
        //child根据后一条数据里面的children里面的相同产品名称，也进行检查综合费率数据，如果比后一条数据是增长则显示红色，下降则显示绿色
        item.children?.forEach((child: any, childIndex: number) => {
            //找到后一条数据里面的相同产品名称的数据
            const nextChildren = data.list[index + 1]?.children || [];
            let nextItemChild: any = null;
            nextChildren.forEach((nextChild: any) => {
                if (nextChild.productName === child.productName) {
                    nextItemChild = nextChild;
                }
            });
            if (nextItemChild && child.zonghelv > nextItemChild.zonghelv) {
                child.zonghelvColor = "red";
            }
            else if (nextItemChild && child.zonghelv < nextItemChild.zonghelv) {
                child.zonghelvColor = "green";
            }
            else {
                child.zonghelvColor = "black";
            }
        });
    });
    return data;
};
const getTableList = async (params: any) => {
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.createTime &&
        (newParams.createStartTime = new Date(newParams.createTime[0]).getTime());
    newParams.createTime &&
        (newParams.createEndTime = new Date(newParams.createTime[1]).getTime());
    delete newParams.createTime;
    return getPayinStatistics(newParams);
};

// 表格配置项
const columns = reactive<ColumnProps<Merchant.ResPayinOrder>[]>([
    {
        prop: "date",
        label: "日期",
        render: (scope) => {
            return (
                <span>{scope.row.date ? dayjs(scope.row.date).format("YYYY-MM-DD") : "总计"}</span>
            );
        },
    },
    {
        prop: "productID",
        label: "产品号",
        search: { el: "input", tooltip: "产品编号" },
        render: (scope) => {
            return (
                <div>{scope.row.productID || "全部"}</div>
            );
        },
    },
    {
        prop: "productName",
        label: "产品",
        render: (scope) => {
            return (
                <div>{scope.row.productName || "全部"}</div>
            );
        },
    },
    {
        prop: "amount",
        label: "金额",
        render: (scope) => {
            return (
                <div>{(scope.row.amount) / 100}元</div>
            );
        },
    },
    {
        prop: "feeAmount",
        label: "手续费",
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