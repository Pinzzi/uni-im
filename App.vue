<template>
	<view class="container">
		<!-- 语言切换动画，放在最顶层 -->
		<language-switch-transition
			v-if="isReady && languageTransition"
			:lang-flag="languageTransition.langFlag"
			:lang-name="languageTransition.langName"
		/>

		<!-- #ifdef MP -->
		<view class="blank-view"></view>
		<!-- #endif -->
		<view class="content">
			<router-view></router-view>
		</view>
	</view>
</template>

<script>
import { useStore } from 'vuex'
import { ref, computed, nextTick, onMounted, provide, getCurrentInstance } from 'vue'
import http from './common/request';
import * as enums from './common/enums';
import * as wsApi from './common/wssocket';
import UNI_APP from '@/.env.js'
import languageSwitchTransition from '@/components/language-switch-transition/index.vue'

export default {
  components: {
    languageSwitchTransition
  },
  setup() {
    const { proxy } = getCurrentInstance()
    const store = useStore()
    const isReady = ref(false)
    const audioTip = ref(null)
    const languageTransition = computed(() => store.state.transitionStore.languageTransition)
    
    const playAudioTip = () => {
      audioTip.value = uni.createInnerAudioContext()
      audioTip.value.src = '/static/audio/tip.wav'
      audioTip.value.play()
    }
    
    // 添加消息处理方法
    const handlePrivateMessage = (msg) => {
      if (msg.type == enums.MESSAGE_TYPE.LOADDING) {
        store.commit("loadingPrivateMsg", JSON.parse(msg.content))
        return;
      }
      if (msg.type == enums.MESSAGE_TYPE.READED) {
        store.commit("resetUnreadCount", {
          type: 'PRIVATE',
          targetId: msg.recvId
        })
        return;
      }
      if (msg.type == enums.MESSAGE_TYPE.RECEIPT) {
        store.commit("readedMessage", { friendId: msg.sendId })
        return;
      }
      msg.selfSend = msg.sendId == store.state.userStore.userInfo.id;
      let friendId = msg.selfSend ? msg.recvId : msg.sendId;
      loadFriendInfo(friendId).then((friend) => {
        insertPrivateMessage(friend, msg);
      })
    }

    const handleGroupMessage = (msg) => {
      if (msg.type == enums.MESSAGE_TYPE.LOADDING) {
        store.commit("loadingGroupMsg",JSON.parse(msg.content))
        return;
      }
      if (msg.type == enums.MESSAGE_TYPE.READED) {
        let chatInfo = {
          type: 'GROUP',
          targetId: msg.groupId
        }
        store.commit("resetUnreadCount", chatInfo)
        return;
      }
      if (msg.type == enums.MESSAGE_TYPE.RECEIPT) {
        let msgInfo = {
          id: msg.id,
          groupId: msg.groupId,
          readedCount: msg.readedCount,
          receiptOk: msg.receiptOk
        };
        store.commit("updateMessage", msgInfo)
        return;
      }
      msg.selfSend = msg.sendId == store.state.userStore.userInfo.id;
      loadGroupInfo(msg.groupId).then((group) => {
        insertGroupMessage(group, msg);
      })
    }

    const insertPrivateMessage = (friend, msg) => {
      if (msg.type >= enums.MESSAGE_TYPE.RTC_CALL_VOICE &&
        msg.type <= enums.MESSAGE_TYPE.RTC_CANDIDATE) {
        // #ifdef MP-WEIXIN
          return;
        // #endif
        if(msg.type == enums.MESSAGE_TYPE.RTC_CALL_VOICE 
          || msg.type == enums.MESSAGE_TYPE.RTC_CALL_VIDEO){
          let mode = msg.type == enums.MESSAGE_TYPE.RTC_CALL_VIDEO? "video":"voice";
          let pages = getCurrentPages();
          let curPage = pages[pages.length-1].route;
          if(curPage != "pages/chat/chat-video"){
            const friendInfo = encodeURIComponent(JSON.stringify(friend));
            uni.navigateTo({
              url: `/pages/chat/chat-video?mode=${mode}&friend=${friendInfo}&isHost=false`
            })
          }
        }
        setTimeout(() => {
          uni.$emit('WS_RTC',msg);
        },500)
        return;
      }

      let chatInfo = {
        type: 'PRIVATE',
        targetId: friend.id,
        showName: friend.nickName,
        headImage: friend.headImage
      };
      store.commit("openChat", chatInfo);
      store.commit("insertMessage", msg);
      !msg.selfSend && playAudioTip();
    }

    const insertGroupMessage = (group, msg) => {
      let chatInfo = {
        type: 'GROUP',
        targetId: group.id,
        showName: group.remark,
        headImage: group.headImageThumb
      };
      store.commit("openChat", chatInfo);
      store.commit("insertMessage", msg);
      !msg.selfSend && playAudioTip();
    }

    const loadFriendInfo = (id) => {
      return new Promise((resolve, reject) => {
        let friend = store.getters.findFriend(id);
        if (friend) {
          resolve(friend);
        } else {
          http({
            url: `/friend/find/${id}`,
            method: 'GET'
          }).then((friend) => {
            store.commit("addFriend", friend);
            resolve(friend)
          })
        }
      });
    }

    const loadGroupInfo = (id) => {
      return new Promise((resolve, reject) => {
        let group = store.state.groupStore.groups.find((g) => g.id == id);
        if (group) {
          resolve(group);
        } else {
          http({
            url: `/group/find/${id}`, 
            method: 'GET'
          }).then((group) => {
            resolve(group)
            store.commit("addGroup", group);
          })
        }
      });
    }

    const pullPrivateOfflineMessage = (minId) => {
      store.commit("loadingPrivateMsg",true)
      http({
        url: "/message/private/pullOfflineMessage?minId=" + minId,
        method: 'GET'
      }).catch(()=>{
        store.commit("loadingPrivateMsg",false)
      })
    }

    const pullGroupOfflineMessage = (minId) => {
      store.commit("loadingGroupMsg",true)
      http({
        url: "/message/group/pullOfflineMessage?minId=" + minId,
        method: 'GET'
      }).catch(()=>{
        store.commit("loadingGroupMsg",false)
      })
    }

    // store已通过app.use(store)全局提供，此处删除重复provide
    
    // 初始化主题
    store.dispatch('themeStore/initTheme')

    const isExpired = (loginInfo) => {
      if(!loginInfo || !loginInfo.expireTime){
        return true;
      }
      return loginInfo.expireTime < new Date().getTime();
    }

    const initAudit = () => {
      if (store.state.userStore.userInfo.type == 1) {
        uni.setTabBarItem({
          index: 2,
          text: "群聊"
        })
      } else {
        uni.setTabBarItem({
          index: 2,
          text: "搜索"
        })
      }
    }

    const exit = () => {
      console.log("exit");
      wsApi.close(1000);
      uni.removeStorageSync("loginInfo");
      uni.reLaunch({
        url: "/pages/login/login"
      })
      store.dispatch("unload");
    }

    const initWebSocket = () => {
      let loginInfo = uni.getStorageSync("loginInfo")
      wsApi.init();
      wsApi.connect(UNI_APP.WS_URL, loginInfo.accessToken);
      wsApi.onConnect(() => {
        pullPrivateOfflineMessage(store.state.chatStore.privateMsgMaxId);
        pullGroupOfflineMessage(store.state.chatStore.groupMsgMaxId);
      });
      wsApi.onMessage((cmd, msgInfo) => {
        if (cmd == 2) {
          uni.showModal({
            content: '您已在其他地方登陆，将被强制下线',
            showCancel: false,
          })
          exit();
        } else if (cmd == 3) {
          handlePrivateMessage(msgInfo);
        } else if (cmd == 4) {
          handleGroupMessage(msgInfo);
        }
      });
      wsApi.onClose((res) => {
        if (res.code != 1000) {
          uni.showToast({
            title: '连接已断开，尝试重新连接...',
            icon: 'none',
          })
          let loginInfo = uni.getStorageSync("loginInfo")
          wsApi.reconnect(UNI_APP.WS_URL, loginInfo.accessToken);
        }
      })
    }

    const init = () => {
      store.dispatch("load").then(() => {
        initAudit()
        initWebSocket()
      }).catch((e) => {
        console.log(e)
        exit()
      })
    }

    onMounted(async () => {
      await nextTick()
      isReady.value = true
      
      const loginInfo = uni.getStorageSync("loginInfo")
      if (!isExpired(loginInfo)) {
        console.log("初始化")
        init()
        uni.switchTab({
          url: "/pages/chat/chat"
        })
      } else {
        // #ifdef H5
        uni.navigateTo({
          url: "/pages/login/login"
        })
        // #endif
      }
    })
    return {
      isReady,
      languageTransition,
      store,
      audioTip,
      init,
      isExpired,
      handlePrivateMessage,
      handleGroupMessage,
      pullPrivateOfflineMessage,
      pullGroupOfflineMessage,
      playAudioTip
    }
  },
		data() {
			return {
				audioTip: null
			}
		},
		mounted() {
		    // 检查是否安装成功
		    console.log('$t exists?', !!this.$t)
		    console.log('i18n instance', this.$i18n)
		},
		methods: {
			init() {
				// 加载数据
				store.dispatch("load").then(() => {
					// 审核
					this.initAudit();
					// 初始化websocket
					this.initWebSocket();
				}).catch((e) => {
					console.log(e);
					this.exit();
				})
			},
			initWebSocket() {
				let loginInfo = uni.getStorageSync("loginInfo")
				wsApi.init();
				wsApi.connect(UNI_APP.WS_URL, loginInfo.accessToken);
				wsApi.onConnect(() => {
					// 加载离线消息
					this.pullPrivateOfflineMessage(store.state.chatStore.privateMsgMaxId);
					this.pullGroupOfflineMessage(store.state.chatStore.groupMsgMaxId);
				});
				wsApi.onMessage((cmd, msgInfo) => {
					if (cmd == 2) {
						// 异地登录，强制下线
						uni.showModal({
							content: '您已在其他地方登陆，将被强制下线',
							showCancel: false,
						})
						this.exit();
					} else if (cmd == 3) {
						// 私聊消息
						this.handlePrivateMessage(msgInfo);
					} else if (cmd == 4) {
						// 群聊消息
						this.handleGroupMessage(msgInfo);
					}
				});
				wsApi.onClose((res) => {
					// 1000是客户端正常主动关闭
					if (res.code != 1000) {
						// 重新连接
						uni.showToast({
							title: '连接已断开，尝试重新连接...',
							icon: 'none',
						})
						let loginInfo = uni.getStorageSync("loginInfo")
						wsApi.reconnect(UNI_APP.WS_URL, loginInfo.accessToken);
					}
				})
			},
// 删除原methods中的相关方法,已移至setup中
			loadFriendInfo(id) {
				return new Promise((resolve, reject) => {
					let friend = store.getters.findFriend(id);
					if (friend) {
						resolve(friend);
					} else {
						http({
							url: `/friend/find/${id}`,
							method: 'GET'
						}).then((friend) => {
							store.commit("addFriend", friend);
							resolve(friend)
						})
					}
				});
			},
			loadGroupInfo(id) {
				return new Promise((resolve, reject) => {
					let group = store.state.groupStore.groups.find((g) => g.id == id);
					if (group) {
						resolve(group);
					} else {
						http({
							url: `/group/find/${id}`,
							method: 'GET'
						}).then((group) => {
							resolve(group)
							store.commit("addGroup", group);
						})
					}
				});
			},
			exit() {
				console.log("exit");
				wsApi.close(1000);
				uni.removeStorageSync("loginInfo");
				uni.reLaunch({
					url: "/pages/login/login"
				})
				store.dispatch("unload");
			},
      // 已移至setup中实现
      playAudioTip() {
      },
			isExpired(loginInfo){
				if(!loginInfo || !loginInfo.expireTime){
					return true;
				}
				return loginInfo.expireTime < new Date().getTime();
			},
			initAudit() {
				if (store.state.userStore.userInfo.type == 1) {
					// 显示群组功能
					uni.setTabBarItem({
						index: 2,
						text: "群聊"
					})
				} else {
					// 隐藏群组功能
					uni.setTabBarItem({
						index: 2,
						text: "搜索"
					})
				}
			}
		},
    // 删除onLaunch,相关逻辑已移至setup
  }
</script>

<style lang="scss">
@import url('./static/icon/iconfont.css');

.theme-switching * {
  transition: all 0.3s ease-in-out;
}

.container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  transition: all 0.3s ease-in-out;
}

.tab-page {
  /* #ifdef H5 */
  height: calc(100vh - 46px - 50px);
  /* #endif */
  /* #ifndef H5 */
  height: calc(100vh);
  /* #endif */
  background-color: var(--theme-bg);
  transition: all 0.3s ease-in-out;
}

.page {
  /* #ifdef H5 */
  height: calc(100vh - 45px);
  /* #endif */
  /* #ifndef H5 */
  height: calc(100vh);
  /* #endif */
  background-color: var(--theme-bg);
  transition: all 0.3s ease-in-out;
}
</style>