<template>
	<view class="tab-page">

		<view v-if="loading" class="chat-loading">
			<loading :size="50" :mask="false">
				<view>{{ $t('xiao_xi_jie_shou_zhong') }}</view>
			</loading>
		</view>
		<view class="chat-tip" v-if="!loading && chatStore.chats.length==0">
			{{ $t('wen_xin_ti_shi_nin_xian_zai_hu') }}
		</view>
		<scroll-view class="scroll-bar" v-else scroll-with-animation="true" scroll-y="true">
			<view v-for="(chatPos,i) in chatsPos" :key="i">
				<chat-item v-if="!chatStore.chats[chatPos.idx].delete" :chat="chatStore.chats[chatPos.idx]"
					:active="menu.chatIdx==chatPos.idx" :index="chatPos.idx"
					@longpress.native="onShowMenu($event,chatPos.idx)"></chat-item>
			</view>
		</scroll-view>

		<pop-menu v-show="menu.show" :menu-style="menu.style" :items="menu.items" @close="onCloseMenu()"
			@select="onSelectMenu"></pop-menu>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				menu: {
					show: false,
					style: "",
					chatIdx: -1,
					items: [{
							key: 'DELETE',
							name: uni.$t('shan_chu_gai_liao_tian'),
							icon: 'trash'
						},
						{
							key: 'TOP',
							name: uni.$t('zhi_ding_gai_liao_tian'),
							icon: 'arrow-up'
						}
					]
				}
			}
		},
		methods: {
			onSelectMenu(item) {
				switch (item.key) {
					case 'DELETE':
						this.removeChat(this.menu.chatIdx);
						break;
					case 'TOP':
						this.moveToTop(this.menu.chatIdx);
						break;
					default:
						break;
				}
				this.menu.show = false;
			},
			onShowMenu(e, chatIdx) {
				this.menu.chatIdx = chatIdx;
				uni.getSystemInfo({
					success: (res) => {
						let touches = e.touches[0];
						let style = "";
						/* 因 非H5端不兼容 style 属性绑定 Object ，所以拼接字符 */
						if (touches.clientY > (res.windowHeight / 2)) {
							style = `bottom:${res.windowHeight-touches.clientY}px;`;
						} else {
							style = `top:${touches.clientY}px;`;
						}
						if (touches.clientX > (res.windowWidth / 2)) {
							style += `right:${res.windowWidth-touches.clientX}px;`;
						} else {
							style += `left:${touches.clientX}px;`;
						}
						this.menu.style = style;
						this.menu.chatIdx = chatIdx;
						// 
						this.$nextTick(() => {
							this.menu.show = true;
						});
					}
				})
			},
			onCloseMenu() {
				this.menu.chatIdx = -1;
				this.menu.show = false;
			},
			removeChat(chatIdx) {
				this.$store.commit("removeChat", chatIdx);
			},
			moveToTop(chatIdx) {
				this.$store.commit("moveTop", chatIdx);
			},
			refreshUnreadBadge() {
				if (this.unreadCount > 0) {
					uni.setTabBarBadge({
						index: 0,
						text: this.unreadCount + ""
					})
				} else {
					uni.removeTabBarBadge({
						index: 0,
						complete: () => {}
					})

				}
			}
		},
		computed: {
			chatsPos() {
				// 计算会话的顺序
				let chatsPos = [];
				let chats = this.chatStore.chats;
				chats.forEach((chat, idx) => {
					chatsPos.push({
						idx: idx,
						sendTime: chat.lastSendTime
					})
				})
				chatsPos.sort((chatPos1, chatPos2) => {
					return chatPos2.sendTime - chatPos1.sendTime;
				});
				return chatsPos;
			},
			chatStore() {
				return this.$store.state.chatStore;
			},
			unreadCount() {
				let count = 0;
				this.chatStore.chats.forEach(chat => {
					if (!chat.delete) {
						count += chat.unreadCount;
					}
				})
				return count;
			},
			loading() {
				return this.chatStore.loadingGroupMsg || this.chatStore.loadingPrivateMsg
			}
		},
		watch: {
			unreadCount(newCount, oldCount) {
				this.refreshUnreadBadge();
			}
		},
		onShow() {
			this.refreshUnreadBadge();
		}
	}
</script>

<style scoped lang="scss">
	.tab-page {
		position: relative;
		border: #dddddd solid 1px;
		display: flex;
		flex-direction: column;

		.chat-tip {
			position: absolute;
			top: 400rpx;
			padding: 50rpx;
			line-height: 50rpx;
			text-align: left;
			color: darkblue;
			font-size: 30rpx;
		}

		.chat-loading {
			display: block;
			width: 100%;
			height: 100rpx;
			background: white;
			position: relative;
			color: blue;

			.loading-box {
				position: relative;

			}
		}

		.scroll-bar {
			flex: 1;
			height: 100%;
		}
	}
</style>