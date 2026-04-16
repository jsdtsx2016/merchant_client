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
        <span class="dialog-footer" style="display: flex; justify-content: center; gap: 10px">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="buyProduct">确认</el-button>
        </span>
      </el-form>
    </el-dialog>

    <!-- 只加了这个弹窗：下单成功 + a标签打开 -->
    <el-dialog v-model="successDialog" title="下单成功" width="420px" @close="cashDeskUrl = ''">
      <div style="text-align:center; padding: 30px 0;">
        <h3>✅ 下单成功！</h3>
        <p style="margin:15px 0;">请点击下方按钮打开收银台进行支付</p>
        <a :href="cashDeskUrl" target="_blank" rel="noopener"
          style="display:inline-block; padding:8px 20px; background:#409eff; color:#fff; border-radius:4px; text-decoration:none">
          打开收银台
        </a>
      </div>
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
// 只加了这2个变量
const successDialog = ref(false);
const cashDeskUrl = ref('');

const prices = ref<number[]>([]);
const currentRow = ref<Partial<Merchant.ResProduct>>();
const userStore = useUserStore();
const pageNum = ref(0);
let formData = reactive({
  notifyUrl: "",
  price: 0,
});
const proTable = ref<ProTableInstance>();
const rules = reactive({
  notifyUrl: [
    {
      pattern: /^https?:\/\/[^.]+\.[^.]+\S*$/,
      message: "请输入有效的 http/https 回调地址",
      trigger: "blur",
    },
  ],
});
const initParam = reactive({});
const dataCallback = (data: any) => {
  return data;
};
const url = ref("");
const getTableList = async (params: any) => {
  return getProductList(params);
};
const showDialog = (row: Partial<Merchant.ResProduct>) => {
  currentRow.value = row;
  formData.notifyUrl = "http://127.0.0.1/api/pay/callBackTest";//"https://api.sifang188.com/api/pay/callBackTest";
  prices.value = row.prices || [];
  dialogVisible.value = true;
  if (prices.value.length) {
    formData.price = prices.value[0];
  }
};
const onCreateOrder = async (row: Partial<Merchant.ResProduct>) => {
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

      // 改动只有这里：不直接跳转，弹出成功窗口 + 保存url
      cashDeskUrl.value = result.data.cashDeskUrl;
      successDialog.value = true;
    }
  });
};
const columns = reactive<ColumnProps<Merchant.ResProduct>[]>([
  { prop: "productID", label: "产品编号" },
  { prop: "productName", label: "产品名", search: { el: "input", tooltip: "" } },
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
  { prop: "operation", fixed: "right", label: "操作", width: 280 },
]);
const sortTable = ({ newIndex, oldIndex }: { newIndex?: number; oldIndex?: number }) => {
  console.log(newIndex, oldIndex);
  console.log(proTable.value?.tableData);
  ElMessage.success("修改列表排序成功");
};
</script>