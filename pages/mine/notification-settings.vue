<template>
	<view class="notification-settings-page">
		<view class="header">
			<view class="back-button" @click="goBack">
				<text class="iconfont icon-back"></text>
			</view>
			<text class="title">{{ $t('notification_settings') }}</text>
		</view>

		<view class="settings-group">
			<view class="group-title">{{ $t('message_notifications') }}</view>

			<view class="settings-item">
				<text class="item-text">{{ $t('enable_notifications') }}</text>
				<switch :checked="settings.enableNotifications" @change="toggleNotifications" />
			</view>

			<view class="settings-item">
				<text class="item-text">{{ $t('sound') }}</text>
				<switch :checked="settings.sound" @change="toggleSound" :disabled="!settings.enableNotifications" />
			</view>

			<view class="settings-item">
				<text class="item-text">{{ $t('vibration') }}</text>
				<switch :checked="settings.vibration" @change="toggleVibration" :disabled="!settings.enableNotifications" />
			</view>
		</view>

		<view class="settings-group">
			<view class="group-title">{{ $t('do_not_disturb') }}</view>

			<view class="settings-item">
				<text class="item-text">{{ $t('qi_yong') }}</text>
				<switch :checked="settings.dndEnabled" @change="toggleDND" />
			</view>

			<view class="time-selector" v-if="settings.dndEnabled">
				<view class="time-item">
					<text>{{ $t('start_time') }}</text>
					<picker mode="time" :value="settings.dndStartTime" @change="changeDNDStartTime">
						<view class="picker-value">{{ settings.dndStartTime }}</view>
					</picker>
				</view>

				<view class="time-item">
					<text>{{ $t('end_time') }}</text>
					<picker mode="time" :value="settings.dndEndTime" @change="changeDNDEndTime">
						<view class="picker-value">{{ settings.dndEndTime }}</view>
					</picker>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			settings: {
				enableNotifications: true,
				sound: true,
				vibration: true,
				dndEnabled: false,
				dndStartTime: '22:00',
				dndEndTime: '07:00'
			}
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		toggleNotifications(e) {
			this.settings.enableNotifications = e.detail.value;
			this.saveSettings();
			uni.showToast({
				title: this.settings.enableNotifications ? 
					this.$t('notifications_enabled') : 
					this.$t('notifications_disabled'),
				icon: 'none'
			});
		},
		toggleSound(e) {
			this.settings.sound = e.detail.value;
			this.saveSettings();
		},
		toggleVibration(e) {
			this.settings.vibration = e.detail.value;
			this.saveSettings();
		},
		toggleDND(e) {
			this.settings.dndEnabled = e.detail.value;
			this.saveSettings();
			uni.showToast({
				title: this.settings.dndEnabled ? 
					this.$t('dnd_enabled') : 
					this.$t('dnd_disabled'),
				icon: 'none'
			});
		},
		changeDNDStartTime(e) {
			this.settings.dndStartTime = e.detail.value;
			this.saveSettings();
		},
		changeDNDEndTime(e) {
			this.settings.dndEndTime = e.detail.value;
			this.saveSettings();
		},
		saveSettings() {
			// 这里可以添加将设置保存到本地存储或后端的逻辑
			console.log('Settings saved:', this.settings);
		}
	},
	onLoad() {
		// 这里可以添加从本地存储或后端加载设置的逻辑
		console.log('Notification settings loaded');
	}
}
</script>

<style lang="scss" scoped>
.notification-settings-page {
	padding: 20rpx;

	.header {
		display: flex;
		align-items: center;
		height: 100rpx;
		margin-bottom: 30rpx;

		.back-button {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			.icon-back {
				font-size: 40rpx;
			}
		}

		.title {
			flex: 1;
			text-align: center;
			font-size: 36rpx;
			font-weight: bold;
			padding-right: 60rpx;
		}
	}

	.settings-group {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin-bottom: 30rpx;

		.group-title {
			padding: 20rpx;
			font-size: 28rpx;
			color: #666666;
			background-color: #f8f8f8;
		}

		.settings-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 20rpx;
			border-bottom: 1px solid #f0f0f0;

			.item-text {
				font-size: 32rpx;
			}
		}

		.time-selector {
			padding: 20rpx;

			.time-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx 0;
				border-bottom: 1px solid #f0f0f0;

				&:last-child {
					border-bottom: none;
				}

				.picker-value {
					color: #007AFF;
					font-size: 32rpx;
				}
			}
		}
	}
}
</style>