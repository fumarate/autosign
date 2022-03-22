const puppeteer = require("puppeteer");
const moment = require("moment");
const colors = require("colors");

class Logger {
    constructor(tag) {
        this.tag = tag;
    }

    log(msg, level) {
        let timeStr = moment().format("YYYY-MM-DD HH:mm:ss");
        switch (level) {
            case "info":
                timeStr = timeStr.green;
                break
            case "error":
                timeStr = timeStr.red;
                break
        }
        const source = (this.tag != null ? this.tag : level).yellow;
        console.log(timeStr + source + msg)
    }

    info(msg) {
        this.log(msg, "info")

    }

    error(msg) {
        this.log(msg, "error")
    }
}

const request = require("request");
const {TimeoutError} = require("puppeteer");
const users = require("./config.js").config.users;
const browserConfig = require("./config.js").config.browser;
const publicConfig = require("./config.js").config.public;

class Reporter {
    constructor(rConfig) {
        this.logger = Logger("reporter")
        for (const method of rConfig.use) {
            if (method == "sc") {
                this.reporter.scKey = rConfig.scKey
            } else if (method == "mail") {
                this.reporter.mailAddress = rConfig.mailAddress
            }
        }
    }

    async report(msg) {
        if (this.scKey) {
            this.logger.info("正发送至微信:" + msg);
            let url =
                "https://sctapi.ftqq.com/" +
                this.scKey +
                ".send?title=健康打卡状态通告&desp=" +
                msg;
            request(encodeURI(url));
        }
        if (this.mailAddress) {
            //等待开发
        }
    }
}

class Sign {
    constructor(user, browser) {
        this.user = user;
        this.browser = browser;
        this.logger = new Logger(user.userId)
        if (user.report.status) {
            this.reporter = new Reporter(user.report);

        }
    }

    async run() {
        this.logger.info("开始打卡");
        this.page = await this.browser.newPage();
        await this.page.emulate(puppeteer.devices["iPhone X"]);
        await this.login();
        const s = await this.check();
        let msg;
        if (!s) {
            await this.sign();
            msg = "成功打卡"
        } else {
            if (s.indexOf("辅导员") >= 0) {
                msg = "账号持有者未返校"
                this.logger.error(msg)
            } else if (s.indexOf("无需") >= 0) {
                msg = "已经打卡，无需再次打卡"
                this.logger.info(msg)
            }
        }

        if (this.reporter) {
            await this.reporter.report(msg)
        }
        await this.clean();
        return msg;
    }

    async login() {
        let failedTimes = 0;
        while (true) {
            await this.page.goto(
                "https://workflow.ecust.edu.cn/default/work/uust/zxxsmryb/mrybtb.jsp",
                {waitUntil: "networkidle0"}
            );
            this.logger.info("进入成功");
            const {userId, password} = this.user;
            const usernameInput = await this.page.$("#mobileUsername");
            await usernameInput.type(userId); //输入学号
            this.logger.info("学号输入成功");
            const passwordInput = await this.page.$("#mobilePassword");
            await passwordInput.type(password); //输入密码
            this.logger.info("密码输入成功");
            const needCaptcha = await this.page.evaluate(async () => {
                return document.getElementById("cpatchaDiv").style.display != "none";
            });
            if (needCaptcha) {
                const Tesseract = require("tesseract.js");
                const el = await page.$("#captchaImg");
                await el.screenshot({path: "captcha.png"});
                const captchaInput = await this.page.$("#captchaResponse");
                await Tesseract.recognize("captcha.png", "eng", {
                    logger: (m) => console.log(m),
                }).then(async ({data: {text}}) => {
                    await captchaInput.type(text.replaceAll(" ", ""));
                }); //准确率极低，不建议使用
            }
            try {
                await Promise.all([
                    this.page.waitForNavigation({
                        waitUntil: "networkidle0",
                    }),
                    this.page.click("#load"), //点击登录
                ]);
            } catch (e) {
                if (typeof (e) == TimeoutError) {
                    this.logger.error("登录超时")
                    failedTimes++;
                    continue;
                }
            }
            const url = await this.page.url();
            if (url.startsWith("https://workflow.ecust.edu.cn/")) {
                this.logger.info("登录成功");
                return;
            } else {
                failedTimes++;
                if (failedTimes >= publicConfig.retryTimes) {
                    this.logger.info("登录失败，重试");
                    continue;
                }
            }
        }
    };

    async check() {
        const layerExist = await this.page.$(".layui-layer-shade");
        if (layerExist) {
            return await this.page.evaluate(async () => {
                return $(".layui-layer-content").text();//jQuery
            })
        } else {
            return null;
        }
    }

    async sign() {
        try {
            const flag = await this.page.evaluate(async () => {
                return flag;
            })
            if (flag) {
                this.logger.info("已打卡，下一个用户");
            } else {
                await this.page.click("#sui-select-swjkzk19"); //健康
                this.logger.info("已选择健康");
                await this.page.click("#sui-select-xcm4"); //行程码绿码
                this.logger.info("已选择行程码绿码");
                await this.page.click("#sui-select-twsfzc8"); //体温正常
                this.logger.info("已选择体温正常");
                await this.page.click("#sui-select-jkmsflm12"); //健康码绿码
                this.logger.info("已选择健康码绿码");
                await this.page.click("#sui-select-sfycxxwc33"); //没从学校外出
                this.logger.info("已选择没从学校外出");
                await this.page.evaluate(async () => {
                    saveOrUpdate();
                });
                await this.page.click(".layui-layer-btn0");
                this.logger.info("已打卡");
            }
        } catch (e) {
            console.log(e)
        }
    }

    async clean() {
        const client = await this.page.target().createCDPSession();
        await client.send("Network.clearBrowserCookies");
        await client.send("Network.clearBrowserCache");
        await this.page.close();
    }
}
;

(async () => {
        let browser = await puppeteer.launch(browserConfig);
        let pubReporter = new Reporter(publicConfig.report);
        let allMsg = []
        for (const user of users) {
            const sign = new Sign(user, browser);
            const msg = await sign.run();
            allMsg.push(msg)
        }
        await pubReporter.report(allMsg.join("\n\n"))
        await browser.close();
    }
)();
