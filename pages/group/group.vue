<template>
	<view v-if="$store.state.userStore.userInfo.type == 1" class="tab-page group">
		<view class="nav-bar">
			<view class="nav-search">
				<uni-search-bar @focus="onFocusSearch" cancelButton="none" :placeholder="$t('dian_ji_sou_suo_qun_liao')"></uni-search-bar>
			</view>
			<view class="nav-add" @click="onCreateNewGroup()">
				<uni-icons type="personadd" size="30"></uni-icons>
			</view>
		</view>
		<view class="group-tip" v-if="$store.state.groupStore.groups.length==0">
			{{ $t('wen_xin_ti_shi_nin_xian_zai_hu-0') }}
		</view>
		<view class="group-items" v-else>
			<scroll-view class="scroll-bar" scroll-with-animation="true" scroll-y="true">
				<view v-for="group in $store.state.groupStore.groups" :key="group.id">
					<group-item v-if="!group.quit" :group="group"></group-item>
				</view>
			</scroll-view>
		</view>
	</view>
	<!-- wx audit -->
	<view v-else>
		<user-search></user-search>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			onFocusSearch() {},
			onCreateNewGroup() {
				uni.navigateTo({
					url: "/pages/group/group-edit"
				})
			}
		}
		
	}
</script>

<style lang="scss" scoped>
	.group {
		position: relative;
		border: #dddddd solid 1px;
		display: flex;
		flex-direction: column;

		.nav-bar {
			margin: 5rpx;
			display: flex;
			align-items: center;
			background-color: white;

			.nav-search {
				flex: 1;
			}

			.nav-add {
				line-height: 56px;
				cursor: pointer;
			}
		}

		.group-tip{
			position: absolute;
			top: 400rpx;
			padding: 50rpx;
			text-align: left;
			line-height: 50rpx;
			color: darkblue;
			font-size: 30rpx;
		}

		.group-items {
			flex: 1;
			padding: 0;
			border: #dddddd solid 1px;
			overflow: hidden;
			position: relative;

			.scroll-bar {
				height: 100%;
			}
		}
	}
</style>