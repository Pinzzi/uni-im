<template>
	<view v-if="$store.state.userStore.userInfo.type == 1" class="page group-info">
		<view v-if="!group.quit"  class="group-members">
			<view class="member-items">
				<view v-for="(member,idx) in  groupMembers" :key="idx">
					<view class="member-item" v-if="idx<9">
						<head-image :id="member.userId" :name="member.aliasName" :url="member.headImage" 
						:size="100" :online="member.online" ></head-image>
						<view class="member-name">
							<text>{{member.aliasName}}</text>
						</view>
					</view>
				</view>
				<view class="invite-btn" @click="onInviteMember()">
					<uni-icons type="plusempty" size="28" color="#888888"></uni-icons>
				</view>
			</view>
			<view class="member-more" @click="onShowMoreMmeber()">{{ $t('cha_kan_geng_duo_qun_cheng_yua') }} ></view>
		</view>
		<view class="group-detail">
			<uni-section :title="$t('qun_liao_ming_cheng')" titleFontSize="14px">
				<template v-slot:right>
					<text class="detail-text">{{group.name}}</text>
				</template>
			</uni-section>
			<uni-section :title="$t('qun_zhu')" titleFontSize="14px">
				<template v-slot:right>
					<text class="detail-text">{{ownerName}}</text>
				</template>
			</uni-section>

			<uni-section :title="$t('qun_liao_bei_zhu')" titleFontSize="14px">
				<template v-slot:right>
					<text class="detail-text"> {{group.remark}}</text>
				</template>
			</uni-section>
			<uni-section :title="$t('wo_zai_ben_qun_de_ni_cheng')" titleFontSize="14px">
				<template v-slot:right>
					<text class="detail-text"> {{group.aliasName}}</text>
				</template>
			</uni-section>
			<uni-section :title="$t('qun_gong_gao')" titleFontSize="14px">
				<uni-notice-bar :text="group.notice" />
			</uni-section>
			<view v-if="!group.quit"  class="group-edit" @click="onEditGroup()">{{ $t('xiu_gai_qun_liao_zi_liao') }} ></view>
		</view>
		<view v-if="!group.quit"  class="btn-group">
			<button class="btn" type="primary" @click="onSendMessage()">{{ $t('fa_xiao_xi') }}</button>
			<button class="btn" v-show="!isOwner" type="warn" @click="onQuitGroup()">{{ $t('tui_chu_qun_liao') }}</button>
			<button class="btn" v-show="isOwner" type="warn" @click="onDissolveGroup()">{{ $t('jie_san_qun_liao') }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				groupId: null,
				group:{},
				groupMembers: []
			}
		},
		methods: {
			onFocusSearch() {},
			onInviteMember() {
				uni.navigateTo({
					url: `/pages/group/group-invite?id=${this.groupId}`
				})
			},
			onShowMoreMmeber() {
				uni.navigateTo({
					url: `/pages/group/group-member?id=${this.groupId}`
				})
			},
			onEditGroup() {
				uni.navigateTo({
					url: `/pages/group/group-edit?id=${this.groupId}`
				})
			},
			onSendMessage() {
				let chat = {
					type: 'GROUP',
					targetId: this.group.id,
					showName: this.group.remark,
					headImage: this.group.headImage,
				};
				this.$store.commit("openChat", chat);
				let chatIdx = this.$store.getters.findChatIdx(chat);
				uni.navigateTo({
					url: "/pages/chat/chat-box?chatIdx=" + chatIdx
				})
			},
			onQuitGroup() {
				let tip_txt = uni.$t('nin_yi_tui_chu_qun_liao')
				uni.showModal({
					title: uni.$t('que_ren_tui_chu'),
					content: uni.$t('que_ren_tui_chu_ma'),
					success: (res) => {
						if (res.cancel)
							return;
						this.$http({
							url: `/group/quit/${this.groupId}`,
							method: 'DELETE'
						}).then(() => {
							uni.showModal({
								title: uni.$t('tui_chu_cheng_gong'),
								content: `${tip_txt}\n${this.group.name}`,
								showCancel: false,
								success: () => {
									setTimeout(()=>{
										uni.switchTab({
											url:"/pages/group/group"
										});
										this.$store.commit("removeGroup", this.groupId);
									},100)
								}
							})
						});
					}
				});
			},
			onDissolveGroup() {
				console.log(this.group.name)
				let comfirm_de_group_tip_txt = uni.$t('que_ren_yao_jie_san_gai_qun_li')
				let success_del_group_tip_txt = uni.$t('cheng_gong_jie_san_gai_qun_lia')
				uni.showModal({
					title: uni.$t('que_ren_jie_san'),
					content: `${comfirm_de_group_tip_txt}\n${this.group.name}`,
					success: (res) => {
						if (res.cancel)
							return;
						this.$http({
							url: `/group/delete/${this.groupId}`,
							method: 'delete'
						}).then(() => {
							uni.showModal({
								title: uni.$t('jie_san_cheng_gong'),
								content: `${success_del_group_tip_txt}\n${this.group.name}`,
								showCancel: false,
								success: () => {	
									setTimeout(()=>{
										uni.switchTab({
											url:"/pages/group/group"
										});
										this.$store.commit("removeGroup", this.groupId);
									},100)	
								}
							})
						});
					}
				});

			},
			loadGroupInfo() {
				this.$http({
					url: `/group/find/${this.groupId}`,
					method: 'GET'
				}).then((group) => {
					this.group = group;
					// 更新聊天页面的群聊信息
					this.$store.commit("updateChatFromGroup", group);
					// 更新聊天列表的群聊信息
					this.$store.commit("updateGroup", group);

				});
			},
			loadGroupMembers() {
				console.log("loadGroupMembers")
				this.$http({
					url: `/group/members/${this.groupId}`,
					method: "GET"
				}).then((members) => {
					this.groupMembers = members.filter(m => !m.quit);
				})
			}
		},
		computed: {
			ownerName() {
				let member = this.groupMembers.find((m) => m.userId == this.group.ownerId);
				return member && member.aliasName;
			},
			isOwner() {
				return this.group.ownerId == this.$store.state.userStore.userInfo.id;
			}
		},
		onLoad(options) {
			this.groupId = options.id;
			// 查询群聊信息
			this.loadGroupInfo(options.id);
			// 查询群聊成员
			this.loadGroupMembers(options.id)
		}
		
	}
</script>

<style lang="scss" scoped>
	.group-info {
		.group-members {
			padding: 30rpx;
			background: white;

			.member-items {
				display: flex;
				flex-wrap: wrap;

				.member-item {
					width: 120rpx;
					display: flex;
					flex-direction: column;
					margin: 8rpx 2rpx;
					position: relative;
					align-items: center;
					padding-right: 5px;
					background-color: #fafafa;
					white-space: nowrap;
					
					.member-name {
						width: 100%;
						flex: 1;
						font-size: 14px;
						overflow: hidden;
						text-align: center;
						white-space: nowrap;
					}
				}

				.invite-btn {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100rpx;
					height: 100rpx;
					margin: 10rpx;
					border: #686868 dashed 2px;
					border-radius: 10%;
				}
			}

			.member-more {
				padding: 20rpx;
				text-align: center;
				font-size: 16px;
			}
		}


		.group-detail {
			margin-top: 30rpx;
			padding: 30rpx;
			background: white;

			.detail-text{
				font-size: 28rpx;
				font-weight: 600;
			}
			.group-edit {
				padding: 20rpx;
				text-align: center;
				font-size: 30rpx;	
			}
		}


		.btn-group {
			margin-top: 30rpx;
			padding: 30rpx;
			background: white;


			.btn {
				margin: 10rpx;
			}
		}


	}
</style>