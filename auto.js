const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
    ]
});
const request = require('request');

const testMode = true;

const users = [
    {
        "userId": "YourUserId",
        "password": "YourPassword",
        "needScreenshot": true,
        "serverChanSendKey": 'YourSendKey'
    }
]

const headlessConfig = {
    //关闭无头模式
    headless: false,
    //全屏打开浏览器
    args: ['--start-maximized'],
    //设置浏览器页面尺寸
    defaultViewport: { width: 1800, height: 1000 }
}
const sendToWeChat = async (user2) => {
    logger.info("正发送至微信");
    if (user2.status = "success") {
        let msg = "https://sctapi.ftqq.com/" + user2.serverChanSendKey + ".send?title=学号" + user2.userId + "健康打卡成功"
        if (user2.screenshot != null) {
            console.log("发送截图");
            msg = msg + "&desp=" + user2.screenshotUri;
        }
        request(encodeURI(msg))
    } else {
        request("https://sctapi.ftqq.com/" + user2.sendKey + ".send?title=学号" + user2.userId + "健康打卡失败")
    }
}
(async () => {
    for (const user of users) {
        try {
            logger.info("学号：" + user.userId + "开始打卡。");
            const browser = await puppeteer.launch(headlessConfig);
            const page = await browser.newPage();
            await page.emulate(puppeteer.devices['iPhone X']);
            await page.goto("https://workflow.ecust.edu.cn/default/work/uust/zxxsmryb/mrybtb.jsp", { waitUntil: 'networkidle0' });
            logger.info('进入成功');
            const usernameInput = await page.$("#mobileUsername");
            await usernameInput.type(user.userId);//输入学号
            logger.info("学号输入成功");
            const passwordInput = await page.$("#mobilePassword");
            await passwordInput.type(user.password);//输入密码
            logger.info("密码输入成功");
            await Promise.all([
                page.waitForNavigation({
                    waitUntil: 'networkidle0'
                }),
                logger.info("登录成功"),
                page.click("#load")//点击登录
            ])

            const signed = await page.evaluate(async () => {
                return flag
            })
            if (signed) {
                if (testMode) {
                    await page.evaluate(async () => {
                        $("#layui-layer100001").remove();
                        $("#layui-layer-shade100001").remove();
                        flag = false;
                    })
                } else {
                    logger.info("已打卡，下一个用户")
                    await page.close();
                    continue;
                }
            }
            await page.click("#sui-select-swjkzk19");//健康
            logger.info("已选择健康")
            await page.click("#sui-select-xcm4");//行程码绿码
            logger.info("已选择行程码绿码")
            await page.click("#sui-select-twsfzc8");//体温正常
            logger.info("已选择体温正常")
            await page.click("#sui-select-jkmsflm12");//健康码绿码
            logger.info("已选择健康码绿码")
            await page.click("#sui-select-sfycxxwc33");//没从学校外出
            logger.info("已选择没从学校外出")
            await page.evaluate(async () => {
                saveOrUpdate();
            })
            await page.click(".layui-layer-btn0");
            logger.info("学号：" + user.userId + "已打卡")
            if (user.needScreenshot) {
                const tmpDir = require('os').tmpdir();
                const date = new Date();
                await page.screenshot({ path: path.join(tmpDir, date.getDate() + user.userId + '.png') });
                //uploadtoImg
                user["screenshotUri"] = "123456"
            }
            if (user.serverChanSendKey != null) {
                sendToWeChat(user);
            }
            await browser.close();
        } catch (e) {
            console.log(e);
        }
    }
})();