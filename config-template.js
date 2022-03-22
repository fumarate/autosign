exports.config = {
    public: {
        report: {
            status: true,
            use: ["sc", "mail"],
            scKey: "YourSendKey",
            //mailAddress: "YourMailAddress"
        },
        fillMethod: "click", //click or console
        retryTimes: 3, //重试次数
    },
    users: [
        {
            userId: "YourUserId", //学号
            password: "YourPassword", //密码
            scKey: "YourSendkey", //发送到微信的key
            report: {
                status: false,
                use: ["mail"],
                mailAddress: "YourMailAdddress"
            }
        },
    ],
    browser: {
        headless: true, //关闭无头模式
    },
};
