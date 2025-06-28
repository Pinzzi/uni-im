<template>
	<view class="page dark-mode">
		<view class="settings-group">
			<theme-switcher class="theme-switcher"></theme-switcher>
			<view class="setting-description">
				<text>切换深色/浅色主题</text>
			</view>
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
			return {}
		},
		methods: {}
	}
</script>

<style scoped lang="scss">
	.dark-mode {
		.content-title {
			padding: 30rpx 40rpx;
			font-size: 36rpx;
			font-weight: 600;
			text-align: center;
			color: #666666;
		}

		.settings-group {
			padding: 20rpx 40rpx;

			.theme-switcher {
				margin: 20rpx 0;
			}

			.setting-description {
				margin-top: 20rpx;
				text-align: center;
				font-size: 28rpx;
				color: #666666;
			}
		}
	}
</style>
