let wsurl = "";  
let accessToken = "";
let messageCallBack = null;
let closeCallBack = null;
let connectCallBack = null;
let isConnect = false;
let rec = null;
let isInit = false;
let secretKey = "your-secret-key"; // 加密密钥
let maxReconnectAttempts = 5; // 最大重连次数
let reconnectAttempts = 0; // 当前重连次数
let reconnectInterval = 15000; // 重连间隔时间
let init = () => {
	// 防止重复初始化
	if (isInit) {
		return;
	}
	isInit = true;
	uni.onSocketOpen((res) => {
		console.log("WebSocket连接已打开");
		isConnect = true;
		// 发送登录命令
		let loginInfo = {
			cmd: 0,
			data: {
				accessToken: accessToken
			}
		};
		uni.sendSocketMessage({
			data: JSON.stringify(loginInfo)
		});
	})

    uni.onSocketMessage((res) => {
        const message = JSON.parse(res.data);
        
        // 验证消息
        if (!message.signature || !message.data || !message.timestamp) {
            console.error("Invalid message format");
            return;
        }
        
        // 检查消息时间戳，防止重放攻击
        const now = Date.now();
        if (now - message.timestamp > 300000) { // 5分钟过期
            console.error("Message expired");
            return;
        }
        
        try {
            const decryptedData = decrypt(message.data);
            const calculatedSignature = sign(decryptedData);
            
            if (calculatedSignature !== message.signature) {
                console.error("Invalid message signature");
                return;
            }
            
            if (decryptedData.cmd == 0) {
                heartCheck.start()
                connectCallBack && connectCallBack();
                console.log('WebSocket登录成功')
            } else if (decryptedData.cmd == 1) {
                clearTimeout(heartCheck.serverTimeoutObj);
                heartCheck.reset();
            } else {
                console.log("接收到消息", decryptedData);
                messageCallBack && messageCallBack(decryptedData.cmd, decryptedData.data)
            }
        } catch (error) {
            console.error("Message processing error:", error);
        }
    })

	uni.onSocketClose((res) => {
		console.log('WebSocket连接关闭')
		isConnect = false;
		closeCallBack && closeCallBack(res);
	})

	uni.onSocketError((e) => {
		console.log(e)
		isConnect = false;
		// APP 应用切出超过一定时间(约1分钟)会触发报错，此处回调给应用进行重连
		closeCallBack && closeCallBack({code: 1006});
	})
};

let connect = (url, token) => {
    wsurl = url;
    accessToken = token;
    if (isConnect) {
        return;
    }
    
    // 确保使用WSS协议
    if (!url.startsWith('wss://')) {
        url = url.replace('ws://', 'wss://');
    }
    
    uni.connectSocket({
        url: wsurl,
        success: (res) => {
            console.log("websocket连接成功");
            reconnectAttempts = 0; // 重置重连计数
        },
        fail: (e) => {
            console.log(e);
            console.log("websocket连接失败，准备重连");
            reconnect(url, token);
        }
    });
}

//定义重连函数
let reconnect = (wsurl, accessToken) => {
    console.log("尝试重新连接");
    if (isConnect) {
        return;
    }
    
    // 检查重连次数
    if (reconnectAttempts >= maxReconnectAttempts) {
        console.log("达到最大重连次数，停止重连");
        closeCallBack && closeCallBack({code: 1000, reason: "Max reconnection attempts reached"});
        return;
    }
    
    rec && clearTimeout(rec);
    // 使用指数退避算法计算重连延迟
    const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempts), 60000);
    
    rec = setTimeout(function() {
        reconnectAttempts++;
        connect(wsurl, accessToken);
    }, delay);
    
    console.log(`第${reconnectAttempts + 1}次重连，延迟${delay}ms`);
};

//设置关闭连接
let close = (code) => {
	if (!isConnect) {
		return;
	}
	uni.closeSocket({
		code: code,
		complete: (res) => {
			console.log("关闭websocket连接");
			isConnect = false;
		},
		fail: (e) => {
			console.log("关闭websocket连接失败", e);
		}
	});
};


//心跳设置
var heartCheck = {
    timeout: 10000,
    timeoutObj: null,
    serverTimeoutObj: null,
    start: function() {
        if (isConnect) {
            console.log('发送WebSocket心跳')
            let heartBeat = {
                cmd: 1,
                data: {
                    timestamp: Date.now()
                }
            };
            
            // 加密心跳包
            const encryptedHeartBeat = encrypt(heartBeat);
            const signature = sign(heartBeat);
            
            uni.sendSocketMessage({
                data: JSON.stringify({
                    data: encryptedHeartBeat,
                    signature: signature
                }),
                fail(res) {
                    console.log(res);
                    reconnect(wsurl, accessToken);
                }
            });
            
            // 添加服务器响应超时检测
            this.serverTimeoutObj = setTimeout(() => {
                console.log('心跳响应超时，断开重连');
                close(1000);
                reconnect(wsurl, accessToken);
            }, this.timeout);
        }
    },
	reset: function() {
		clearTimeout(this.timeoutObj);
		this.timeoutObj = setTimeout(function() {
			heartCheck.start();
		}, this.timeout);
	}

}

// 消息加密和签名
function encrypt(data) {
    // 使用AES加密
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function decrypt(data) {
    // 使用AES解密
    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

function sign(data) {
    // 使用HMAC-SHA256生成签名
    return CryptoJS.HmacSHA256(JSON.stringify(data), secretKey).toString();
}

// 实际调用的方法
function sendMessage(agentData) {
    const encryptedData = encrypt(agentData);
    const signature = sign(agentData);
    const message = {
        data: encryptedData,
        signature: signature,
        timestamp: Date.now()
    };
    
    uni.sendSocketMessage({
        data: JSON.stringify(message)
    });
}

let onConnect = (callback) => {
	connectCallBack = callback;
}


function onMessage(callback) {
	messageCallBack = callback;
}


function onClose(callback) {
	closeCallBack = callback;
}


// 将方法暴露出去
export {
	init,
	connect,
	reconnect,
	close,
	sendMessage,
	onConnect,
	onMessage,
	onClose
}