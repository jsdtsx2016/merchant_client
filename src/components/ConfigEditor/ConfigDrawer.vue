<template>
  <el-drawer :modal="false" v-model="drawerVisible" :destroy-on-close="true" :title="`${drawerProps.title}配置数据`">
    <el-form ref="ruleFormRef" label-width="auto" label-suffix=" :" :rules="rules" :disabled="drawerProps.isView"
      :model="drawerProps.row" :hide-required-asterisk="drawerProps.isView">
      <el-form-item v-for="item in drawerProps.columns" :key="item" :label="item.label" :prop="item.prop">
        <el-input
          v-if="drawerProps.typeData[item.prop] != 'img' && drawerProps.typeData[item.prop] != Boolean && drawerProps.typeData[item.prop] != 'i18n'"
          :type="Array.isArray(drawerProps.typeData[item.prop]) ? 'textarea' : 'text'"
          v-model="drawerProps.row![item.prop]" placeholder="请填写数据" autosize clearable />
        <el-select v-if="drawerProps.typeData[item.prop] == Boolean" v-model="drawerProps.row![item.prop]"
          placeholder="请选择是否" clearable>
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
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

<script setup lang="ts" name="ConfigDrawer">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
const rules = reactive({});
interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<any>;
  columns: any[],
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
  _path: string,
  typeData: any
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  columns: [],
  row: {},
  _path: "",
  typeData: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
  for (let i = 0; i < params.columns.length; i++) {
    const item = params.columns[i];
    if (Array.isArray(params.typeData[item.prop])) {
      params.row[item.prop] = (params.row[item.prop] || []).join("\n");
    }
    // if (params.typeData[item.prop] == 'i18n') {
    //   params.row[item.prop] = params.row[item.prop] || {};
    // }
    rules[item.prop] = [{ required: true, message: "不能为空" }];
  }
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return;
    try {
      const data = drawerProps.value.row;
      for (const key in drawerProps.value.typeData) {
        const type = drawerProps.value.typeData[key];
        if (type == Boolean) {
          data[key] = !(data[key] == "false" || data[key] == "0");
        }
        else if (Array.isArray(type)) {
          const array: any[] = data[key].split("\n");
          for (let i = 0; i < array.length; i++) {
            if (type[0] === "" || type[0] === null || type[0] === undefined) {
              array[i] = array[i];
            }
            else if (type[0] == Boolean) {
              array[i] = !(array[i] == "false" || array[i] == "0");
            }
            else {
              array[i] = type[0].call(type[0], array[i]);
            }
          }
          data[key] = array;
        }
        // else if (type == "img") {
        //   data[key] = String(data[key]);
        // }
        else if (type == "i18n") {
          data[key] = data[key];
        }
        else {
          data[key] = type.call(type, data[key]);
        }
      }
      await drawerProps.value.api!({ data: drawerProps.value.row, _path: drawerProps.value._path });
      ElMessage.success({
        message: `${drawerProps.value.title}数据成功！`,
      });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams,
});
</script>