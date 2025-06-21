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
            <uni-forms 
                style="margin-top: 100px;" 
                :modelValue="loginForm" 
                :rules="rules" 
                validate-trigger="bind" 
                ref="loginFormRef"
            >
                <uni-forms-item name="userName">
                    <uni-easyinput 
                        type="text" 
                        v-model="loginForm.userName" 
                        prefix-icon="person" 
                        :placeholder="$t('yong_hu_ming')"
                        autocomplete="username"
                    />
                </uni-forms-item>
                <uni-forms-item name="password">
                    <uni-easyinput 
                        type="password" 
                        v-model="loginForm.password" 
                        prefix-icon="locked" 
                        :placeholder="$t('mi_ma')"
                        autocomplete="current-password"
                    />
                </uni-forms-item>
                <view class="login-tip" v-if="hasLoginButRejected">
                    <text>{{ $t('sheng_yu_ji_hui') }}: {{ remainingAttempts }}</text>
                </view>
                <button 
                    class="submit-button" 
                    :disabled="isLocked" 
                    @tap="handleSubmit"
                    type="primary"
                >
                    {{ $t('deng_lu') }}
                </button>
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
import { useStore } from 'vuex';
import { computed } from 'vue';
import LanguageSwitcher from '@/components/language-switcher/index.vue';
import languageSwitchTransition from '@/components/language-switch-transition/index.vue';
import ThemePicker from '@/components/theme-picker/index.vue';
import { encryptData } from '@/common/crypto.js';
import { deviceFingerprint } from '@/utils/device.js';

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
			rules: {},
			loading: false,
			deviceFingerprint: '',
			deviceAttempts: {},
			loginAttempts: 0,
			maxAttempts: 5,
			lockoutDuration: 30 * 60 * 1000,
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
			let res = this.maxAttempts - currentDeviceAttempts
			if (res < 0) {
				res = 0
			}
			return res
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
		createRules() {
			return {
				userName: {
					rules: [{
						required: true,
						errorMessage: uni.$t('qing_shu_ru_yong_hu_ming')
					}]
				},
				password: {
					rules: [{
						required: true,
						errorMessage: uni.$t('qing_shu_ru_mi_ma')
					}, {
						minLength: 16,
						errorMessage: uni.$t('mi_ma_chang_du_bu_neng_xiao_yu_16')
					}, {
						// pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[+/=_\-@#$%^&*!])[A-Za-z\d+/=_\-@#$%^&*!]{8,}$/, // 需包含大小写字母、数字或特殊字符
						pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{16,}$/, // 16位数字或字母
						errorMessage: uni.$t('mi_ma_ge_shi_cuo_wu')
					}]
				}
			};
		},

        async updateFormRules() {
            // 更新验证规则
            this.rules = this.createRules();

            if (!this.$refs.loginFormRef) {
                return;
            }

            try {
                // 清除现有验证结果
                await this.$refs.loginFormRef.clearValidate();

                // 等待 DOM 更新
                await this.$nextTick();

                // 始终验证两个字段，确保错误消息能够更新
                await this.$refs.loginFormRef.validate(['userName', 'password']);
            } catch (err) {
                console.log('@login.updateFormRules=>\n【表单验证更新时出错】:\n', err);
            }
        },

		async validate() {
			try {
				const valid = await this.$refs.loginFormRef.validate()
				return valid
			} catch (error) {
				console.log('@login.updateFormRules=>\n【表单验证错误】:\n', error)
				return false
			}
		},
		async generateFingerprint() {
			const fingerprint = await deviceFingerprint()
			if (!fingerprint) {
				console.log('获取设备指纹失败')
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

	async handleSubmit() {
		console.log('@onClick【登录】开始校验');
		try {
			const valid = await this.validate();
			if (valid) {
				await this.submit();
			}
		} catch (error) {
			console.log('提交出错：', error);
		}
	},

	async submit() {
		if (this.isLocked) {
			uni.showToast({
				title: this.$t('login_locked'),
				icon: 'none'
			});
			return;
		}

		try {
			this.loading = true;
			const deviceId = await deviceFingerprint();
			const { userName, password } = this.loginForm;

			// 表单验证通过后再进行加密处理
			const encryptedPassword = await encryptData(password);

			const loginInfo = await this.$http({
				url: '/login',
				method: 'POST',
				data: {
					userName,
					password: encryptedPassword,
					deviceId
				}
			});

			// 检查是否需要设备验证
			if (loginInfo.needDeviceVerification) {
				this.isNewDevice = true;
				this.$refs.deviceVerifyPopup.open();
				return;
			}

			// 处理登录成功
			await this.handleLoginSuccess(loginInfo);
		} catch (error) {
			this.handleLoginError(error);
		} finally {
			this.loading = false;
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
		console.log("@handleLoginError()=>【处理特定错误消息的翻译】\n", error.message);
		this.hasLoginButRejected = true;
		this.recordLoginAttempt();

		if (this.deviceAttempts[this.deviceFingerprint] >= this.maxAttempts) {
			uni.showToast({
				title: this.$t('deng_lu_ci_shu_yi_yong_jin'),
				icon: 'none'
			});
			return;
		}

		// 处理特定错误消息的翻译
		let errorMessage = '';
		if (error.message && error.message.includes('Invalid API secret')) {
			errorMessage = this.$t('wu_xiao_de_mi_yao');
		} else if (error.message && error.message.includes('must be at least 8 characters')) {
			errorMessage = this.$t('mi_ma_chang_du_bu_neng_xiao_yu_8_wei');
		} else if (error.message && error.message.includes('password format')) {
			errorMessage = this.$t('mi_ma_ge_shi_cuo_wu');
		} else {
			errorMessage = error.message || this.$t('deng_lu_shi_bai');
		}

		uni.showToast({
			title: errorMessage,
			icon: 'none',
			duration: 2000
		});
	}
	},

	watch: {
		'$i18n.locale': {
			handler() {
				this.updateFormRules()
			},
			immediate: true
		}
	},
	
	created() {
		this.rules = this.createRules()
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

<style lang="scss">
:deep(.uni-popup) {
  z-index: 9999 !important;
}

.login-form {
  margin: 50rpx;
  padding: 20rpx;
  background-color: var(--bg-color, #FFFFFF);

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
    color: var(--text-color, #333333);
    text-align: center;
    font-size: 60rpx;
    font-weight: 600;
  }

  .login-tip {
    margin: 20rpx 0;
    color: var(--error-color, #FF453A);
    font-size: 24rpx;
    text-align: center;
  }

  .submit-button {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 10rpx;
    background-color: var(--primary-color, #007AFF);
    color: #FFFFFF;
    font-size: 32rpx;
    margin-top: 40rpx;
    border: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .reg_btn {
    padding: 6px 10px;
    font-size: 17px;
    background-color: var(--theme-secondary-color);
    color: var(--theme-text);
  }
}
</style>