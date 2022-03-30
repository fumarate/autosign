exports.config = {
  public: {
    report: {
      status: true, //总通知开关
      use: ["sc", "mail"], //通知方法，现在支持server酱和邮件
      scKey: "YourSendKey", //server酱scKey
      mailAddress: "YourMailAddress", //接收通知邮箱的地址
    },
    mailSend: {
      //启用邮箱通知时，发件邮箱的信息
      mailAddress: "YourSendMailAddress", //邮箱地址
      mailPassword: "YourSendMailPassword", //邮箱密码或口令
      host: "YourMailSMTPServer", //SMTP服务器地址
      port: "YourMailSMTPPort", // SMTP服务器端口。一定要改成数字
      ssl: false, //是否使用SSL
    },
    fillMethod: "click", //打卡时，是模拟点击还是在浏览器上下文中执行相关操作，还是自行构建请求。该功能仍未开发
    retryTimes: 3, //登陆失败的重试次数
  },
  users: [
    {
      userId: "YourUserId", //学号
      password: "YourPassword", //密码
      report: {
        status: false, //是否开启个人通知
        use: ["sc", "mail"], //通知方法，现在支持server酱和邮件
        scKey: "YourSendkey", //server酱scKey
        mailAddress: "YourMailAdddress", //接收通知邮箱的地址
      },
    },
  ],
  browser: {
    headless: true, //是否打开浏览器的无头模式。如果你想参与到开发中，这是很有用的，可以帮助你监视过程，判断问题所在。如果你不参与开发，则只能用于炫耀
  },
};
