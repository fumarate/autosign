const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        //new winston.transports.File({filename: 'combined.log'})
    ]
});
const testMode = true;
(async () => {
    const browser = await puppeteer.launch({
        //关闭无头模式
        headless: true,
        //全屏打开浏览器
        args: ['--start-maximized'],
        //设置浏览器页面尺寸
        defaultViewport: { width: 1800, height: 1000 }
    }
    );
    const page = await browser.newPage();
    await page.emulate(puppeteer.devices['iPhone X']);
    await page.goto("https://workflow.ecust.edu.cn/default/work/uust/zxxsmryb/mrybcn.jsp");
    //await page.waitForNavigation();
    logger.info('进入成功');
    const usernameInput = await page.$("#mobileUsername");
    await usernameInput.type("19030010");//输入学号
    logger.info("学号输入成功");
    const passwordInput = await page.$("#mobilePassword");
    await passwordInput.type("S19030010");//输入密码
    logger.info("密码输入成功");
    await page.click("#load");//点击登录
    logger.info("登录成功");
    await page.goto("https://workflow.ecust.edu.cn/default/work/uust/zxxsmryb/mrybtb.jsp");
    //await page.waitForNavigation()
    logger.info("已跳转至打卡站点")
    if (testMode) {
        const signed = await page.evaluate(async () => {
            if (flag) {
                flag = false;
                $("#layui-layer100001").remove();
                $("#layui-layer-shade100001").remove();
                return true
            } return false;
        })
        if (signed) {
            logger.info("已打卡，已经将flag设置为false并移除layer元素")
        }
    }
    //await page.waitForNavigation();
    //await page.click("#sfcn");//点击同意
    //await page.click("#post"); //点击确定
    //await page.waitForNavigation({ timeout: 10000, waitUntil: ['networkidle0'] });
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
    await browser.close();
})();