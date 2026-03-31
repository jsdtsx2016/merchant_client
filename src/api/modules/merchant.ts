import { ResExport, ResPage, Merchant } from "@/api/interface/index";
import { PORT1, PORT2 } from "@/api/config/servicePort";
import http from "@/api";
// 获取商户信息
export const getMerchantInfo = (loading = true) => {
  return http.post<Merchant.ResMerchant>(PORT1 + `/merchantInfo`, {}, { loading });
};

// 生成密钥
export const generateSecret = () => {
  return http.post<string>(PORT1 + `/generateSecret`);
};
export const editCardMerchantChildAccount = (params: { accountList: Merchant.ResChildAccount[] }) => {
  return http.post(PORT1 + `/editCardMerchantChildAccount`, params);
}
// 充值记录
export const getPayinOrderList = (params: any) => {
  return http.post<ResPage<Merchant.ResPayinOrder>>(PORT1 + `/orderList`, params);
};
// 导出充值记录
export const exportPayinOrderList = (params: any) => {
  return http.post<ResExport>(PORT1 + `/exportPayinOrderList`, params);
};

export const getVoucherList = (params: any) => {
  return http.post(PORT1 + `/voucherList`, params);
}
export const getVoucherURL = (token: string) => {
  return http.post<any>(PORT1 + `/voucherURL`, { token });
}
export const getPayinStatistics = (params: any) => {
  return http.post(PORT1 + `/payinStatistics`, params);
};
export const getProductList = (params: any) => {
  return http.post(PORT1 + `/MerchantProductList`, params);
};
export const BuyProduct = (params: any) => {
  return http.post<Merchant.ResBuyProduct>(PORT1 + `/MerchantBuyProduct`, params);
};
//重发回调
export const resendNotifyURL = (params: any) => {
  return http.post(PORT1 + `/resendNotifyURL`, params);
};
