<template>
	<view class="page mine-edit">
		<uni-forms ref="form" :modelValue="userInfo" label-position="top"
			label-width="100%">
			<uni-forms-item :label="$t('tou_xiang')" name="headImage">
				<image-upload :onSuccess="onUnloadImageSuccess">
					<image :src="userInfo.headImageThumb" class="head-image"></image>
				</image-upload>
			</uni-forms-item>
			<uni-forms-item :label="$t('yong_hu_ming')" name="userName">
				<uni-easyinput type="text" v-model="userInfo.userName" :disabled="true" />
			</uni-forms-item>
			<uni-forms-item :label="$t('ni_cheng')" name="nickName">
				<uni-easyinput v-model="userInfo.nickName" type="text" :placeholder="userInfo.userName" />
			</uni-forms-item>
			<uni-forms-item :label="$t('xing_bie')" name="sex">
				<radio-group @change="onSexchange">
					<label class="radio"><radio value="0" :checked="userInfo.sex==0" />{{ $t('nan') }}</label>
					<label class="radio"><radio value="1" :checked="userInfo.sex==1" />{{ $t('nv') }}</label>
					<label class="radio"><radio value="2" :checked="userInfo.sex==2" />{{ $t('bao_mi') }}</label>
				</radio-group>
			</uni-forms-item>
			<uni-forms-item :label="$t('qian_ming')" name="signature">
				<uni-easyinput type="textarea" v-model="userInfo.signature" :placeholder="$t('bian_ji_ge_xing_biao_qian_zhan')" />
			</uni-forms-item>
		</uni-forms>
		<button type="primary" @click="onSubmit()">{{ $t('ti_jiao') }}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {}
			}
		},
		methods:{
			onSexchange(e){
				this.userInfo.sex=e.detail.value;
			},
			onUnloadImageSuccess(file, res) {
				this.userInfo.headImage = res.data.originUrl;
				this.userInfo.headImageThumb = res.data.thumbUrl;
			},
			onSubmit(){
				this.$http({
					url: "/user/update",
					method: "PUT",
					data: this.userInfo
				}).then(()=>{
					this.$store.commit("setUserInfo",this.userInfo);
					uni.showToast({
						title:uni.$t('xiu_gai_cheng_gong'),
						icon: 'none'
					});
					setTimeout(()=>{
						uni.navigateBack();
					},1000);
				})	
			}
		},
		onLoad() {
			// 深拷贝一份数据
			let mine = this.$store.state.userStore.userInfo;
			this.userInfo = JSON.parse(JSON.stringify(mine));
		}
	}
</script>

<style scoped lang="scss">
	.mine-edit {
		padding: 20rpx;

		.head-image {
			width: 200rpx;
			height: 200rpx;
		}
	}
</style>