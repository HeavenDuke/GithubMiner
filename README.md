# GithubMiner
基于图数据对Github上的代码库做推荐。

网站置于website目录下，架构为ExpressJS。

#### 运行方法
配置好node与neo4j相关环境后，将neo4j启动于默认端口，然后在website目录下执行：
```plain
npm install
npm start
```

即可从浏览器访问```localhost:3002```即可访问网站主页。
