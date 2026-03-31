import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Asset, ResPage } from "../interface";

export const getConfig = (params: any) => {
    return http.post<any>(PORT1 + `/system/config/getConfig`, params);
};
// 删除配置
export const deleteConfig = (params: { indexList: string[] }) => {
    return http.post(PORT1 + `/system/config/deleteConfig`, params);
};
// 新增配置
export const addConfig = (params: any) => {
    return http.post(PORT1 + `/system/config/addConfig`, params);
};
// 修改配置
export const editConfig = (params: any) => {
    return http.post(PORT1 + `/system/config/editConfig`, params);
};
export const getAssetList = (params: Asset.ReqPage) => {
  return http.post<ResPage<Asset.ResAssetList>>(PORT1 + `/system/asset/asssetList`, params,);
};
export const deleteAsset = (fileName: string) => {
  return http.post<boolean>(PORT1 + `/system/asset/assetDelete`, { fileName });
};