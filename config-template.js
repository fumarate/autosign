exports.config = {
  public: {
    testMode: false,
    serverChanSendKey: "YourSendKey", //发送到微信的key
    fillMethod:"click",//click or console
    retryTimes: 3, //重试次数
  },
  
users: [
  {
    userId: "YourUserId", //学号
    password: "YourPassword", //密码
    scKey: "YourSendkey", //发送到微信的key
  },
],
  browser: {
    headless: true, //关闭无头模式
  },
};
