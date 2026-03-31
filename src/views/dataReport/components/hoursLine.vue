<template>
    <div class="echarts">
        <ECharts ref="echartsRef" :option="{ option }" />
    </div>
</template>

<script setup lang="ts" name="hoursLine">
import { DashBoard } from "@/api/interface";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { ref } from "vue";

const echartsRef = ref<InstanceType<typeof ECharts> | null>(null);
const hours: string[] = [];
for (let i = 0; i < 24; i++) {
    hours.push(i + ":00");
}

const option: ECOption = {
    title: {
        text: "实时人数",
        textStyle: {
        }
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
            label: {
                backgroundColor: "#6a7985"
            }
        }
    },
    legend: {
        data: ["核销金额", "手续费", "结算金额", "成功率", "订单总数", "提卡数量", "采购金额"],
        textStyle: {
            color: "#a1a1a1"
        }
    },
    toolbox: {
        feature: {
            saveAsImage: {}
        }
    },
    grid: {
        left: "10px",
        right: "30px",
        bottom: "3%",
        containLabel: true
    },
    xAxis: [
        {
            type: "category",
            boundaryGap: false,
            data: hours,
            axisLabel: {
                color: "#a1a1a1"
            }
        }
    ],
    yAxis: [
        {
            type: "value",
            axisLabel: {
                color: "#a1a1a1"
            }
        }
    ],
    series: [
        {
            name: "核销金额",
            type: "line",
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        },
        {
            name: "手续费",
            type: "line",
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        },
        {
            name: "结算金额",
            type: "line",
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        },
        {
            name: "成功率",
            type: "line",
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        },
        {
            name: "提卡数量",
            type: "line",
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        },
        {
            name: "采购金额",
            type: "line",
            label: {
                show: true,
                position: "top"
            },
            areaStyle: {},
            emphasis: {
                focus: "series"
            },
            data: Array(24).fill(0)
        }
    ]
};
const acceptParams = (reportList: DashBoard.PeriodData[]) => {
    const seriesData = {
        "核销金额": Array(24).fill(0),
        "手续费": Array(24).fill(0),
        "结算金额": Array(24).fill(0),
        "成功率": Array(24).fill(0),
        "订单总数": Array(24).fill(0),
        "提卡数量": Array(24).fill(0),
        "采购金额": Array(24).fill(0)
    };
    reportList.forEach(pieData => {
        const hour = pieData.hour;
        if (hour >= 0 && hour < 24) {
            const rate = (pieData.status3Count! + pieData.status5Count!) /
                (
                    pieData.status0Count! +
                    pieData.status1Count! +
                    pieData.status2Count! +
                    pieData.status3Count! +
                    pieData.status4Count! +
                    pieData.status5Count! +
                    pieData.status6Count! +
                    pieData.status7Count!) * 100 || 0;
            seriesData["核销金额"][hour] = (pieData.totalAmount || 0) / 100;
            seriesData["手续费"][hour] = (pieData.totalFee || 0) / 100;
            seriesData["结算金额"][hour] = (pieData.settledAmount || 0) / 100;
            seriesData["成功率"][hour] = parseFloat(rate.toFixed(2));
            seriesData["订单总数"][hour] = pieData.totalCount || 0;
            seriesData["提卡数量"][hour] = pieData.cardCount || 0;
            seriesData["采购金额"][hour] = (pieData.purchaseAmount || 0) / 100;
        }
    });
    (option.series as any[])!.forEach(series => {
        series.data = seriesData[series.name];
    });
    echartsRef.value?.getInstance()?.setOption(option);
};

defineExpose({
    acceptParams,
});
</script>

<style lang="scss" scoped>
.echarts {
    width: 100%;
    height: 100%;
}
</style>
