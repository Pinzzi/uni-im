<template>
	<view class="chat-record">
		<view class="chat-record-bar" id="chat-record-bar" :style="recordBarStyle" 
			@click.stop=""
			@touchstart.prevent="onStartRecord"
			@touchmove.prevent="onTouchMove" 
			@touchend.prevent="onEndRecord"
		>
			<!-- {{recording?'正在录音':'长按 说话'}} -->
			<span v-if="recording">{{ $t('zheng_zai_lu_yin') }}</span>
			<span v-else>{{ $t('chang_an_shuo_hua') }}</span>

		</view>
		<view v-if="recording" class="chat-record-window" :style="recordWindowStyle">
			<view class="rc-wave">
				<text class="note" style="--d: 0"></text>
				<text class="note" style="--d: 1"></text>
				<text class="note" style="--d: 2"></text>
				<text class="note" style="--d: 3"></text>
				<text class="note" style="--d: 4"></text>
				<text class="note" style="--d: 5"></text>
				<text class="note" style="--d: 6"></text>
			</view>
			<view class="rc-tip">{{recordTip}}</view>
			<view class="cancel-btn" @click="onCancel">
				<uni-icons :class="moveToCancel?'red':'black'" type="clear" 
				:size="moveToCancel?45:40"></uni-icons>
			</view>
			<view class="opt-tip" :class="moveToCancel?'red':'black'">
				<!-- {{moveToCancel? '松手取消':'松手发送,上划取消'}} -->
				<span v-if="moveToCancel">{{ $t('song_shou_qu_xiao') }}</span>
				<span v-else>{{ $t('song_shou_fa_song_shang_hua_qu') }}</span>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		name: "chat-record",
		data() {
			return {
				recording: false,
				moveToCancel: false,
				recordBarTop: 0,
				druation: 0,
				rcTimer: null
			}
		},
		methods: {
			onTouchMove(e) {
				const moveY = e.touches[0].clientY;
				this.moveToCancel = moveY < this.recordBarTop-40;
			},
			onCancel(){
				if(this.recording){
					this.moveToCancel = true;
					this.onEndRecord();
				}
			},
			onStartRecord() {
				/* 用户第一次使用语音会唤醒录音权限请求，此时会导致@touchend失效，
					一直处于录音状态，这里允许用户再次点击发送语音并结束录音 */
				if(this.recording){
					this.onEndRecord();
					return;
				}
				console.log("开始录音")
				this.moveToCancel = false;
				this.initRecordBar();
				this.$rc.start().then(() => {
					this.recording = true;
					console.log("开始录音成功")
					// 开始计时
					this.startTimer();
				}).catch((e) => {
					console.log("录音失败"+JSON.stringify(e))
					uni.showToast({
						title: uni.$t('lu_yin_shi_bai'),
						icon: "none"
					});
				});
			},
			onEndRecord() {
				this.recording = false;
				// 停止录音
				this.$rc.pause();
				// 停止计时
				this.StopTimer();
				// 触屏位置是否移动到了取消区域
				if (this.moveToCancel) {
					this.$rc.close();
					console.log("录音取消")
					return;
				}
				// 小于1秒不发送
				if (this.druation == 0) {
					uni.showToast({
						title: uni.$t('shuo_hua_shi_jian_tai_duan'),
						icon: 'none'
					})
					this.$rc.close();
					return;
				}
				this.$rc.upload().then((data) => {
					this.$emit("send", data);
				}).catch((e) => {
					uni.showToast({
						title: e,
						icon: 'none'
					})
				}).finally(() => {
					this.$rc.close();
					console.log("录音完成")
				})
			},
			startTimer() {
				this.druation = 0;
				this.StopTimer();
				this.rcTimer = setInterval(() => {
					this.druation++;
					// 大于60s,直接结束
					if(this.druation >= 60 ){
						this.onEndRecord();
					}
				}, 1000)
			},
			StopTimer() {
				this.rcTimer && clearInterval(this.rcTimer);
				this.rcTimer = null;
			},
			initRecordBar() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#chat-record-bar').boundingClientRect((rect) => {
					// 顶部高度位置
					this.recordBarTop = rect.top;
				}).exec()
			}
		},
		computed: {
			recordWindowStyle() {
				const windowHeight = uni.getSystemInfoSync().windowHeight;
				const bottom = windowHeight - this.recordBarTop + 12;
				return `bottom:${bottom}px;`
			},
			recordBarStyle() {
				const bgColor = this.recording ? "royalblue" : "#f8f8f8";
				return `background-color:${bgColor};`
			},
			recordTip(){
				const romaindTipTxt = uni.$t('ke_lu_yin_shi_chang')
				const audioTimeTxt = uni.$t('lu_yin_shi_chang')
				const miao_Txt = uni.$t('miao')
				if(this.druation > 50){
					return `${romaindTipTxt}${60-this.druation}${miao_Txt}`;
				}
				return `${audioTimeTxt}:${this.druation}${miao_Txt}`;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.chat-record {
		.rc-wave {
			display: flex;
			align-items: flex-end;
			justify-content: center;
			position: relative;
			height: 80rpx;

			.note {
				background: linear-gradient(to top, #395ff3 0%, #89aff3 100%);
				width: 4px;
				height: 50%;
				border-radius: 5rpx;
				margin-right: 4px;
				animation: loading 0.5s infinite linear;
				animation-delay: calc(0.1s * var(--d));

				@keyframes loading {
					0% {
						background-image: linear-gradient(to right, #395ff3 0%, #89aff3 100%);
						height: 20%;
						border-radius: 5rpx;
					}

					50% {
						background-image: linear-gradient(to top, #395ff3 0%, #a9cff3 100%);
						height: 80%;
						border-radius: 5rpx;
					}

					100% {
						background-image: linear-gradient(to top, #395ff3 0%, #a9cff3 100%);
						height: 20%;
						border-radius: 5rpx;
					}
				}
			}
		}

		.chat-record-bar {
			padding: 10rpx;
			margin: 10rpx;
			border-radius: 10rpx;
			text-align: center;
		}

		.chat-record-window {
			position: fixed;
			left: 0;
			height: 360rpx;
			width: 100%;
			background-color:  rgba(255, 255, 255, 0.95);
			padding: 30rpx;

			.icon-microphone {
				text-align: center;
				font-size: 80rpx;
				padding: 10rpx;

			}

			.rc-tip {
				text-align: center;
				font-size: 30rpx;
				margin-top: 20rpx;
			}

			.cancel-btn {
				text-align: center;
				margin-top: 40rpx;
				height: 80rpx;

			}

			.opt-tip {
				text-align: center;
				font-size: 30rpx;
				padding: 20rpx;
			}

			.red {
				color: red !important;
			}

			.black {
				color: gray;
			}
		}
	}
</style>