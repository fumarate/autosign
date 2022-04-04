FROM ubuntu
# Prevent debconf from asking questions
ENV DEBIAN_FRONTEND=noninteractive 
# Set global running environment
RUN sed -i s@/archive.ubuntu.com/@/mirrors.cloud.tencent.com/ubuntu/@g /etc/apt/sources.list\
	&& sed -i s@/security.ubuntu.com/@/mirrors.cloud.tencent.com/ubuntu/@g /etc/apt/sources.list\
	&& apt clean\
	&& apt-get update -y\
	&& apt-get install nodejs npm -y\
    && apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils -y\	
	&& npm install -g n --registry=https://registry.npmmirror.com\
	&& n stable
# Add normal user
RUN useradd --create-home --shell /bin/bash ubuntu\
	&& adduser ubuntu sudo
# Switch user and working directory
USER ubuntu
WORKDIR /home/ubuntu
RUN mkdir ~/auto
# Add files

ADD package.json auto
# Set script environment
USER ubuntu
WORKDIR /home/ubuntu/auto
RUN npm install --registry=https://registry.npmmirror.com\
	&& cd node_modules/puppeteer\
	&& npm install --registry=https://registry.npmmirror.com
ADD auto.js .
ADD config.js .
ENTRYPOINT ["node", "auto.js"]