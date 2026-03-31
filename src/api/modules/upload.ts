import { Upload } from "@/api/interface/index";
import { PORT2 } from "@/api/config/servicePort";
import http from "@/api";
import { UploadRawFile } from "element-plus";

/**
 * @name 文件上传模块
 */
// 文件上传
export const uploadFile = (params: FormData) => {
  return http.upload<Upload.ResFileUrl>(PORT2 + `/upload`, params, {
    cancel: false,
  });
};
// 视频上传
export const uploadVideo = (params: FormData) => {
  return http.upload<Upload.ResFileUrl>(PORT2 + `/upload`, params, {
    cancel: false,
  });
};
