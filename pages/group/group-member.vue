<template>
	<view v-if="$store.state.userStore.userInfo.type == 1" class="page group-member">
		<view class="search-bar">
			<uni-search-bar v-model="searchText" cancelButton="none" :placeholder="$t('shu_ru_cheng_yuan_ni_cheng_sou')"></uni-search-bar>
		</view>
		<view class="member-items">
			<scroll-view class="scroll-bar" scroll-with-animation="true" scroll-y="true">
				<view v-for="(member,idx) in groupMembers"
					v-show="!searchText || member.aliasName.startsWith(searchText)" :key="idx">
					<view class="member-item" @click="onShowUserInfo(member.userId)">
						<head-image :name="member.aliasName" 
							:online="member.online" :url="member.headImage"
							:size="100"></head-image>
						
						<view class="member-name">{{ member.aliasName}}</view>
						
						<view class="member-kick">
							<button type="warn" v-show="isOwner && !isSelf(member.userId)" size="mini"
								@click.stop="onKickOut(member,idx)">{{ $t('yi_chu_qun_liao') }}</button>
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
				isModify: false,
				searchText: "",
				group: {},
				groupMembers: []
			}
		},
		methods: {
			onShowUserInfo(userId) {
				uni.navigateTo({
					url: "/pages/common/user-info?id=" + userId
				})
			},
			onKickOut(member, idx) {
				let before_opt_tips_txt = uni.$t('que_ding_jiang_gai_cheng_yuan')
				let action_done_tips_txt = uni.$t('gai_cheng_yuan_yi_bei_yi_chu_g')
				uni.showModal({
					title: uni.$t('que_ren_yi_chu'),
					content: `${before_opt_tips_txt}\n${member.aliasName}`,
					success: (res) => {
						if (res.cancel)
							return;
						this.$http({
							url: `/group/kick/${this.group.id}?userId=${member.userId}`,
							method: 'DELETE'
						}).then(() => {
							uni.showToast({
								title: `${member.aliasName}\n${action_done_tips_txt}`,
								icon: 'none'
							})
							this.groupMembers.splice(idx, 1);
							this.isModify = true;
						});
					}
				})
			},
			loadGroupInfo(id) {
				this.$http({
					url: `/group/find/${id}`,
					method: 'GET'
				}).then((group) => {
					this.group = group;
				});
			},
			loadGroupMembers(id) {
				this.$http({
					url: `/group/members/${id}`,
					method: "GET"
				}).then((members) => {
					this.groupMembers = members.filter(m => !m.quit);
				})
			},
			isSelf(userId) {
				return this.$store.state.userStore.userInfo.id == userId
			}
		},
		computed: {
			isOwner() {
				return this.$store.state.userStore.userInfo.id == this.group.ownerId;
			}
		},
		onLoad(options) {
			this.loadGroupInfo(options.id);
			this.loadGroupMembers(options.id);
		},
		onUnload() {
			if (this.isModify) {
				// 刷新页面
				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2];
				prevPage.$vm.loadGroupMembers();
			}
		}
	}
</script>

<style scoped lang="scss">
	.group-member {
		position: relative;
		border: #dddddd solid 1px;
		display: flex;
		flex-direction: column;

		.member-items {
			position: relative;
			flex: 1;
			overflow: hidden;

			.member-item {
				height: 120rpx;
				display: flex;
				margin-bottom: 1rpx;
				position: relative;
				padding: 0 30rpx ;
				align-items: center;
				background-color: white;
				white-space: nowrap;
			
				.member-name {
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