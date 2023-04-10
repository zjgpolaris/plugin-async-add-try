## @zjgpolaris/plugin-async-add-try

一个自动给 async/await 函数添加 try/catch 的 babel 插件

### 安装

```shell
npm install --save-dev @zjgpolaris/plugin-async-add-try
```

### 使用说明

babel.config.js 配置如下

```javascript
module.exports = {
  plugins: [
    [
      require('@zjgpolaris/plugin-async-add-try'),
      {
        exclude: ['build'], // 默认值 ['node_modules']
        include: ['main.js'], // 默认值 []
        customLog: 'My customLog' // 默认值 'Error'
      }
    ]
  ]
};
```

### 说明

学习来自 海阔_天空 的源码