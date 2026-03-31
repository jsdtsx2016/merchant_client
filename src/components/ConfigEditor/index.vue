<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :data-callback="dataCallback">
            <!-- 表格 header 按钮 -->
            <template #tableHeader="scope">
                <el-button v-show="isArray" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增数据</el-button>
                <el-button v-show="isArray" type="danger" :icon="Delete" plain :disabled="!scope.isSelected"
                    @click="batchDeleteConfig(scope.selectedListIds)">
                    批量删除
                </el-button>
            </template>
            <!-- 表格操作 -->
            <template #operation="scope">
                <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">
                    编辑
                </el-button>
                <el-button v-show="isArray" type="primary" link :icon="Delete" @click="deleteSelectConfig(scope.row)">
                    删除
                </el-button>
            </template>
        </ProTable>
        <ConfigDrawer ref="drawerRef" />
    </div>
</template>
<script setup lang="tsx" name="ConfigEditor">
import ProTable from "@/components/ProTable/index.vue";
import { reactive, ref } from 'vue';
import ConfigDrawer from './ConfigDrawer.vue';
import { addConfig, deleteConfig, editConfig, getConfig } from "@/api/modules/content";
import { ColumnProps, ProTableInstance } from '../ProTable/interface';
import { CirclePlus, Delete, EditPen } from "@element-plus/icons-vue";
import { useHandleData } from '@/hooks/useHandleData';
import { ElMessage } from "element-plus";
// ProTable 实例
const proTable = ref<ProTableInstance>();
// 表格配置项
const columns = reactive<ColumnProps<any>[]>([
]);
const isArray = ref<Boolean>(false);
let _path = "";
let typeData: any = {};
const getTableList = async (params: any) => {
    let result = await getConfig(params);

    while (columns.length) columns.shift();
    const headers = result.data.headers;
    columns.push({ type: "selection", fixed: "left", width: 70 });
    for (const key in headers) {
        if (key == "_path") {
            _path = headers[key];
            columns.splice(1, 0, reactive({
                prop: "_path",
                label: "配置类型",
                enum: result.data.configList,
                fieldNames: { label: "name", value: "value" },
                search: { el: "select", props: { filterable: true, clearable: false }, tooltip: "配置类型（注意：涉及到金额的单位全部都是分）" },
                isShow: false
            }))
        }
        else {
            columns.splice(1, 0, reactive({
                prop: key,
                label: headers[key],
                render: (scope) => {
                    if (typeof scope.row[key] == "boolean") {
                        return (
                            <el-tag type={scope.row[key] ? "success" : "danger"}>
                                {scope.row[key] ? "是" : "否"}
                            </el-tag>
                        )
                    }
                    else {
                        return (
                            <div>{(Array.isArray(scope.row[key]) || (scope.row[key] && scope.row[key]['en'])) ? JSON.stringify(scope.row[key], null, 2) : (scope.row[key] + "")}</div>
                        );
                    }
                },
            }))
        }
    }
    typeData = {};
    const getType = (data: any) => {
        if (typeof data == "boolean") {
            return Boolean;
        }
        else if (typeof data == "string") {
            // if (data.match(/\.(jpeg|jpg|gif|png|bmp|webp)$/) != null) {
            //     return "img";
            // }
            return String;
        }
        else if (typeof data == "number") {
            return Number;
        }
        else if (Array.isArray(data)) {
            return (data[0] == "" || data[0] == 0 || data[0]) ? [getType(data[0])] : [];
        }
        else if (typeof data == "object" && Object.prototype.hasOwnProperty.call(data, "en")) {//国际化
            return "i18n";
        }
        else {
            return null;
        }
    }
    isArray.value = Array.isArray(result.data.list);
    if (!isArray.value) {
        result.data.list = [result.data.list];
    }
    for (const key in result.data.list[0]) {
        const item = result.data.list[0][key];
        typeData[key] = getType(item);
        if (!typeData[key]) {
            ElMessage.error(`配置中的${key}的数据类型不支持`);
        }
    }
    columns.push({ prop: "operation", label: "操作", fixed: "right", width: 150 });
    for (let i = 0; i < result.data.list.length; i++) {
        result.data.list[i].$index = i;
    }
    return result;
};
const dataCallback = (data: any) => {
    return data;
};
const drawerRef = ref<InstanceType<typeof ConfigDrawer> | null>(null);
const openDrawer = async (title: string, row: Partial<any> = {}) => {
    const editColumns: any[] = [];
    for (let i = 0; i < columns.length; i++) {
        const item = columns[i];
        if (item.label && item.prop != '_path' && item.prop != 'operation') {
            editColumns.push({ label: item.label, prop: item.prop });
        }
    }
    const newRow = JSON.parse(JSON.stringify(row));
    const params = {
        title,
        isView: title === "查看",
        row: newRow,
        columns: editColumns,
        api: title === "新增" ? addConfig : title === "编辑" ? editConfig : undefined,
        getTableList: proTable.value?.getTableList,
        _path,
        typeData
    };
    drawerRef.value?.acceptParams(params);
};
// 删除数据
const deleteSelectConfig = async (params: any) => {
    await useHandleData(
        deleteConfig,
        { indexList: [params.$index], _path },
        `删除第 ${params.$index + 1} 行数据`,
    );
    proTable.value?.getTableList();
};
// 批量删除数据
const batchDeleteConfig = async (indexList: string[]) => {
    await useHandleData(deleteConfig, { indexList, _path }, "删除所选数据");
    proTable.value?.clearSelection();
    proTable.value?.getTableList();
};
</script>