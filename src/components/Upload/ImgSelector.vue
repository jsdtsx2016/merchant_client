<template>
    <el-dialog class="card" title="请选择资源" width="66%" :draggable="true">
        <el-scrollbar v-if="Object.keys(assetList).length">
            <div class="img-list">
                <div v-for="item in assetList" :key="item._id">
                    <el-card :body-style="{ padding: '5px' }" class="imgCard" @click="handleSelected(item.url)">
                        <el-image style="width: 100%" :src="url + item.url" fit="contain" />
                    </el-card>
                </div>
            </div>
        </el-scrollbar>
        <div style="margin-top: 20px;">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :background="true"
                :current-page="pageNum" :page-size="pageSize" layout="total, prev, pager, next, jumper"
                :total="total" />
        </div>
    </el-dialog>
</template>

<script setup lang="ts" name="UploadImg">
import { Asset } from '@/api/interface';
import { getAssetList } from '@/api/modules/content';
import { onMounted, ref } from 'vue';

onMounted(async () => {
    await loadData(pageNum.value, pageSize.value);
});
const assetList = ref<Asset.ResAssetList[]>([]);
const pageNum = ref(1);
const pageSize = ref(14);
const total = ref(0);
const emit = defineEmits<{
    "onSelected": [value: string];
}>();
const url = ref("");
const loadData = async (_pageNum?: number, _pageSize?: number) => {
    const result = await getAssetList({ pageNum: _pageNum || pageNum.value, pageSize: _pageSize || pageSize.value });
    assetList.value = result.data.list;
    pageNum.value = result.data.pageNum;
    pageSize.value = result.data.pageSize;
    total.value = result.data.total;
    url.value = result.data.url;
};
const handleSizeChange = async (size: number) => {
    await loadData(pageNum.value, size);
};
const handleCurrentChange = async (page: number) => {
    await loadData(page, pageSize.value);
};
const handleSelected = async (imageUrl: string) => {
    emit("onSelected", imageUrl);
};
defineExpose({
    loadData,
});
</script>
<style scoped lang="scss">
.img-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, 120px);
    gap: 20px;
    justify-content: space-evenly;
    .imgCard {
        cursor: pointer;
        &:hover {
            transform: scale(0.9);
        }
    }
}
</style>