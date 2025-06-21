<template>
	<view v-if="$store.state.userStore.userInfo.type == 1" class="page group-edit">
		<uni-forms ref="form" :modelValue="group" :rules="rules" validate-trigger="bind" label-position="top"
			label-width="100%">
			<uni-forms-item :label="$t('qun_liao_tou_xiang')" name="headImage">
				<image-upload v-show="isOwner" :onSuccess="onUnloadImageSuccess">
					<image :src="group.headImage" class="group-image"></image>
				</image-upload>
				<head-image  v-show="!isOwner" :name="group.remark" 
					:url="group.headImage" :size="200"></head-image>
			</uni-forms-item>
			<uni-forms-item :label="$t('qun_liao_ming_cheng')" name="name" :required="true">
				<uni-easyinput type="text" v-model="group.name" :disabled="!isOwner" :placeholder="$t('qing_shu_ru_qun_liao_ming_chen')" />
			</uni-forms-item>
			<uni-forms-item :label="$t('qun_liao_bei_zhu')" name="remark">
				<uni-easyinput v-model="group.remark" type="text" :placeholder="$t('qing_shu_ru_qun_liao_bei_zhu')" />
			</uni-forms-item>
			<uni-forms-item :label="$t('wo_zai_ben_qun_de_ni_cheng')" name="email">
				<uni-easyinput v-model="group.aliasName" type="text" :placeholder="$t('qing_shu_ru_qun_liao_ni_cheng')" />
			</uni-forms-item>
			<uni-forms-item :label="$t('qun_gong_gao')" name="notice">
				<uni-easyinput type="textarea" v-model="group.notice" :disabled="!isOwner" :placeholder="$t('qing_shu_ru_qun_gong_gao')" />
			</uni-forms-item>
		</uni-forms>
		<button type="primary" @click="submit()">{{ $t('ti_jiao') }}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				group: {},
				rules: {
					name: {
						rules: [{
							required: true,
							errorMessage: uni.$t('qing_shu_ru_qun_liao_ming_chen'),
						}]
					}

				}
			}
		},

		methods: {
			submit() {
				if (this.group.id) {
					this.modifyGroup();
				} else {
					this.createNewGroup();
				}
			},
			onUnloadImageSuccess(file, res) {
				this.group.headImage = res.data.originUrl;
				this.group.headImageThumb = res.data.thumbUrl;
			},
			modifyGroup() {
				this.$http({
					url: "/group/modify",
					method: "PUT",
					data: this.group
				}).then((group) => {
					this.$store.commit("updateGroup", group);
					uni.showToast({
						title: uni.$t('xiu_gai_qun_liao_xin_xi_cheng'),
						icon: 'none'
					});
					setTimeout(() => {
						let pages = getCurrentPages();
						let prevPage = pages[pages.length - 2];
						prevPage.$vm.loadGroupInfo();
						uni.navigateBack();
					}, 1000);

				})
			},
			createNewGroup() {
				this.$http({
					url: "/group/create",
					method: 'POST',
					data: this.group
				}).then((group) => {
					this.$store.commit("addGroup", group);
					uni.showToast({
						title: uni.$t('qun_liao_chuang_jian_cheng_gon'),
						icon: 'none',
						duration: 1500
					});
					setTimeout(() => {
						uni.navigateTo({
							url: "/pages/group/group-info?id=" + group.id
						});
					}, 1500)

				})
			},
			loadGroupInfo(id) {
				this.$http({
					url: `/group/find/${id}`,
					method: 'GET'
				}).then((group) => {
					this.group = group;
					// 更新聊天页面的群聊信息
					this.$store.commit("updateChatFromGroup", group);
					// 更新聊天列表的群聊信息
					this.$store.commit("updateGroup", group);

				});
			},
			initNewGroup() {
				let userInfo = this.$store.state.userStore.userInfo;
				let who_creaeted_the_group_chat_txt = uni.$t('qun_liao_chuang_jian_ren')
				this.group = {
					name: `${who_creaeted_the_group_chat_txt}: ${userInfo.userName}`,
					headImage: userInfo.headImage,
					headImageThumb: userInfo.headImageThumb,
					aliasName: userInfo.nickName,
					ownerId: this.$store.state.userStore.userInfo.id
				}
			}
		},
		computed: {
			isOwner() {
				return this.$store.state.userStore.userInfo.id == this.group.ownerId
			}
		},
		onLoad(options) {
			if (options.id) {
				// 修改群聊
				this.loadGroupInfo(options.id);
			} else {
				// 创建群聊
				this.initNewGroup();
			}

		}
	}
</script>

<style lang="scss" scoped>
	.group-edit {
		padding: 20rpx;

		.group-image {
			width: 200rpx;
			height: 200rpx;
			border: 1px solid #ccc;
			border-radius: 5%;
		}
	}
</style>