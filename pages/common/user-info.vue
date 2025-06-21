<template>
	<view class="page user-info">
		<view class="content">
			<head-image  :name="userInfo.nickName" :url="userInfo.headImage"
			:size="160" @click="onShowFullImage()"></head-image>
			
			<view class="info-item">
				<view class="info-primary">
					<text class="info-username">
						{{userInfo.userName}}
					</text>
					<uni-icons v-show="userInfo.sex==0" class="sex-boy" type="person-filled" size="20"
						color="darkblue"></uni-icons>
					<uni-icons v-show="userInfo.sex==1" class="sex-girl" type="person-filled" size="20"
						color="darkred"></uni-icons>
				</view>
				<text>
					{{ $t('ni_cheng') }} ：{{userInfo.nickName}}
				</text>
				<text>
					{{ $t('qian_ming') }} ：{{userInfo.signature}}
				</text>
			</view>
		</view>
		<view class="line"></view>
		<view class="btn-group">
			<button class="btn" v-show="isFriend" type="primary" @click="onSendMessage()">{{ $t('fa_xiao_xi') }}</button>
			<button class="btn" v-show="!isFriend" type="primary" @click="onAddFriend()">{{ $t('jia_wei_hao_you') }}</button>
			<button class="btn" v-show="isFriend" type="warn" @click="onDelFriend()">{{ $t('shan_chu_hao_you') }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {}
			}
		},
		methods: {
			onShowFullImage(){
				let imageUrl = this.userInfo.headImage;
				if(imageUrl){
					uni.previewImage({
						urls: [imageUrl]
					})
				}
			},
			onSendMessage() {
				let chat = {
					type: 'PRIVATE',
					targetId: this.userInfo.id,
					showName: this.userInfo.nickName,
					headImage: this.userInfo.headImage,
				};
				this.$store.commit("openChat", chat);
				let chatIdx = this.$store.getters.findChatIdx(chat);
				uni.navigateTo({
					url:"/pages/chat/chat-box?chatIdx=" + chatIdx
				})
			},
			onAddFriend() {
				this.$http({
					url: "/friend/add?friendId=" + this.userInfo.id,
					method: "POST"
				}).then((data) => {
					let friend = {
						id: this.userInfo.id,
						nickName: this.userInfo.nickName,
						headImage: this.userInfo.headImageThumb,
						online: this.userInfo.online
					}
					this.$store.commit("addFriend", friend);
					uni.showToast({
						title: uni.$t('dui_fang_yi_cheng_wei_nin_de_h'),
						icon: 'none'
					})
				})
			},
			onDelFriend(){
				const beforeDelConfirmTipTxt = uni.$t('que_ding_yi_chu_gai_hao_you_ma') 
				const hadDelTipTxt = uni.$t('gai_hao_you_yi_yi_chu')
				uni.showModal({
					title: uni.$t('que_ren_shan_chu'),
					content: `${beforeDelConfirmTipTxt}\n${this.userInfo.nickName}`,
					success: (res)=> {
						if(res.cancel)
							return;
						this.$http({
							url: `/friend/delete/${this.userInfo.id}`,
							method: 'delete'
						}).then((data) => {
							this.$store.commit("removeFriend", this.userInfo.id);
							this.$store.commit("removePrivateChat", this.userInfo.id);
							uni.showToast({
								title: 	`${hadDelTipTxt}\n${this.userInfo.nickName}`,
								icon: 'none'
							})
						})
					}
				})
			},
			updateFriendInfo() {
				// store的数据不能直接修改，深拷贝一份store的数据
				let friend = JSON.parse(JSON.stringify(this.friendInfo));
				friend.headImage = this.userInfo.headImageThumb;
				friend.nickName = this.userInfo.nickName;
				this.$http({
					url: "/friend/update",
					method: "PUT",
					data: friend
				}).then(() => {
					// 更新好友列表中的昵称和头像
					this.$store.commit("updateFriend", friend);
					// 更新会话中的头像和昵称
					this.$store.commit("updateChatFromFriend", this.userInfo);
				})
			},
			loadUserInfo(id){
				this.$http({
					url: "/user/find/" + id,
					method: 'GET'
				}).then((user) => {
					this.userInfo = user;
					// 如果发现好友的头像和昵称改了，进行更新
					if (this.isFriend && (this.userInfo.headImageThumb != this.friendInfo.headImage ||
						this.userInfo.nickName != this.friendInfo.nickName)) {
						this.updateFriendInfo()
					}
				})
			}
		},
		computed: {
			isFriend() {
				return this.friendInfo&&!this.friendInfo.delete;
			},
			friendInfo(){
				let friends = this.$store.state.friendStore.friends;
				let friend = friends.find((f) => f.id == this.userInfo.id);
				return friend;
			}
		},
		onLoad(options) {
			// 查询用户信息
			this.loadUserInfo(options.id);
		}
	}
</script>

<style lang="scss" scoped>
	.user-info {
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

					.info-username {
						font-size: 40rpx;
						font-weight: 600;
					}
				}
			}
		}

		.line {
			margin: 20rpx;
			border-bottom: 1px solid #aaaaaa;
		}

		.btn-group {
			margin: 100rpx;
			
			.btn{
				margin-top: 20rpx;
			}
			
		}
	}
</style>