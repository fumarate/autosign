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
    needScreenshot: false, //是否需要截图
    scKey: "YourSendkey", //发送到微信的key
  },
],
  browser: {
    headless: false, //关闭无头模式
    args: ["--start-maximized"], //全屏打开浏览器
    defaultViewport: { width: 1800, height: 1000 }, //设置浏览器页面尺寸
  },
};
