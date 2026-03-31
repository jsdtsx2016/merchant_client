import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { DashBoard } from "@/api/interface/index";

export const getDashboardData = (channelName: any = null) => {
    return http.post<DashBoard.Data>(PORT1 + `/dashboard/dashboardData`, { channel: channelName ? channelName : "默认" });
};