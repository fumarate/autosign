# autosign

此程序可以帮助你每日健康打卡。
主要文件：
auto.js: 主程序
config.js: 设置文件

# 在你的计算机上测试

如果你已经安装nodejs，保证你的node在12.22以上。
运行程序时，避免以root运行。
```bash
sudo apt install nodejs npm
npm install -g n
n lts
git clone git@github.com:Shigure19/autosign.git
cd autosign
npm install
sudo apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils -y
cd node_modules
cd puppeteer
npm install
node auto.js
```

# 部署到Docker

待完成。

# <s>部署到腾讯云函数</s>

已被证实，<s>凭本人所学</s>难以在腾讯云函数上运行自动签到。本程序的实现原理是利用puppeteer框架操纵无头浏览器进行健康打卡，然而云函数只能提供基本的nodejs运行环境，难以启动无头chrome，更难以安装那些依赖了。

并且，云函数在以nodejs v12.16为环境时，才能安装npm依赖。而puppeteer似乎需要^12.22

# 部署到github action

第一步，Fork本仓库。

第二步，进入你Fork所得到的仓库，点击Settings>Secrets>Actions。

第三步，点击New repository secret。新建USER_ID、PASSWORD变量。SC_KEY变量是可选的。

<s>第四步，star你的仓库。</s>

如果你需要定制打卡时间，请自行修改.github/workflows/autosign.yaml中的cron表达式，并提交一次commit。含义如下：
```markdown
┌──────── 分钟 (0~59)
| ┌────── 小时 (0~23)
| | ┌──── 日期 (1~31)
| | | ┌── 月份 (1~12 or JAN~DEC)
| | | | ┌ 星期 (0~6 or SUN~SAT)
| | | | |
| | | | |
| | | | |
* * * * *
```
注意：

1、github action仅支持精确到分钟的五位cron表达式。

2、github action遵循的是UTC时间。也就是说，对这一位数值+8并对24取余，得到的才是真实时间。

请不要在高峰期打卡！
# TODO
- [ ] 教程
- [ ] 自动截图
- [ ] 命令行单组参数
- [ ] Server