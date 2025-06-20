<template>
	<view class="login-form">
		<view class="header-tools">
			<theme-picker />
			<language-switch-transition
				v-if="languageTransition" 
				:lang-flag="languageTransition.langFlag"
				:lang-name="languageTransition.langName"
			/>
			<LanguageSwitcher />
		</view>
		<view class="login-title">{{ $t('huan_ying_deng_lu') }}</view>
		<uni-forms style="margin-top: 100px;" :modelValue="loginForm" :rules="rules" validate-trigger="bind" ref="loginFormRef">
			<uni-forms-item name="userName">
				<uni-easyinput type="text" v-model="loginForm.userName" prefix-icon="person" :placeholder="$t('yong_hu_ming')" />
			</uni-forms-item>
			<uni-forms-item name="password">  
				<uni-easyinput type="password" v-model="loginForm.password" prefix-icon="locked" :placeholder="$t('mi_ma')" />
			</uni-forms-item>
			<view class="login-tip" v-if="hasLoginButRejected">
				<text>{{ $t('sheng_yu_ji_hui') }}: {{ remainingAttempts }}</text>
			</view>
			<button :disabled="isLocked" @click="submit" type="primary">{{ $t('deng_lu') }}</button>
			<button class="login_btn">注册</button>
		</uni-forms>
		<uni-popup ref="deviceVerifyPopup" type="dialog">
			<uni-popup-dialog 
				:title="$t('she_bei_yan_zheng')"
				:content="$t('qing_shu_ru_yan_zheng_ma')"
				:before-close="true"
				@confirm="verifyDevice"
			>
				<uni-easyinput v-model="verificationCode" />
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
import { useStore } from 'vuex'
import { computed } from 'vue' 
import LanguageSwitcher from '@/components/language-switcher/index.vue'
import languageSwitchTransition from '@/components/language-switch-transition/index.vue'
import ThemePicker from '@/components/theme-picker/index.vue'
import { encryptData } from '../../common/crypto.js';
import { deviceFingerprint } from '../../utils/device'

export default {
	components: {
		LanguageSwitcher,
		languageSwitchTransition,
		ThemePicker
	},

	setup() {
		const store = useStore()
		const languageTransition = computed(() => store.state.transitionStore.languageTransition)

		return {
			languageTransition
		}
	},

	data() {
		return {
			loginForm: {
				terminal: 1,
				userName: '',
				password: '',
				deviceId: ''
			},
			rules: {
				userName: {
					rules: [{
						required: true,
						errorMessage: uni.$t('qing_shu_ru_yong_hu_ming'),
					}]
				},
				password: {
					rules: [{
						required: true,
						errorMessage: uni.$t('qing_shu_ru_mi_ma'),
						minLength: 8
					}]
				}
			},
			deviceFingerprint: '',
			deviceAttempts: {},
			loginAttempts: 0,
			maxAttempts: 5,
			lockoutDuration: 30 * 60 * 1000, // 30分钟
			lockoutTime: 0,
			verificationCode: '',
			hasLoginButRejected: false,
			isNewDevice: false
		}
	},
	
	computed: {
		remainingAttempts() {
			if (!this.loginForm.userName || !this.loginForm.password) {
				return this.maxAttempts
			}
			const currentDeviceAttempts = this.deviceAttempts[this.deviceFingerprint] || 0
			return this.maxAttempts - currentDeviceAttempts
		},
		isLocked() {
			if (!this.loginForm.userName || !this.loginForm.password) {
				return false
			}
			const deviceLockout = this.$store.state.deviceLockouts?.[this.deviceFingerprint] || 0
			return deviceLockout > Date.now()
		},
	},

	methods: {
		async generateFingerprint() {
			const fingerprint = await deviceFingerprint()
			if (!fingerprint) {
				console.error('获取设备指纹失败')
				// 生成一个临时的随机指纹
				this.deviceFingerprint = Math.random().toString(36).substring(2)
			} else {
				this.deviceFingerprint = fingerprint
			}
		},

		recordLoginAttempt() {
			// 如果用户名或密码为空，直接返回，不记录登录尝试
			if (!this.loginForm.userName || !this.loginForm.password) {
				return;
			}

			const currentAttempts = this.deviceAttempts[this.deviceFingerprint] || 0;
			this.$set(this.deviceAttempts, this.deviceFingerprint, currentAttempts + 1);

			this.$store.commit('updateDeviceAttempts', this.deviceAttempts);

			// 检查是否需要锁定设备
			if (currentAttempts + 1 >= this.maxAttempts) {
				const lockoutTime = Date.now() + (30 * 60 * 1000); // 锁定30分钟
				this.$store.commit('updateDeviceLockouts', {
					...this.$store.state.deviceLockouts,
					[this.deviceFingerprint]: lockoutTime
				});
			}
		},

		async submit() {
			if(this.isLocked) {
				uni.showToast({
					title: '登陆已锁定',
					icon: 'none'
				});
				return;
			}

			try {
				const valid = await this.$refs.loginFormRef.validate();
				if(!valid) return;

				const encryptedPassword = encryptData(this.loginForm.password);
				const deviceId = await deviceFingerprint();

				const loginData = {
					...this.loginForm,
					password: encryptedPassword,
					deviceId
				};

				const loginInfo = await this.$http({
					url: '/login',
					data: loginData,
					method: 'POST'
				});

				if(loginInfo.needDeviceVerification) {
					this.isNewDevice = true;
					this.$refs.deviceVerifyPopup.open();
					return;
				}

				this.handleLoginSuccess(loginInfo);
			} catch(error) {
				this.handleLoginError(error);
			}
		},

		async verifyDevice() {
			try {
				const loginInfo = await this.$http({
					url: '/verify-device',
					data: {
						code: this.verificationCode,
						deviceId: this.loginForm.deviceId
					},
					method: 'POST'
				});

				this.$refs.deviceVerifyPopup.close();
				this.handleLoginSuccess(loginInfo);
			} catch(error) {
				uni.showToast({
					title: '验证码错误',
					icon: 'none'
				});
			}
		},

		handleLoginSuccess(loginInfo) {
			this.$set(this.deviceAttempts, this.deviceFingerprint, 0)
			this.$store.commit('updateDeviceAttempts', this.deviceAttempts)
			
			const encryptedLoginInfo = encryptData(JSON.stringify(loginInfo))
			uni.setStorageSync('loginInfo', encryptedLoginInfo)
			uni.setStorageSync('lastLoginTime', Date.now())

			getApp().init()
			uni.switchTab({
				url: "/pages/chat/chat"
			})
		},

		handleLoginError(error) {
			this.hasLoginButRejected = true
			this.recordLoginAttempt()
			if(this.deviceAttempts[this.deviceFingerprint] >= this.maxAttempts) {
				uni.showToast({
					title: this.$t('deng_lu_ci_shu_yi_yong_jin'),
					icon: 'none'
				})
			} else {
				uni.showToast({
					title: error.message || this.$t('deng_lu_shi_bai'),
					icon: 'none'
				})
			}
		}
	},
	
	async onLoad() {
		const lastLoginTime = uni.getStorageSync('lastLoginTime')
		if(lastLoginTime && Date.now() - lastLoginTime < 24 * 60 * 60 * 1000) {
			this.loginForm.userName = uni.getStorageSync('userName')
		}
		await this.generateFingerprint()
		const savedAttempts = this.$store.state.deviceAttempts || {}
		this.deviceAttempts = savedAttempts
	}
}
</script>

<style lang="scss" scoped>
:deep(.uni-popup) {
  z-index: 9999 !important;
}

.login-form {
	margin: 50rpx;

	.header-tools {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;

		:first-child {
			order: 2;  /* 主题切换器放右边 */
		}

		:nth-child(2),
		:nth-child(3) {
			order: 1;  /* 语言相关组件放左边 */
		}
	}

	.login-title {
		margin-top: 100rpx;
		margin-bottom: 100rpx;
		color: royalblue;
		text-align: center;
		font-size: 60rpx;
		font-weight: 600;
	}

	.login-tip {
		margin: 20rpx 0;
		color: #f56c6c;
		font-size: 24rpx;
		text-align: center;
	}

	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login_btn {
		padding: 6px 10px;
		font-size: 17px;
		background-color: var(--primary-color);
	}
}
</style>