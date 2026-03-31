/**
 * v-copy
 * 复制某个值至剪贴板
 * 接收参数：string类型/Ref<string>类型/Reactive<string>类型
 */
import type { Directive, DirectiveBinding } from "vue";
import { ElMessage } from "element-plus";
interface ElType extends HTMLElement {
  copyData: string | number;
  __handleClick__: any;
}
const copy: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value;
    el.addEventListener("click", handleClick);
  },
  updated(el: ElType, binding: DirectiveBinding) {
    el.copyData = binding.value;
  },
  beforeUnmount(el: ElType) {
    el.removeEventListener("click", el.__handleClick__);
  },
};

async function handleClick(this: any) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(this.copyData);
    }
    else {
      const copyElem = document.createElement('textarea');
      let styles = copyElem.style;
      styles.position = 'fixed';
      styles.zIndex = '0';
      styles.left = '-500px';
      styles.top = '-500px';
      copyElem.value = this.copyData;
      document.body.appendChild(copyElem);
      copyElem.focus();
      copyElem.select();
      let result = false;
      document.execCommand('copy');
    }
    ElMessage({
      type: "success",
      message: "复制成功",
    });
  } catch (err) {
    ElMessage({
      type: "error",
      message: "复制操作不被支持或失败",
    });
  }
}

export default copy;
