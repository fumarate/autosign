const puppeteer = require("puppeteer");
const path = require("path");
const logger = {
  info: (msg) => {
    var date = new Date();
    var time = date.getTime();
    console.log(time + msg);
  },
};
const params = process.argv.slice(2);
const request = require("request");
const users = require("./config.js").config.users;
const browserConfig = require("./config.js").config.browser;
const publicConfig = require("./config.js").config.public;
const sendToWeChat = async (user2) => {
  logger.info("正发送至微信");
  let msg =
    "https://sctapi.ftqq.com/" +
    user2.scKey +
    ".send?title=学号" +
    user2.userId;
  if ((user2.status = "success")) {
    msg = msg + "健康打卡成功";
    if (user2.screenshot != null) {
      console.log("发送截图");
      msg = msg + "&desp=" + user2.screenshotUri;
    }
  } else {
    msg = msg + "健康打卡失败";
  }
  request(encodeURI(msg));
};
const login = async (user, page) => {
  const { userId, password } = user;
  const usernameInput = await page.$("#mobileUsername");
  await usernameInput.type(userId); //输入学号
  logger.info("学号输入成功");
  const passwordInput = await page.$("#mobilePassword");
  await passwordInput.type(password); //输入密码
  logger.info("密码输入成功");
  const needCaptcha = await page.evaluate(async() => {
    return document.getElementById("cpatchaDiv").style.display != "none"
  })
  if (needCaptcha) {
    const Tesseract = require("tesseract.js");
    const el = await page.$("#captchaImg");
    await el.screenshot({ path: "captcha.png" });
    const captchaInput = await page.$("#captchaResponse");
    await Tesseract.recognize("captcha.png", "eng", {
      logger: (m) => console.log(m),
    }).then(async ({ data: { text } }) => {
      await captchaInput.type(text.replaceAll(" ", ""));
    });//准确率极低，不建议使用
  }
  await Promise.all([
    page.waitForNavigation({
      waitUntil: "networkidle0",
    }),
    page.click("#load"), //点击登录
  ]);
  const url = await page.url();
  if (url.startsWith("https://workflow.ecust.edu.cn/")) {
    logger.info("登录成功");
    return true;
  } else return false;
};
(async () => {
  const browser = await puppeteer.launch(browserConfig);
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    logger.info("学号：" + user.userId + "开始打卡。");
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
        }else{
          failedTimes++;
          if(failedTimes>=publicConfig.retryTimes){
            logger.info("登录失败，退出");
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
      logger.info("学号：" + user.userId + "已打卡");
      if (user.needScreenshot) {
        const tmpDir = require("os").tmpdir();
        const date = new Date();
        await page.screenshot({
          path: path.join(tmpDir, date.getDate() + user.userId + ".png"),
        });
        //uploadtoImg
        user["screenshotUri"] = "123456";
      }
      if (user.scKey != null && user.scKey != "") {
        sendToWeChat(user);
      }
      await page.close();
    } catch (e) {
      await page.close();
      logger.info(e);
      i--;
      continue;
    }
  }
  await browser.close();
})();
