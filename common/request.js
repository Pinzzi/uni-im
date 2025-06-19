import config from '../config/request.config.js'
import { validateConfig } from '../utils/configValidator.js'
import { AES, enc, HmacSHA256, lib } from 'crypto-js'

// 请求队列
let requestList = [];
// 是否正在刷新中
let isRefreshToken = false;
// 请求计数器 
let requestCounter = 0;
// 最大请求次数限制
const MAX_REQUESTS = 100;
// 时间窗口(ms)
const TIME_WINDOW = 60000;
// 重试次数
const MAX_RETRIES = 3;
// 重试延迟(ms) 
const RETRY_DELAY = 1000;
const request = (options, retryCount = 0) => {
  // 配置检查
  try {
    validateConfig(config);
  } catch (error) {
    return Promise.reject(new Error('请求配置错误: ' + error.message));
  }

  // 限流检查
  if(!checkRateLimit()) {
    return Promise.reject(new Error('请求太频繁，请稍后再试'));
  }

  const header = options.header || {};
  const loginInfo = uni.getStorageSync("loginInfo");
  if (loginInfo) {
    header.accessToken = loginInfo.accessToken;
  }

  // 添加安全头
  header['X-Content-Type-Options'] = 'nosniff';
  header['X-Frame-Options'] = 'DENY'; 
  header['X-XSS-Protection'] = '1; mode=block';
  
  // CSRF Token
  const csrfToken = generateCSRFToken();
  header['X-CSRF-Token'] = csrfToken;

  // 计算签名
  const timestamp = new Date().getTime();
  const signature = generateSignature(options.data, timestamp);
  header['X-Signature'] = signature;
  header['X-Timestamp'] = timestamp;

  // 加密请求数据
  const encryptedData = encryptData(options.data);

  return new Promise(function(resolve, reject) {
    uni.request({
      url: config.BASE_URL + options.url,
      method: options.method || 'GET',
      header: header,
      data: encryptedData,
      async success(res) {
        // 验证响应数据
        if(!validateResponse(res)) {
          return reject(new Error('响应数据验证失败'));
        }

        if (res.data.code == 200) {
          // 解密响应数据
          const decryptedData = decryptData(res.data.data);
          return resolve(decryptedData)
        } else if (res.data.code == 400) {
          getApp().exit();
        } else if (res.data.code == 401) {
          console.log("token失效，尝试重新获取")
          if (isRefreshToken) {
            // 正在刷新token,把其他请求存起来
            requestList.push(() => {
              resolve(request(options))
            })
            return;
          }
          isRefreshToken = true;
          // 发送请求, 进行刷新token操作, 获取新的token
          const res = await reqRefreshToken(loginInfo);
          if (!res || res.data.code != 200) {
            requestList = [];
            isRefreshToken = false;
            console.log("刷新token失败")
            getApp().exit();
            return;
          }
          let newInfo = res.data.data;
          newInfo.expireTime = new Date().getTime() + newInfo.refreshTokenExpiresIn*1000;
          uni.setStorageSync("loginInfo", newInfo);
          requestList.forEach(cb => cb());
          requestList = [];
          isRefreshToken = false;
          // 重新发送刚才的请求
          return resolve(request(options))

        } else {
          uni.showToast({
            icon: "none",
            title: res.data.message,
            duration: 1500
          })
          return reject(res.data)
        }
      },
      fail(error) {
        // 请求重试机制
        if(retryCount < MAX_RETRIES) {
          setTimeout(() => {
            resolve(request(options, retryCount + 1));
          }, RETRY_DELAY * (retryCount + 1));
          return;
        }
        
        uni.showToast({
          title: "网络似乎有点不给力，请稍后重试",
          duration: 1500
        })
        return reject(error)
      }
		});
	});
}


// 工具函数
function checkRateLimit() {
  const now = Date.now();
  if(requestCounter >= MAX_REQUESTS) {
    return false;
  }
  requestCounter++;
  setTimeout(() => requestCounter--, TIME_WINDOW);
  return true;
}

function generateCSRFToken() {
  return lib.WordArray.random(16).toString();
}

function generateSignature(data, timestamp) {
  if (!config.API_SECRET) {
    throw new Error('Missing API secret');
  }
  const stringToSign = JSON.stringify(data) + timestamp + config.API_SECRET;
  const signature = HmacSHA256(stringToSign, config.API_SECRET).toString();
  
  // 增加签名安全检查
  if (!signature || signature.length < 32) {
    throw new Error('Invalid signature generated');
  }
  
  return signature;
}

function encryptData(data) {
  if (!config.ENABLE_ENCRYPTION) {
    return data;
  }
  try {
    if (!config.ENCRYPT_KEY) {
      throw new Error('Missing encryption key');
    }
    const jsonStr = JSON.stringify(data);
    return AES.encrypt(jsonStr, config.ENCRYPT_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('数据加密失败');
  }
}

function decryptData(encryptedData) {
  if (!UNI_APP.ENABLE_ENCRYPTION) {
    return encryptedData;
  }
  try {
    const bytes = AES.decrypt(encryptedData, UNI_APP.ENCRYPT_KEY);
    return JSON.parse(bytes.toString(enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('数据解密失败');
  }
}

function validateResponse(res) {
  if (!config.VALIDATE_RESPONSE) {
    return true;
  }
  
  if (!res || !res.header) {
    return false;
  }
  
  const signature = res.header['X-Response-Signature'];
  const timestamp = res.header['X-Response-Timestamp'];
  
  if (!signature || !timestamp) {
    return false;
  }
  
  try {
    const calculatedSignature = generateSignature(res.data, timestamp);
    return signature === calculatedSignature;
  } catch (error) {
    console.error('Response validation failed:', error);
    return false;
  }
}

const reqRefreshToken = (loginInfo) => {
  return new Promise(function(resolve, reject) {
    uni.request({
      method: 'PUT',
      url: config.BASE_URL + '/refreshToken',
      header: {
        refreshToken: loginInfo.refreshToken,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      },
      success: (res) => {
        resolve(res);
      },
      fail: (res) => {
        reject(res);
      }
    });
  });
}

export default request;