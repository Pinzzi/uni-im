<template>
	<view class="page mine-password">
		<uni-forms ref="form" :modelValue="formData" label-position="top" label-width="100%" >
			<uni-forms-item :label="$t('yuan_mi_ma')" name="oldPassword">
				<uni-easyinput type="password" v-model="formData.oldPassword" />
			</uni-forms-item>
			<uni-forms-item :label="$t('xin_mi_ma')" name="newPassword">
				<uni-easyinput type="password" v-model="formData.newPassword" />
			</uni-forms-item>
			<uni-forms-item :label="$t('que_ren_mi_ma')" name="confirmPassword">
				<uni-easyinput type="password" v-model="formData.confirmPassword" />
			</uni-forms-item>
			<button type="primary" @click="onSubmit()">{{ $t('ti_jiao') }}</button>
		</uni-forms>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					oldPassword: "",
					newPassword: "",
					confirmPassword: ""
				},
				rules: {
					oldPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入原密码',
						}]
					},
					newPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入新密码',
						}, {
							validateFunction: function(rule, value, data, callback) {
								if (data.confirmPassword != data.newPassword) {
									callback("两次输入的密码不一致");
								}
								if (data.newPassword == data.oldPassword) {
									callback("新密码不能和原密码一致");
								}
								return true;
							}
						}]
					},
					confirmPassword: {
						rules: [{
							required: true,
							errorMessage: '请输入确认密码',
						}, {
							validateFunction: function(rule, value, data, callback) {
								if (data.confirmPassword != data.newPassword) {
									callback("两次输入的密码不一致");
								}
								
								return true;
							}
						}]
					}

				}
			}
		},
		methods: {
			onSubmit() {
				this.$refs.form.validate().then(res => {
					this.$http({
						url: "/modifyPwd",
						method: "PUT",
						data: this.formData
					}).then((res) => {
						uni.showToast({
							title: uni.$t('xiu_gai_mi_ma_cheng_gong'),
							icon: 'none'
						})
						setTimeout(()=>{
							uni.navigateBack();
						},1000);
					})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})

			}
		},
		onReady() {
			// 需要在onReady中设置规则
			this.$refs.form.setRules(this.rules)
		}

	}
</script>

<style scoped lang="scss">
	.mine-password {
		padding: 20rpx;

	}
</style>