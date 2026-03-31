import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import * as CryptoJS from 'crypto-js';
import {
  showFullScreenLoading,
  tryHideFullScreenLoading,
} from "@/components/Loading/fullScreen";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { ResultData } from "@/api/interface";
import { ResultEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { AxiosCanceler } from "./helper/axiosCancel";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
  cancel?: boolean;
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: false,
};

const axiosCanceler = new AxiosCanceler();

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);

    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const userStore = useUserStore();
        // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
        config.cancel ??= true;
        config.cancel && axiosCanceler.addPending(config);
        // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { loading: false } 来控制
        config.loading ??= true;
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === "function") {
          config.headers.set("x-access-token", userStore.token);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      },
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
        const { data, config } = response;

        const userStore = useUserStore();
        axiosCanceler.removePending(config);
        config.loading && tryHideFullScreenLoading();
        // 登录失效
        if (data.code == ResultEnum.OVERDUE) {
          userStore.setToken("");
          router.replace(LOGIN_URL);
          ElMessage.error(data.errmsg);
          return Promise.reject(data);
        }
        // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.errmsg);
          return Promise.reject(data);
        }
        // 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
        return data;
      },
      async (error: AxiosError) => {
        const { response } = error;
        tryHideFullScreenLoading();
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1)
          ElMessage.error("请求超时！请您稍后重试");
        if (error.message.indexOf("Network Error") !== -1)
          ElMessage.error("网络错误！请您稍后重试");
        // 根据服务器响应的错误状态码，做不同的处理
        if (response) checkStatus(response.status);
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      },
    );
  }
  /**
  * 加密请求
  * @param path 请求的路径
  * @param newData 请求的数据，要包含时间戳、签名
  * @param token 登录后需要传token
  * @returns 0：成功、1：签名错误、2：请求超时、3：客户端系统时间不正确
  * @returns 
   */
  encodeRequest(path: string, data: any, token: string = "") {
    data = data || {};
    const { ...newData } = data;
    for (const key in newData) {
      if (newData[key] === undefined) {
        delete newData[key];
      }
      else if (newData[key] === null) {
        delete newData[key];
      }
    }
    // 将参数按照规则排序并拼接
    const sortedParams = Object.keys(newData).sort()
      .map(key => {
        return `${key}=${(Array.isArray(newData[key]) || typeof newData[key] == "object") ? JSON.stringify(newData[key]) : newData[key] || ""}`
      }).join('&');
    const secretKey = CryptoJS.MD5("JYYW2KBYGFKEW3KBKR5EKYLEOI" + token).toString();
    newData.timestamp = Date.now();
    console.log("sortedParams", sortedParams)
    newData.sign = CryptoJS.HmacSHA256(sortedParams, secretKey).toString(CryptoJS.enc.Hex);
    const params = { path, requestData: newData };
    // 初始化向量 (IV)（应为 16 字节的长度）
    const iv = CryptoJS.lib.WordArray.random(16); // 生成随机IV
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(params), secretKey, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted.toString();
  }

  /**
   * @description 常用请求方法封装
   */
  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    const userStore = useUserStore();
    const data = this.encodeRequest(url, params, userStore.getToken());
    return this.service.get("", { params: { key: data }, ..._object });
  }
  post<T>(
    url: string,
    params?: object | string,
    _object = {},
  ): Promise<ResultData<T>> {
    const userStore = useUserStore();
    const data = this.encodeRequest(url, params, userStore.getToken());
    return this.service.post(url, { key: data }, _object);
  }
  upload<T>(
    url: string,
    params?: object | string,
    _object = {},
  ): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: "blob" });
  }
}

export default new RequestHttp(config);
