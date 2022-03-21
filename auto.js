const puppeteer = require("puppeteer");
const path = require("path");
const moment = require("moment");
const colors = require("colors");
class Logger {
  constructor() {
    this.userId = null;
  }
  info(msg) {
    const timeStr = moment().format("YYYY-MM-DD HH:mm:ss");
    const source = this.userId != null ? this.userId : "info";
    console.log(timeStr.green + " " + source + " " + msg);
  }
}
let logger = new Logger();
const request = require("request");
const users = require("./config.js").config.users;
const browserConfig = require("./config.js").config.browser;
const publicConfig = require("./config.js").config.public;
const createMessageSummary = async (userStatus) => {
  var message = [];
  for (const userId in userStatus) {
    let status = userStatus[userId];
    if (status == "success") {
      message.push("学号" + userId + "健康打卡成功");
    } else if (status == "wrongpassword") {
      message.push("学号" + userId + "密码错误");
    } else if (status == "retryfailed") {
      message.push("学号" + userId + "多次重试失败");
    } else if (status == "failed") {
      message.push("学号" + userId + "健康打卡失败");
    } else if (status == "havesigned") {
      message.push("学号" + userId + "今日已打卡");
    }
  }
  return message;
};
const sendToWeChat = async ({ msg, scKey = publicConfig.scKey }) => {
  logger.info("正发送至微信:" + msg);
  let url =
    "https://sctapi.ftqq.com/" +
    scKey +
    ".send?title=健康打卡状态通告&desp=" +
    msg;
  request(encodeURI(url));
};
const login = async (user, page) => {
  const { userId, password } = user;
  const usernameInput = await page.$("#mobileUsername");
  await usernameInput.type(userId); //输入学号
  logger.info("学号输入成功");
  const passwordInput = await page.$("#mobilePassword");
  await passwordInput.type(password); //输入密码
  logger.info("密码输入成功");
  const needCaptcha = await page.evaluate(async () => {
    return document.getElementById("cpatchaDiv").style.display != "none";
  });
  if (needCaptcha) {
    const Tesseract = require("tesseract.js");
    const el = await page.$("#captchaImg");
    await el.screenshot({ path: "captcha.png" });
    const captchaInput = await page.$("#captchaResponse");
    await Tesseract.recognize("captcha.png", "eng", {
      logger: (m) => console.log(m),
    }).then(async ({ data: { text } }) => {
      await captchaInput.type(text.replaceAll(" ", ""));
    }); //准确率极低，不建议使用
  }
  await Promise.all([
    page.waitForNavigation({
      waitUntil: "networkidle0",
    }),
    page.click("#load"), //点击登录
  ]);
  const url = await page.url();
  if (url.startsWith("https://workflow.ecust.edu.cn/")) {
    return true;
  } else return false;
};
const clean = async (page) => {
  const client = await page.target().createCDPSession();
  await client.send("Network.clearBrowserCookies");
  await client.send("Network.clearBrowserCache");
};

(async () => {
  const browser = await puppeteer.launch(browserConfig);
  let userStatus = {};
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    logger.userId = user.userId;
    logger.info("开始打卡");
    const page = await browser.newPage();
    await page.emulate(puppeteer.devices["iPhone X"]);
    try {
      await page.goto(
        "https://workflow.ecust.edu.cn/default/work/uust/zxxsmryb/mrybtb.jsp",
        { waitUntil: "networkidle0" }
      );
      logger.info("进入成功");
      let failedTimes = 0;
      while (true) {
        if (await login(user, page)) {
          logger.info("登录成功");
          break;
        } else {
          failedTimes++;
          if (failedTimes >= publicConfig.retryTimes) {
            logger.info("登录失败，退出");
            userStatus[user.userId] = "retryfailed";
            throw new Error("登录失败");
          }
        }
      }

      const signed = await page.evaluate(async () => {
        return flag;
      });
      if (signed) {
        if (publicConfig.testMode) {
          await page.evaluate(async () => {
            $("#layui-layer100001").remove();
            $("#layui-layer-shade100001").remove();
            flag = false;
          });
        } else {
          logger.info("已打卡，下一个用户");
          userStatus[user.userId] = "havesigned";
          await page.close();
          continue;
        }
      }
      await page.click("#sui-select-swjkzk19"); //健康
      logger.info("已选择健康");
      await page.click("#sui-select-xcm4"); //行程码绿码
      logger.info("已选择行程码绿码");
      await page.click("#sui-select-twsfzc8"); //体温正常
      logger.info("已选择体温正常");
      await page.click("#sui-select-jkmsflm12"); //健康码绿码
      logger.info("已选择健康码绿码");
      await page.click("#sui-select-sfycxxwc33"); //没从学校外出
      logger.info("已选择没从学校外出");
      await page.evaluate(async () => {
        saveOrUpdate();
      });
      await page.click(".layui-layer-btn0");
      logger.info("已打卡");
      userStatus[user.userId] = "success";
      await clean(page);
      await page.close();
    } catch (e) {
      await page.close();
      logger.info(e);
      i--;
      continue;
    }
  }
  logger.userId = null;
  const sMsg = await createMessageSummary(userStatus);
  await sendToWeChat({ msg: sMsg.join("\n") });
  for (const user of users) {
    if (user.scKey) {
      await sendToWeChat({ msg: userStatus[user.userId], scKey: user.scKey });
    }
  }
  await browser.close();
})();
