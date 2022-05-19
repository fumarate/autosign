# autosign

此程序可以帮助你每日健康打卡。

主要文件：

auto.js: 主程序

config.js: 设置文件

# 配置文件结构
请查看config-template.js。

使用时，将其重命名为config.js，并补充相关信息。

# 在你的计算机上测试

## Windows
### 1. 安装nodejs
进入[nodejs官方网站](https://nodejs.org/zh-cn/download/),点击“长期维护版”下的“Windows安装包”，此时浏览器应该会下载node-v16.14.2-x64.msi文件（版本号可能存在差异）。从资源管理器中找到这个文件，双击安装。

安装时，无需查看详细配置，持续点击下一步并勾选相关选项即可。

安装后建议重启一次。

### 2.下载项目代码
在项目页面，点击code，再点击Download zip，下载代码压缩包，并解压到合适的位置。

### 3.编辑配置
将config-template.js重命名为config.js并修改相应配置。

### 4.安装依赖
在项目文件夹，打开PowerShell或cmd。执行npm install。

### 5.运行
在项目文件夹，打开PowerShell或cmd。执行node auto.js。

## Linux
如果你已经安装nodejs，保证你的node在12.22以上。

运行程序时，避免以root运行。
```bash
# 安装nodejs npm
sudo apt update
sudo apt install nodejs npm
# 安装chromedriver依赖
sudo apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils -y
# 对于低版本Linux发行版，安装n以升级nodejs版本
sudo npm install -g n
# 切换到lts版本
sudo n lts
# clone仓库
git clone git@github.com:fumarate/autosign.git
# 进入项目目录
cd autosign
# 安装依赖
npm install
# 进入puppeteer文件夹
cd node_modules/puppeteer
# 安装puppeteer依赖
npm install
# 返回根目录
cd ../..
# 复制一份配置文件
cp config-template.js config.js
# 编辑配置文件
vim config.js
# 运行
node auto.js
```
## MacOS
不会，也没有MacBook。

# 部署到Docker

你可以尝试使用dockerfile部署，打包镜像前请先修改好配置文件。

暂时不要依赖本dockerfile文件，还在测试中。

# <s>部署到腾讯云函数</s>

已被证实，<s>凭本人所学</s>难以在腾讯云函数上运行自动签到。

你可以尝试基于模拟请求原理开发的[autosign_python](https://github.com/fumarate/autosign_python)。

# 部署到github action

第一步，Fork本仓库。

第二步，进入你Fork所得到的仓库，点击Settings>Secrets>Actions。

第三步，点击New repository secret。新建USER_ID、PASSWORD变量。SC_KEY变量是可选的，用于发送微信通知。

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

2、github action遵循的是UTC时间。也就是说，对小时位数值+8并对24取余，得到的才是真实时间。

请不要在高峰期打卡！

# 关于定时
定时功能并不在程序的实现范围内，本程序只将繁琐的登录点击流程集中自动化了。若你需要定时打卡，务必需要一台24h运行的PC或服务器，利用crontab等功能定时执行代码。