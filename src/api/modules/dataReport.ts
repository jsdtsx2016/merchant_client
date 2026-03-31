import { ResExport, ResPage, DataReport } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
//获取产品的成功率
export const getSuccessRate = (params: any) => {
    return http.post<ResPage<DataReport.SuccessRate>>(PORT1 + `/dataReport/successRate`, params);
};
export const getSuccessRateA = (params: any) => {
    return http.post<ResPage<DataReport.SuccessRate>>(PORT1 + `/dataReport/successRateA`, params);
};
export const getMergedPayinSellStatistics = (params: any) => {
  return http.post(PORT1 + `/dataReport/MergedPayinSellStatistics`, params);
};