<template>
	<!-- for wx audit -->
	<view class="page user-search">
		<view class="search-bar">
			<uni-search-bar v-model="searchText" :focus="true" @confirm="onSearch()" can
				cancelButton="none" :ceholder="$t('yong_hu_ming_huo_ni_cheng')"></uni-search-bar>
		</view>
		<view class="user-items">
			<scroll-view class="scroll-bar" scroll-with-animation="true" scroll-y="true">
				<view v-for="(user) in users" :key="user.id" v-show="user.id != $store.state.userStore.userInfo.id">
					<view class="user-item">
						<head-image :id="user.id" :name="user.nickName" 
							:online="user.online" :url="user.headImage"
							:size="100"></head-image>
						<view class="user-name">{{ user.nickName}}</view>
						<view class="user-btns">
							<button type="primary" v-show="!isFriend(user.id)" size="mini"
								@click.stop="onAddFriend(user)">{{ $t('jia_wei_hao_you') }}</button>
							<button type="default" v-show="isFriend(user.id)" size="mini" disabled>{{ $t('yi_tian_jia') }}</button>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchText: "",
				users: []
			}
		},
		methods: {
			onSearch() {
				this.$http({
					url: "/user/findByName?name=" + this.searchText,
					method: "GET"
				}).then((data) => {
					this.users = data;
				})
			},
			onAddFriend(user) {
				this.$http({
					url: "/friend/add?friendId=" + user.id,
					method: "POST"
				}).then((data) => {
					let friend = {
						id: user.id,
						nickName: user.nickName,
						headImage: user.headImage,
						online: user.online
					}
					this.$store.commit("addFriend", friend);
					uni.showToast({
						title: uni.$t('tian_jia_cheng_gong_dui_fang_y'),
						icon: "none"
					})
				})
			},
			onShowUserInfo(user) {
				uni.navigateTo({
					url: "/pages/common/user-info?id=" + user.id
				})
			},
			isFriend(userId) {
				let friends = this.$store.state.friendStore.friends;
				let friend = friends.find((f) => f.id == userId);
				return friend&&!friend.delete;
			}
		}
	}
</script>

<style scoped lang="scss">
	.user-search {
		position: relative;
		border: #dddddd solid 1px;
		display: flex;
		flex-direction: column;

		.search-bar {
			background: white;
		}
		.user-items{
			position: relative;
			flex: 1;
			overflow: hidden;
			.user-item {
				height: 120rpx;
				display: flex;
				margin-bottom: 1rpx;
				position: relative;
				padding: 0 30rpx ;
				align-items: center;
				background-color: white;
				white-space: nowrap;
			
				.user-name {
					flex:1;	
					padding-left: 20rpx;
					font-size: 30rpx;
					font-weight: 600;
					line-height: 60rpx;
					white-space: nowrap;
					overflow: hidden;
				}
			}
			
			.scroll-bar {
				height: 100%;
			}
		}
		
	}
</style>