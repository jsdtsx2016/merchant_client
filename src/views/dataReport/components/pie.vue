<template>
  <div class="echarts">
    <ECharts ref="echartsRef" :option="{ option }" />
  </div>
</template>

<script setup lang="ts" name="pie">
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import { ref } from "vue";
const echartsRef = ref<InstanceType<typeof ECharts> | null>(null);
// 接受父组件参数
const data = ref([
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" },
  { value: 0, name: "" }
]);
// 接收父组件传过来的参数
const acceptParams = (params: { value: number, name: string }[], rate: string) => {
  data.value = params;
  option.series![0].data = params;
  option.title!.text = rate;
  echartsRef.value?.getInstance()?.setOption(option);
};
const option: any = {
  title: {
    text: "0%",
    subtext: "成功率",
    left: "50%",
    top: "42%",
    textAlign: "center",
    textStyle: {
      fontSize: 18,
      color: "#767676",
    },
    subtextStyle: {
      fontSize: 15,
      color: "#a1a1a1",
    },
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '2%',
    left: 'center'
  },
  series: [
    {
      name: '',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        position: "outside",
        show: true,
        formatter: "{d}%",
        fontWeight: 400,
        fontSize: 14,
        color: "#a1a1a1",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
};;
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
