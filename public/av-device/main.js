/**
 * AV Device Server - WebRTC 音视频设备检测服务器
 * 
 * 这是一个用于 WebRTC 音视频设备检测的 HTTP/HTTPS 服务器
 * 支持静态文件服务和目录索引显示
 * 
 * 功能特性：
 * - HTTP 服务器运行在 8080 端口
 * - HTTPS 服务器运行在 8443 端口（需要证书文件）
 * - 静态文件服务
 * - 目录索引显示
 * 
 * @author Alien
 * @version 1.0
 * @date 2025-11-12
 */

'use strict'; // 启用严格模式，提高代码安全性和性能

// 导入必要的 Node.js 模块
let http = require('http');        // HTTP 服务器模块
let https = require('https');      // HTTPS 服务器模块
let fs = require('fs');            // 文件系统模块
let serveIndex = require('serve-index'); // 目录索引显示中间件
let express = require('express');  // Express 框架，简化 Web 服务器开发

// 创建 Express 应用实例
const app = express();

// 配置中间件
// 1. 目录索引中间件：显示 public 目录下的文件列表
app.use(serveIndex('./public', {
    // 可以在这里配置 serve-index 的选项
    // 例如：icons: true, view: 'details' 等
}));

// 2. 静态文件服务中间件：将 public 目录作为静态资源根目录
app.use(express.static('public'));

// 启动 HTTP 服务器
// HTTP 服务器运行在 8080 端口，监听所有网络接口（0.0.0.0）
const httpServer = http.createServer(app);
httpServer.listen(8080, "0.0.0.0", () => {
    console.log('HTTP Server running on port 8080');
    console.log('访问地址: http://localhost:8080');
    console.log('或 http://[你的 IP 地址]:8080');
});

// 启动 HTTPS 服务器（需要证书文件）
// 检查是否存在 SSL 证书文件
if (fs.existsSync('../../cert/server.key') && fs.existsSync('../../cert/server.cert')) {
    // 创建HTTPS服务器，需要SSL证书和私钥
    const httpsServer = https.createServer({
        key: fs.readFileSync('../../cert/server.key'),   // 读取私钥文件
        cert: fs.readFileSync('../../cert/server.cert')  // 读取证书文件
    }, app);
    
    // HTTPS 服务器运行在 8443 端口，监听所有网络接口
    httpsServer.listen(8443, "0.0.0.0", () => {
        console.log('HTTPS Server running on port 8443');
        console.log('安全访问地址: https://localhost:8443');
        console.log('或 https://[你的 IP 地址]:8443');
    });
} else {
    // 证书文件不存在，仅启动 HTTP 服务器
    console.log('HTTPS Server not running, missing server.key and server.cert');
    console.log('请确保 ../../cert/ 目录下存在 server.key 和 server.cert 文件');
    console.log('如需生成自签名证书，可以使用以下命令：');
    console.log('openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.cert');
}

// 服务器错误处理
httpServer.on('error', (error) => {
    console.error('HTTP 服务器启动失败:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.log('端口 8080 已被占用，请检查是否有其他服务正在运行');
    }
});

// 优雅关闭处理
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    httpServer.close(() => {
        console.log('HTTP服务器已关闭');
        process.exit(0);
    });
});