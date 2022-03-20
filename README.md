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
node auto.js
```

# 部署到Docker

待完成。

# 部署到腾讯云函数

待完成。

# 部署到github action

待完成。

# TODO
- [ ] 教程
- [ ] 自动截图
- [ ] 命令行单组参数
- [ ] Server