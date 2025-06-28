<template>
	<view class="storage-cleanup-page">
		<view class="header">
			<view class="back-button" @click="goBack">
				<text class="iconfont icon-back"></text>
			</view>
			<text class="title">{{ $t('storage_cleanup') }}</text>
		</view>

		<view class="storage-info">
			<view class="storage-bar">
				<view class="storage-used" :style="{ width: storagePercentage + '%' }"></view>
			</view>
			<view class="storage-text">
				{{ $t('used_storage') }}: {{ usedStorage }} / {{ totalStorage }} ({{ storagePercentage }}%)
			</view>
		</view>

		<view class="cleanup-options">
			<view class="cleanup-item" @click="selectOption('images')">
				<view class="item-content">
					<image class="item-icon" src="/static/settings/images.png"></image>
					<view class="item-details">
						<text class="item-title">{{ $t('images') }}</text>
						<text class="item-size">{{ storage.images }}</text>
					</view>
				</view>
				<checkbox :checked="selectedOptions.includes('images')" />
			</view>

			<view class="cleanup-item" @click="selectOption('videos')">
				<view class="item-content">
					<image class="item-icon" src="/static/settings/videos.png"></image>
					<view class="item-details">
						<text class="item-title">{{ $t('videos') }}</text>
						<text class="item-size">{{ storage.videos }}</text>
					</view>
				</view>
				<checkbox :checked="selectedOptions.includes('videos')" />
			</view>

			<view class="cleanup-item" @click="selectOption('files')">
				<view class="item-content">
					<image class="item-icon" src="/static/settings/files.png"></image>
					<view class="item-details">
						<text class="item-title">{{ $t('files') }}</text>
						<text class="item-size">{{ storage.files }}</text>
					</view>
				</view>
				<checkbox :checked="selectedOptions.includes('files')" />
			</view>

			<view class="cleanup-item" @click="selectOption('cache')">
				<view class="item-content">
					<image class="item-icon" src="/static/settings/cache.png"></image>
					<view class="item-details">
						<text class="item-title">{{ $t('cache') }}</text>
						<text class="item-size">{{ storage.cache }}</text>
					</view>
				</view>
				<checkbox :checked="selectedOptions.includes('cache')" />
			</view>
		</view>

		<button class="cleanup-button" @click="cleanupStorage" :disabled="selectedOptions.length === 0">
			{{ $t('cleanup_selected') }} ({{ selectedOptionsSize }})
		</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			storage: {
				images: '120 MB',
				videos: '250 MB',
				files: '80 MB',
				cache: '45 MB'
			},
			usedStorage: '495 MB',
			totalStorage: '1 GB',
			storagePercentage: 48,
			selectedOptions: []
		}
	},
	computed: {
		selectedOptionsSize() {
			let totalSize = 0;
			this.selectedOptions.forEach(option => {
				const size = parseInt(this.storage[option]);
				if (!isNaN(size)) {
					totalSize += size;
				}
			});
			return totalSize > 0 ? totalSize + ' MB' : '0 MB';
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		selectOption(option) {
			const index = this.selectedOptions.indexOf(option);
			if (index === -1) {
				this.selectedOptions.push(option);
			} else {
				this.selectedOptions.splice(index, 1);
			}
		},
		cleanupStorage() {
			if (this.selectedOptions.length === 0) return;

			uni.showModal({
				title: this.$t('confirm_cleanup'),
				content: this.$t('cleanup_warning'),
				success: (res) => {
					if (res.confirm) {
						// 模拟清理过程
						uni.showLoading({
							title: this.$t('cleaning_up')
						});

						setTimeout(() => {
							uni.hideLoading();

							// 更新存储使用情况
							let newUsedStorage = parseInt(this.usedStorage);
							this.selectedOptions.forEach(option => {
								const size = parseInt(this.storage[option]);
								if (!isNaN(size)) {
									newUsedStorage -= size;
									this.storage[option] = '0 MB';
								}
							});

							this.usedStorage = newUsedStorage + ' MB';
							this.storagePercentage = Math.floor((newUsedStorage / 1024) * 100);
							this.selectedOptions = [];

							uni.showToast({
								title: this.$t('cleanup_completed'),
								icon: 'success'
							});
						}, 2000);
					}
				}
			});
		}
	},
	onLoad() {
		// 这里可以添加从本地存储或后端加载存储使用情况的逻辑
		console.log('Storage cleanup page loaded');
	}
}
</script>

<style lang="scss" scoped>
.storage-cleanup-page {
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

	.storage-info {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		padding: 30rpx 20rpx;
		margin-bottom: 30rpx;

		.storage-bar {
			height: 20rpx;
			background-color: #f0f0f0;
			border-radius: 10rpx;
			overflow: hidden;
			margin-bottom: 20rpx;

			.storage-used {
				height: 100%;
				background-color: #007AFF;
				border-radius: 10rpx;
			}
		}

		.storage-text {
			font-size: 28rpx;
			color: #666666;
			text-align: center;
		}
	}

	.cleanup-options {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin-bottom: 30rpx;

		.cleanup-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 30rpx 20rpx;
			border-bottom: 1px solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.item-content {
				display: flex;
				align-items: center;
				flex: 1;

				.item-icon {
					width: 60rpx;
					height: 60rpx;
					margin-right: 20rpx;
				}

				.item-details {
					display: flex;
					flex-direction: column;

					.item-title {
						font-size: 32rpx;
						margin-bottom: 5rpx;
					}

					.item-size {
						font-size: 26rpx;
						color: #999999;
					}
				}
			}
		}
	}

	.cleanup-button {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		background-color: #007AFF;
		color: #ffffff;
		border-radius: 45rpx;
		font-size: 34rpx;

		&[disabled] {
			background-color: #cccccc;
		}
	}
}
</style>