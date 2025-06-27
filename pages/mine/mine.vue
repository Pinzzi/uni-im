<template>
	<view class="page mine">
		<view class="content" @click="onModifyInfo()">
			<head-image
				:name="userInfo.nickName"  
				:url="userInfo.headImage"
				:size="160"
			></head-image>
			<view class="info-item">
				<view class="info-primary">
					<text class="info-username">
						{{userInfo.userName}}
					</text>
					<text v-show="userInfo.sex==0" class="iconfont icon-man" 
						color="darkblue"></text>
					<text v-show="userInfo.sex==1" class="iconfont icon-girl"
						color="darkred"></text>
				</view>
				<text>
					{{ $t('ni_cheng') }} ：{{userInfo.nickName}}
				</text>
				<text>
					{{ $t('qian_ming') }} ：{{userInfo.signature}}
				</text>
			</view>
			<view class="info-arrow"></view>
		</view>
		<view class="line"></view>
		<view class="settings-group">
			<view class="settings-item" @click="onModifyPassword()">
				<image class="item-icon" src="@/static/settings/keys.png"></image>
				<!-- <text class="item-icon iconfont icon-password"></text> -->
				<text class="item-text">{{ $t('xiu_gai_mi_ma') }}</text>
				<text class="item-arrow"></text>
			</view>

			<view class="settings-item" @click="onSecurityPrivacy()">
				<image class="item-icon" src="@/static/settings/security_privacy.png"></image>
				<!-- <text class="item-icon iconfont icon-security"></text> -->
				<text class="item-text">安全隐私</text>
				<text class="item-arrow"></text>
			</view>

			<view class="settings-item" @click="onLanguageChange()">
				<image class="item-icon" src="@/static/settings/language_switcher.png"></image>
				<!-- <text class="item-icon iconfont icon-language"></text> -->
				<text class="item-text">语言切换</text>
				<text class="item-arrow"></text>
			</view>

			<view class="settings-item" @click="onNotificationSettings()">
				<image class="item-icon" src="@/static/settings/bell.png"></image>
				<!-- <text class="item-icon iconfont icon-notification"></text> -->
				<text class="item-text">通知设置</text>
				<text class="item-arrow"></text>
			</view>

			<view class="settings-item" @click="onStorageCleanup()">
				<image class="item-icon" src="@/static/settings/delete.png"></image>
				<!-- <text class="item-icon iconfont icon-storage"></text> -->
				<text class="item-text">清理存储空间</text>
				<text class="item-arrow"></text>
			</view>

			<view class="settings-item" @click="onDarkMode()">
				<image class="item-icon" src="@/static/settings/dark_mode_switch.png"></image>
				<!-- <text class="item-icon iconfont icon-theme"></text> -->
				<text class="item-text">深色模式</text>
				<text class="item-arrow"></text>
			</view>

			<button class="logout-button" @click="onQuit()">{{ $t('tui_chu_deng_lu') }}</button>
		</view>
	</view>
</template>

<script>
	import ThemeSwitcher from '@/components/theme-switcher/theme-switcher.vue'
	
	export default {
		components: {
			ThemeSwitcher
		},
		data() {
			return {
				showDarkModeSubMenu: false
			}
		},
		methods: {
			onModifyInfo() {
				uni.navigateTo({
					url: "/pages/mine/mine-edit"
				})
			},
			onModifyPassword() {
				uni.navigateTo({
					url: "/pages/mine/mine-password"
				})
			},
			onSecurityPrivacy() {
				uni.showToast({
					title: '安全隐私功能开发中',
					icon: 'none'
				});
			},
			onLanguageChange() {
				uni.showToast({
					title: '语言切换功能开发中',
					icon: 'none'
				});
			},
			onNotificationSettings() {
				uni.showToast({
					title: '通知设置功能开发中',
					icon: 'none'
				});
			},
			onStorageCleanup() {
				uni.showToast({
					title: '清理存储功能开发中',
					icon: 'none'
				});
			},
			onDarkMode() {
				uni.navigateTo({
					url: "/pages/mine/dark-mode"
				});
			},
			onQuit() {
				uni.showModal({
					title: uni.$t('que_ren_tui_chu'),
					success: (res) => {
						if (res.confirm) {
							getApp().exit()
						}
					}
				});
			}
		},
		computed: {
			userInfo() {
				return this.$store.state.userStore.userInfo;
			}
		}
	}
</script>

<style scoped lang="scss">
	.mine {
		.content {
			height: 200rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx;

			.info-item {
				display: flex;
				align-items: flex-start;
				flex-direction: column;
				padding-left: 40rpx;
				flex: 1;

				.info-primary {
					display: flex;
					align-items: center;
					.info-username {
						font-size: 40rpx;
						font-weight: 600;
					}
					
					.icon-man {
						color: darkblue;
					}
					
					.icon-girl {
						color: darkred;
					}
				}
			}

			.info-arrow {
				width: 50rpx;
				font-size: 30rpx;
				font-weight: 600;
			}
		}

		.line {
			margin: 20rpx;
			border-bottom: 1px solid #aaaaaa;
		}

		.settings-group {
			padding: 0 40rpx;

			.settings-item {
				display: flex;
				align-items: center;
				padding: 30rpx 0;
				border-bottom: 1px solid #eeeeee;

				.item-icon {
					font-size: 36rpx;
					margin-right: 20rpx;
					width: 40rpx;
					height: 40rpx;
					text-align: center;
				}

				.item-text {
					flex: 1;
					font-size: 32rpx;
				}

				.item-arrow {
					font-size: 30rpx;
					font-weight: 600;
					color: #999999;
				}

			}

			.logout-button {
				margin-top: 100rpx;
				width: 90%;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				background-color: #eaeaea;
				color: #233333;
				border-radius: 20rpx;
				border: none;
				font-size: 34rpx;
				box-shadow: 0 6rpx 8rpx rgba(0, 0, 0, 0.1), 0 1rpx 3rpx rgba(0, 0, 0, 0.08);
				transition: background-color 0.3s, color 0.3s;
			}
			.logout-button:hover {
				background-color: #cdcdcd;
				color: #333;
			}

			.sub-menu {
				padding-left: 60rpx;
				background-color: rgba(0, 0, 0, 0.02);

				.theme-switcher {
					margin: 20rpx 0;
				}
			}
		}
	}
</style>