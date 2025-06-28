<template>
	<view class="security-privacy-page">
		<view class="header">
			<view class="back-button" @click="goBack">
				<text class="iconfont icon-back"></text>
			</view>
			<text class="title">{{ $t('security_privacy') }}</text>
		</view>

		<view class="settings-group">
			<view class="settings-item" @click="togglePrivateMode">
				<text class="item-text">{{ $t('private_mode') }}</text>
				<switch :checked="isPrivateModeEnabled" @change="togglePrivateMode" />
			</view>

			<view class="settings-item" @click="toggleAutoLock">
				<text class="item-text">{{ $t('auto_lock') }}</text>
				<switch :checked="isAutoLockEnabled" @change="toggleAutoLock" />
			</view>

			<view class="settings-item" @click="openBiometricSettings">
				<text class="item-text">{{ $t('biometric_auth') }}</text>
				<text class="item-arrow">></text>
			</view>

			<view class="settings-item" @click="openDeviceManagement">
				<text class="item-text">{{ $t('device_management') }}</text>
				<text class="item-arrow">></text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isPrivateModeEnabled: false,
			isAutoLockEnabled: true
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		togglePrivateMode(e) {
			this.isPrivateModeEnabled = e.detail ? e.detail.value : !this.isPrivateModeEnabled;
			uni.showToast({
				title: this.isPrivateModeEnabled ? 
					this.$t('private_mode_enabled') : 
					this.$t('private_mode_disabled'),
				icon: 'none'
			});
		},
		toggleAutoLock(e) {
			this.isAutoLockEnabled = e.detail ? e.detail.value : !this.isAutoLockEnabled;
			uni.showToast({
				title: this.isAutoLockEnabled ? 
					this.$t('auto_lock_enabled') : 
					this.$t('auto_lock_disabled'),
				icon: 'none'
			});
		},
		openBiometricSettings() {
			uni.showToast({
				title: this.$t('biometric_settings_coming_soon'),
				icon: 'none'
			});
		},
		openDeviceManagement() {
			uni.showToast({
				title: this.$t('device_management_coming_soon'),
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.security-privacy-page {
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

		.settings-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 20rpx;
			border-bottom: 1px solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.item-text {
				font-size: 32rpx;
			}

			.item-arrow {
				color: #999999;
				font-size: 32rpx;
			}
		}
	}
}
</style>