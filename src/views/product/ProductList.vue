<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
      :data-callback="dataCallback" @darg-sort="sortTable" :key="pageNum" row-key="productID">
      <template #operation="scope">
        <el-button type="primary" link :icon="Edit" @click="showDialog(scope.row)">
          下单
        </el-button>
      </template>
    </ProTable>
    <el-dialog :modal="false" draggable v-model="dialogVisible" title="请选择下单金额" width="30%"
      :close-on-click-modal="false" :show-close="false" :close-on-press-escape="false">
      <el-form ref="ruleFormRef" :model="formData" label-width="auto" label-suffix=" :" :rules="rules">
        <el-form-item label="金额" class="form-item" prop="price" style="flex: 1; min-width: 280px">
          <el-select v-model="formData.price" placeholder="请选择金额" style="width: 100%">
            <el-option v-for="p in prices" :key="p" :label="`${p / 100} 元`" :value="p" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="回调地址" class="form-item" prop="notifyUrl" style="flex: 1; min-width: 280px;">
                    <el-input v-model="formData.notifyUrl" placeholder="请输入回调地址" />
                </el-form-item> -->
        <!-- <el-form-item label="" class="form-item"  style="flex: 1; min-width: 280px;">
                <div style="color: red;">如果你不知道干嘛的，又要模拟下单并测试，那么不用填写回调地址。</div>
                </el-form-item> -->
        <span class="dialog-footer" style="display: flex; justify-content: center; gap: 10px">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="buyProduct">确认</el-button>
        </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="productList">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import { Merchant } from "@/api/interface";
import {
  BuyProduct,
  getMerchantInfo,
  getProductList,
} from "@/api/modules/merchant";
import { Edit } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/modules/user";
const dialogVisible = ref(false);
const prices = ref<number[]>([]);
// const price = ref<number | undefined>()
const currentRow = ref<Partial<Merchant.ResProduct>>();
const userStore = useUserStore();
const pageNum = ref(0);
let formData = reactive({
  notifyUrl: "",
  price: 0,
});
// ProTable 实例
const proTable = ref<ProTableInstance>();
const rules = reactive({
  notifyUrl: [
    // { required: true, message: "请输入回调地址" },
    {
      pattern: /^https?:\/\/[^.]+\.[^.]+\S*$/,
      message: "请输入有效的 http/https 回调地址",
      trigger: "blur",
    },
  ],
});

// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
  return data;
};
const url = ref("");
// 如果你想在请求之前对当前请求参数做一些操作，可以自定义如下函数：params 为当前所有的请求参数（包括分页），最后返回请求列表接口
const getTableList = async (params: any) => {
  return getProductList(params);
};
const showDialog = (row: Partial<Merchant.ResProduct>) => {
  currentRow.value = row;
  // if (currentRow.value.prices && currentRow.value.prices.length == 1) {
  //     buyProduct();
  //     return;
  // }
  console.log(userStore.userInfo);
  // formData.notifyUrl =userStore.userInfo.notifyUrl;
  formData.notifyUrl = "https://api.sifang188.com/api/pay/callBackTest";
  prices.value = row.prices || [];
  dialogVisible.value = true;
  if (prices.value.length) {
    formData.price = prices.value[0];
  }
};
const onCreateOrder = async (row: Partial<Merchant.ResProduct>) => {
  // notifyUrlVisible.value = true;
  await buyProduct();
};
const ruleFormRef = ref<FormInstance>();
const buyProduct = async () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    if (!currentRow.value) {
      ElMessage.error("请输入下单产品");
      return;
    }
    const res = await getMerchantInfo();
    console.log(currentRow.value);
    const params = {
      merchantID: res.data.id,
      productID: currentRow.value!.productID,
      amount: formData.price,
      notifyUrl: formData.notifyUrl,
    };
    const result = await BuyProduct(params);
    if (result.code == 0) {
      userStore.userInfo.notifyUrl = formData.notifyUrl;
      dialogVisible.value = false;
      // notifyUrl.value = "";
      window.open(result.data.cashDeskUrl);
    }
  });
};

// 表格配置项
const columns = reactive<ColumnProps<Merchant.ResProduct>[]>([
  {
    prop: "productID",
    label: "产品编号",
  },
  {
    prop: "productName",
    label: "产品名",
    search: { el: "input", tooltip: "" },
  },
  {
    prop: "prices",
    label: "金额(元)",
    width: 320,
    render: (scope) => {
      const showPrices = scope.row.prices.map((num) => num / 100).join(" ");
      return <div>{showPrices}</div>;
    },
  },
  {
    prop: "fee",
    label: "费率",
    render: (scope) => {
      return <div>{scope.row.fee / 100}%</div>;
    },
  },
  {
    prop: "operation",
    fixed: "right",
    label: "操作",
    width: 280,
  },
]);

// 表格拖拽排序
const sortTable = ({
  newIndex,
  oldIndex,
}: {
  newIndex?: number;
  oldIndex?: number;
}) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};
</script>
