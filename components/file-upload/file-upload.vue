<template>
	<view @click="selectAndUpload()">
		<slot></slot>
	</view>
</template>

<script>
	import UNI_APP from '@/.env.js';
	
	export default {
		name: "file-upload",
		data() {
			return {
				uploadHeaders: {
					"accessToken": uni.getStorageSync('loginInfo').accessToken
				}
			}
		},
		props: {
			maxSize: {
				type: Number,
				default: 10*1024*1024
			},
			onBefore: {
				type: Function,
				default: null
			},
			onSuccess: {
				type: Function,
				default: null
			},
			onError: {
				type: Function,
				default: null
			}
		},
		methods: {
			selectAndUpload() {
				console.log(uni.chooseFile)
				console.log(uni.chooseMessageFile)
				let chooseFile = uni.chooseFile || uni.chooseMessageFile;
				chooseFile({
					success: (res) => {
						res.tempFiles.forEach((file) => {
							const limiteTip = uni.$t('wen_jian_da_xiao_bu_neng_chao')
							// 校验大小
							if (this.maxSize && file.size > this.maxSize) {
								this.$message.error(`${limiteTip} ${this.fileSizeStr}!`);
								this.$emit("fail", file);
								return;
							}

							if (!this.onBefore || this.onBefore(file)) {
								// 调用上传图片的接口
								this.uploadFile(file);
							}
						})
					}
				})
			},
			uploadFile(file) {
				uni.uploadFile({
					url: UNI_APP.BASE_URL + '/file/upload',
					header: {
						accessToken: uni.getStorageSync("loginInfo").accessToken
					},
					filePath: file.path, // 要上传文件资源的路径
					name: 'file',
					success: (res) => {
						let data = JSON.parse(res.data);
						if(data.code != 200){
							this.onError && this.onError(file, data);
						}else{
							this.onSuccess && this.onSuccess(file, data);
						}
					},
					fail: (err) => {
						this.onError && this.onError(file, err);
					}
				})
			}
		},
		computed: {
			fileSizeStr() {
				if (this.maxSize > 1024 * 1024) {
					return Math.round(this.maxSize / 1024 / 1024) + "M";
				}
				if (this.maxSize > 1024) {
					return Math.round(this.maxSize / 1024) + "KB";
				}
				return this.maxSize + "B";
			}
		}
	}
</script>

<style>
</style>