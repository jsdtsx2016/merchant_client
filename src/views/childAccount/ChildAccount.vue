<template>
    <div class="table-box">
        <ProTable ref="proTable" :columns="columns" :request-api="getTableList" :init-param="initParam"
            :data-callback="dataCallback">
            <template #tableHeader="scope">
                <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增员工账号</el-button>
            </template>
            <template #operation="scope">
                <el-button type="primary" link :icon="EditPen" @click="openDrawer('编辑', scope.row)">
                    编辑
                </el-button>
                <el-button type="danger" link :icon="Delete" @click="deleteSelectChannel(scope.row)">
                    删除
                </el-button>
            </template>
        </ProTable>
        <ChildAccountDrawer ref="childAccountDrawRef" />
    </div>
</template>

<script setup lang="tsx" name="balanceRecords">
import { ref, reactive } from "vue";
import { Merchant } from "@/api/interface";
import { ElMessageBox, dayjs } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ProTableInstance, ColumnProps } from "@/components/ProTable/interface";
import ChildAccountDrawer from "./ChildAccountDrawer.vue";
import { avatarList } from "@/api/helper/avatars";
import {
    CirclePlus, Delete, EditPen
} from "@element-plus/icons-vue";
import {
    editCardMerchantChildAccount,
    getMerchantInfo,
} from "@/api/modules/merchant";
import { useHandleData } from "@/hooks/useHandleData";
import md5 from "md5";
// ProTable 实例
const proTable = ref<ProTableInstance>();
// 如果表格需要初始化请求参数，直接定义传给 ProTable (之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({});

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 list && total && pageNum && pageSize 这些字段，可以在这里进行处理成这些字段
// 或者直接去 hooks/useTable.ts 文件中把字段改为你后端对应的就行
const dataCallback = (data: any) => {
    accountList.value = data.accountList || [];
    return { list: accountList }
};
const accountList = ref<Merchant.ResChildAccount[]>([]);
const getTableList = async (params: any) => {
    return getMerchantInfo();
};

// 表格配置项
const columns = reactive<ColumnProps<Merchant.ResChildAccount>[]>([
    {
        prop: "username",
        label: "用户名"
    },
    {
        prop: "avator",
        label: "头像",
        render: (scope) => {
            return <img style="height:30px" src={avatarList.value[parseInt(scope.row.avatar) - 1]} mode="heightFix" />;
        }
    },
    {
        prop: "locked",
        label: "冻结",
        width: 120,
        enum: [
            { label: "是", value: true },
            { label: "否", value: false },
        ],
        search: {
            el: "tree-select",
            props: { filterable: true },
            tooltip: "是否被冻结",
        },
        fixed: "right",
        render: (scope) => {
            return (
                <>
                    <el-tag type={!scope.row.locked ? "success" : "danger"}>
                        {scope.row.locked ? "是" : "否"}
                    </el-tag>
                </>
            );
        },
    },
    {
        prop: "updateTime",
        label: "登录时间",
        render: (scope) => {
            return (
                <div>{dayjs(scope.row.updateTime).format("YYYY-MM-DD HH:mm:ss")}</div>
            );
        },
        width: 180,
    },
    {
        prop: "createTime",
        label: "创建时间",
        width: 180,
        render: (scope) => {
            return (
                <div>{dayjs(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")}</div>
            );
        },
    },
    { prop: "operation", label: "操作", fixed: "right", width: 150 }
]);
const childAccountDrawRef = ref<InstanceType<typeof ChildAccountDrawer> | null>(null);
const addChildAccount = async (row: Merchant.ResChildAccount) => {
    const item = accountList.value.find(item => item.username === row.username);
    if (item) {
        ElMessageBox.alert("用户名不可重复！");
        return;
    }
    const data = accountList.value.concat();
    data.push(row);
    const result = await editCardMerchantChildAccount({ accountList: data });
    return result;
}
const _editChildAccount = async (row: Merchant.ResChildAccount) => {
    const data = accountList.value.concat();
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.username == row.username) {
            data[i] = { ...row };
            break;
        }
    }
    return await editCardMerchantChildAccount({ accountList: data });
}
const deleteChannel = async (row: Merchant.ResChildAccount) => {
    const data = accountList.value.concat().filter(item => item.username != row.username);
    return await editCardMerchantChildAccount({ accountList: data });
}
const openDrawer = async (title: string, row: Partial<Merchant.ResChildAccount> = {}) => {
    const params = {
        title,
        isView: false,
        row: { ...row },
        api: title == '新增' ? addChildAccount : _editChildAccount,
        getTableList: proTable.value?.getTableList,
    };
    childAccountDrawRef.value?.acceptParams(params);
};
const deleteSelectChannel = async (params: Merchant.ResChildAccount) => {
    await useHandleData(
        deleteChannel,
        { ...params },
        `删除子账号【${params.username}】`,
    );
    proTable.value?.getTableList();
};
</script>