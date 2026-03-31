<template>
  <div>
    <div class="upload-box">
      <div class="upload">
        <template v-if="fileUrl">
          <img :src="fileUrl ? zip : ''" class="upload-image" />
          <div class="upload-handle">
            <el-upload :id="uuid" action="#" :multiple="false" :show-file-list="false" :http-request="handleHttpUpload"
              :on-success="uploadSuccess" :on-error="uploadError" :accept="fileType">
              <div @click.stop v-if="!self_disabled" class="handle-icon" @click="editImg">
                <el-icon>
                  <Upload />
                </el-icon>
              </div>
            </el-upload>
            <div v-if="!self_disabled" class="handle-icon" @click="deleteImg">
              <el-icon>
                <Delete />
              </el-icon>
            </div>
          </div>
        </template>
        <template v-else>
          <el-upload :id="uuid" action="#" :multiple="false" :show-file-list="false" :http-request="handleHttpUpload"
            :on-success="uploadSuccess" :on-error="uploadError" :accept="fileType">
            <div @click.stop class="upload-empty" @click="editImg">
              <slot name="empty">
                <el-icon>
                  <Plus />
                </el-icon>
                <!-- <span>请上传的文件</span> -->
              </slot>
            </div>
          </el-upload>
        </template>
        <div class="el-upload__tip">
          <slot name="tip" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="UploadFile">
import { ref, computed, inject } from "vue";
import { generateUUID } from "@/utils";
import { uploadFile } from "@/api/modules/upload";
import zip from "@/assets/images/zip.jpg";
import {
  ElNotification,
  formContextKey,
  formItemContextKey,
} from "element-plus";
import type { UploadRequestOptions } from "element-plus";
interface UploadFileProps {
  fileUrl: string; // 文件地址 ==> 必传
  fileType?: string[];
  api?: (params: any) => Promise<any>; // 上传的文件的 api 方法，一般项目上传都是同一个 api 方法，在组件里直接引入即可 ==> 非必传
  drag?: boolean; // 是否支持拖拽上传 ==> 非必传（默认为 true）
  disabled?: boolean; // 是否禁用上传组件 ==> 非必传（默认为 false）
  fileSize?: number; // 文件大小限制 ==> 非必传（默认为 5M）
  height?: string; // 组件高度 ==> 非必传（默认为 150px）
  width?: string; // 组件宽度 ==> 非必传（默认为 150px）
  borderRadius?: string; // 组件边框圆角 ==> 非必传（默认为 8px）
}
// 接受父组件参数
const props = withDefaults(defineProps<UploadFileProps>(), {
  fileUrl: "",
  drag: true,
  disabled: false,
  height: "150px",
  width: "150px",
  borderRadius: "8px",
  icon: ""
});

// 生成组件唯一id
const uuid = ref("id-" + generateUUID());

// 获取 el-form 组件上下文
const formContext = inject(formContextKey, void 0);
// 获取 el-form-item 组件上下文
const formItemContext = inject(formItemContextKey, void 0);
// 判断是否禁用上传和删除
const self_disabled = computed(() => {
  return props.disabled || formContext?.disabled;
});

/**
 * @description 文件上传
 * @param options upload 所有配置项
 * */
const emit = defineEmits<{
  "update:fileUrl": [value: string];
}>();
const handleHttpUpload = async (options: UploadRequestOptions) => {
  let formData = new FormData();
  formData.append("file", options.file);
  try {
    const api = props.api ?? uploadFile;
    const { data } = await api(formData);
    emit("update:fileUrl", data.fileUrl);
    // 调用 el-form 内部的校验方法（可自动校验）
    formItemContext?.prop &&
      formContext?.validateField([formItemContext.prop as string]);
  } catch (error) {
    options.onError(error as any);
  }
};

/**
 * @description 删除文件
 * */
const deleteImg = () => {
  emit("update:fileUrl", "");
};
/**
 * @description 编辑文件
 * */
const editImg = () => {
  const dom = document.querySelector(`#${uuid.value} .el-upload__input`);
  dom && dom.dispatchEvent(new MouseEvent("click"));
};

/**
 * @description 文件上传成功
 * */
const uploadSuccess = () => {
  ElNotification({
    title: "温馨提示",
    message: "文件上传成功！",
    type: "success",
  });
};

/**
 * @description 文件上传错误
 * */
const uploadError = () => {
  ElNotification({
    title: "温馨提示",
    message: "文件上传失败，请您重新上传！",
    type: "error",
  });
};
</script>

<style scoped lang="scss">
.upload-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: v-bind(width);
  height: v-bind(height);
  overflow: hidden;
  cursor: pointer;
  border: 1px dashed var(--el-border-color-darker);
  border-radius: v-bind(borderRadius);
  transition: var(--el-transition-duration-fast);
  &:hover {
    border-color: var(--el-color-primary);
    .upload-handle {
      opacity: 1;
    }
  }
}
.upload-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.upload-handle {
  position: absolute;
  top: 0;
  right: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgb(0 0 0 / 60%);
  opacity: 0;
  transition: var(--el-transition-duration-fast);
  .handle-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 6%;
    color: aliceblue;
    .el-icon {
      margin-bottom: 40%;
      font-size: 130%;
      line-height: 130%;
    }
    span {
      font-size: 85%;
      line-height: 85%;
    }
  }
}
.upload-empty {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: v-bind(width);
  height: v-bind(height);
  font-size: 12px;
  line-height: 30px;
  color: var(--el-color-info);
  user-select: none;
  .el-icon {
    font-size: 28px;
    color: var(--el-text-color-secondary);
  }
}
</style>