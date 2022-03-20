exports.config = {
  public: {
    testMode: false,
    scKey: "YourSendKey", //发送到微信的key
  },
  users: [
    {
      userId: "YourUserId", //学号
      password: "YourPassword", //密码
      needScreenshot: true, //是否需要截图
      scKey: "YourSendkey", //发送到微信的key
    },
  ],
  browser: {
    headless: true, //无头模式
  },
};
