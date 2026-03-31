import { System } from "../interface";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { ResPage } from "../interface";
import md5 from "md5";
export const checkVersion = (version: string, app: string) => {
  return http.get<{ reload: boolean }>(PORT1 + `/version`, { version, app }, { loading: false });
};

// 编辑自己的账号
export const editSelfAccount = (params: System.ResAccount) => {
  return http.post(PORT1 + `/editSelfAccount`, params);
};