// 请求响应参数（不包含data）
export interface Result {
  code: number;
  errmsg: string;
}

// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data: T;
}
export interface LanguageData {
  languageCode: string;
  value: string;
}
export interface ResExport {
  fileUrl: string;
}
// 分页响应参数
export interface ResPage<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
  url: string;
}

// 分页请求参数
export interface ReqPage {
  pageNum: number;
  pageSize: number;
}

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// 登录模块
export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
    code: string;
  }
  export interface ResLogin extends System.ResAccount { }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
}
//资源管理模块
export namespace Asset {
  export interface ReqPage {
    pageNum: number;
    pageSize: number;
  }
  export interface ResAssetList {
    _id: string;
    name: string;
    url: string;
    type: string;
    contentType: string;
    time: number;
  }
  export interface ReqTextContent {
    id: string;
    channel: string;
    title: string;
    content: { [key: string]: string };
  }
}
export namespace DashBoard {
  export interface Data {
    today: PeriodData;
    yesterday: PeriodData;
  }
  /**
   * 单个时间段(今日/昨日)的数据接口
   */
  export interface PeriodData {
    // 支付订单相关字段
    totalAmount?: number;     // 核销金额
    totalFee?: number;        // 手续费
    settledAmount?: number;   // 结算金额
    status0Count?: number;
    status1Count?: number;
    status2Count?: number;
    status3Count?: number;
    status4Count?: number;
    status5Count?: number;
    status6Count?: number;
    status7Count?: number;
    totalCount?: number;      // 订单总数

    // 卡密相关字段
    cardCount?: number;       // 提卡数量
    purchaseAmount?: number;  // 采购金额
    faceValue?: number;       // 提卡面值
    hours24: PeriodData[];
    hour: number;
  }
}
export namespace System {
  export enum NodeStatus {
    Off,
    On
  }
  /**
   * 主机配置
   */
  export interface IHostConfig {
    /**
     * 端口
     */
    port: number;
    /**
     * 主机
     */
    host: string;
    /**
     * SSL文件配置
     */
    sslFile: { key: string, cert: string, ca: string }
  }

  /**
   * 服务器配置
   */
  export interface IServerConfig {
    /**
     * 密码
     */
    password: string;
    /**
     * 远程主机配置
     */
    remote: IHostConfig;
    /**
     * RPC配置
     */
    rpc: IHostConfig;
    /**
     * 是否启用Websocket
     */
    wsEnable: boolean;
    /**
     * 是否启用HTTP
     */
    httpEnable: boolean;
    /**
     * 逻辑标识，用于标识相同逻辑的服务器
     */
    logicTag: string;
    /**
     * 名称
     */
    name: string;
  }
  /**
   * 微服务配置
   */
  export interface INodeConfig extends IServerConfig {
    pmList?: IHostConfig[];
    /**
     * 中心服
     */
    center: IHostConfig;
    /**
     * 0关闭、1运行
     */
    status: NodeStatus;
    /**
     * 设备标识
     */
    device: string;
    /**
     * 使用到的数据库
     */
    dbList: string[];
    /**
     * rpc客户端断线重连时间
     */
    rpcReConnectTime: number;
    /**
     * 跨域设置
     */
    accessControlAllowOrigin?: string;
    /**
     * 类型标识，用于标识相同功能的服务器，比如NodeServer.TypeTag_Gate、NodeServer.TypeTag_Game、NodeServer.TypeTag_DB
     */
    typeTag: string;
    /**
     * 要共享token的服务，如果没有配置则说明此服务器不需要token，配置为空则只在相同logicTag的服务器之间共享token
     */
    tokenLogicTags: string[];
  }
  export interface ResProcess {
    config: INodeConfig;
    path: string;
    pinfo: {
      cpu: string;
      deviceFreeMem: string;
      deviceTotalMem: string;
      progressMem: string;
    };
    status: number;
    pm: IHostConfig;
  }

  export interface ResAccount {
    _id: string;
    username: string;
    password: string;
    role: string;
    sercetKey: string;
    createTime: number;
    creator: string;
    createIP: string;
    createIPAddress: string;
    updateTime: number;
    updateIPAddress: string;
    updateIP: string;
    avatar: string;
    token: string;
    roleData: ResRole;
  }
  export interface ResRole {
    _id: string;
    name: string;
    authMenuList: string[];
    configList: string[];
    grade: number;
    createTime: number;
    creator: string;
  }
  export interface ResOperateNote {
    user: string;
    role: string;
    time: number;
    ip: string;
    api: string;
    params: any;
  }
  export interface ResPackageInfo {
    isSilently: boolean;
    isForceUpdata: boolean;
    appVersion: string;
    wgtVersion: string;
    title: any;
    content: any;
    appDownloadUrl: string;
    wgtDownloadUrl: string;
  }
}
export namespace DataReport {
  export interface ResSellOrderStatistics {
    date: number;
    amount: number;
    feeAmount: number;
    faceValueTotal: number;
    faceValueLocked: number;
    purchasePriceTotal: number;
    purchasePriceLocked: number;
  }
  export interface SuccessRate {
    productID: string;
    amount: number;
    totalOrders: number;
    successOrders: number;
    productName: string;
    children: SuccessRate[];
  }
  export interface SuccessRateA {
    agentID: string;
    amount: number;
    totalOrders: number;
    successOrders: number;
    agentName: string;
    children: SuccessRateA[];
  }
}
export namespace Merchant {
  export interface ResProduct {
    id: string;
    productID: string;
    productName: string;
    lockCardScript: string;
    img: string;
    status: number;
    cashdeskStatus: number;
    createTime: number;
    updateTime: number;
    creator: string;
    fee: number;
    prices: number[];
  }
  export interface ResBuyProduct {
    cashDeskUrl: string
  }
  export interface ResPayinOrder {
    /**
     * 订单号
     */
    id: string;
    /**
     * 时间
     */
    date: string;
    /**
     * 手续费
     */
    feeAmount: number;
    /**
     * 通道ID
     */
    productID: string;
    /**
     * 通道名称
     */
    productName: string;
    /**
     * 商户订单号
     */
    merchantOrderID: string;
    /**
     * 币种
     */
    currency: string;
    /**
     * 金额（分）
     */
    amount: number;
    /**
     * 费率
     */
    fee: number;
    /**
     * 状态，0已下单/1支付中/2支付成功/3回调成功/4回调失败/5已结算
     */
    status: number;
    /**
     * 支付结果前端跳转URL
     */
    returnUrl: string;
    /**
     * 支付结果后台回调URL
     */
    notifyUrl: string;
    /**
     * 商品主题
     */
    subject: string;
    /**
     * 商品描述信息
     */
    body: string;
    /**
     * 扩展参数1
     */
    param1: string;
    /**
     * 下单时间
     */
    createTime: number;
    /**
     * 更新时间
     */
    updateTime: number;
    /**
     * 客户端IP
     */
    clientIP: string;
    timestamp: number;
    zonghelvColor: number;
  }
  export interface ResMerchant {
    id: string;
    name: string;
    username: string;
    balance: number;
    exchange: number;
    posFee: number;
    posFeePercent: number;
    status: number;
    entityCardList: number[];
    walmartAccepts: number;
    key: string;
    ipWhiteList: string[];
    priceList: number[];
    createTime: number;
    updateTime: number;
    toolExpiryTime: number;
    creator: string;
    password: string;
    safePassword: string;
    sercetKey: string;
    avatar: string;
    code?: string;
    tgUserID: number;
    telegramGroupID: number;
    notifyUrl: string;
  }
  export interface ResSettlement {
    agentID: string;
    agentName: string;
    date: number;
    totalAmount: number;
    totalFee: number;
    orderCount: number;
    orderIds: string[];
    usdtAddress: number;
    usdt: number;
    actualAmount: number;
  }
  export interface ResVoucher {
    agentID: string;
    agentName: string;
    totalAmount: number;
    actualAmount: number;
    totalFee: number;
    orderCount: number;
    orderIds: string[];
    createTime: number;
  }
  export interface ResChildAccount {
    /**
     * 头像
     */
    avatar: string;
    /**
     * 登录用户名
     */
    username: string;
    /**
     * 登录密码
     */
    password: string;
    /**
     * 登录密钥
     */
    sercetKey: string;
    /**
     * 描述
     */
    memo: string;
    /**
     * 菜单权限
     */
    authMenuList: string[];
    /**
     * 分组权限
     */
    groupList: string[];
    /**
     * 创建时间
     */
    createTime: number;
    /**
     * 登录时间
     */
    updateTime: number;
    /**
     * 登录口令
     */
    token: string;
    /**
     * 最近登录IP
     */
    updateIP: string;
    /**
     * 创建时的IP
     */
    createIP: string;
    locked: boolean;
  }

}