<template>
	<view class="page chat-box">
		<view class="header">
			<uni-icons class="btn-side left" type="back" size="30" @click="onNavBack()"></uni-icons>
			<text class="title">{{title}}</text>
			<uni-icons class="btn-side right" type="more-filled" size="30" @click="onShowMore()"></uni-icons>
		</view>
		<view class="chat-msg" @click="switchChatTabBox('none',true)">
			<scroll-view class="scroll-box" scroll-y="true" 
					upper-threshold="200" @scrolltoupper="onScrollToTop"
					:scroll-into-view="'chat-item-'+scrollMsgIdx">
				<view v-for="(msgInfo,idx) in chat.messages" :key="idx">
					<chat-message-item v-if="idx>=showMinIdx&&!msgInfo.delete" :headImage="headImage(msgInfo)" @call="onRtCall(msgInfo)"
						:showName="showName(msgInfo)" @recall="onRecallMessage" @delete="onDeleteMessage"
						@longPressHead="onLongPressHead(msgInfo)" @download="onDownloadFile" :id="'chat-item-'+idx"
						:msgInfo="msgInfo" :groupMembers="groupMembers">
					</chat-message-item>
				</view>
			</scroll-view>
		</view>
		<view v-if="atUserIds.length>0" class="chat-at-bar" @click="openAtBox()">
			<view class="iconfont icon-at">:&nbsp;</view>
			<scroll-view v-if="atUserIds.length>0" class="chat-at-scroll-box" scroll-x="true" scroll-left="120">
				<view class="chat-at-items">
					<view v-for="m in atUserItems" class="chat-at-item">
						<head-image :name="m.aliasName" :url="m.headImage" :size="50"></head-image>
					</view>
				</view>
			</scroll-view>
		</view>
		<view class="send-bar">
			<view v-if="!showRecord" class="iconfont icon-voice-circle" @click="onRecorderInput()"></view>
			<view v-else class="iconfont icon-keyboard" @click="onKeyboardInput()"></view>
			<chat-record v-if="showRecord" class="chat-record" @send="onSendRecord" ></chat-record>
			<view v-else class="send-text">
				<textarea class="send-text-area" v-model="sendText" auto-height :show-confirm-bar="false"
					:placeholder="isReceipt? $t('huizhi_xiaoxi') : ''" :adjust-position="false" @confirm="sendTextMessage()"
					@keyboardheightchange="onKeyboardheightchange" @input="onTextInput" confirm-type="send" confirm-hold
					:hold-keyboard="true"></textarea>
			</view>
			<view v-if="chat.type=='GROUP'" class="iconfont icon-at" @click="openAtBox()"></view>
			<view class="iconfont icon-icon_emoji" @click="onShowEmoChatTab()"></view>
			<view v-if="sendText==''" class="iconfont icon-add" @click="onShowToolsChatTab()">
			</view>
			<button v-if="sendText!=''||atUserIds.length>0" class="btn-send" type="primary"
				@touchend.prevent="sendTextMessage()" size="mini">{{ $t('fa_song') }}</button>
		</view>

		<view class="chat-tab-bar" v-show="chatTabBox!='none' ||showKeyBoard " :style="{height:`${keyboardHeight}px`}">
			<view v-if="chatTabBox == 'tools'" class="chat-tools">
				<view class="chat-tools-item">
					<image-upload :maxCount="9" sourceType="album" :onBefore="onUploadImageBefore"
						:onSuccess="onUploadImageSuccess" :onError="onUploadImageFail">
						<view class="tool-icon iconfont icon-picture"></view>
					</image-upload>
					<view class="tool-name">{{ $t('xiang_ce') }}</view>
				</view>
				<view class="chat-tools-item">
					<image-upload sourceType="camera" :onBefore="onUploadImageBefore" :onSuccess="onUploadImageSuccess"
						:onError="onUploadImageFail">
						<view class="tool-icon iconfont icon-camera"></view>
					</image-upload>
					<view class="tool-name">{{ $t('pai_she') }}</view>
				</view>
				<!-- #ifndef APP-PLUS -->
				<!-- APP 暂时不支持选择文件 -->
				<view class="chat-tools-item">
					<file-upload :onBefore="onUploadFileBefore" :onSuccess="onUploadFileSuccess"
						:onError="onUploadFileFail">
						<view class="tool-icon iconfont icon-folder"></view>
					</file-upload>
					<view class="tool-name">{{ $t('wen_jian') }}</view>
				</view>
				<!-- #endif -->
				<view class="chat-tools-item" @click="onRecorderInput()">
					<view class="tool-icon iconfont icon-microphone"></view>
					<view class="tool-name">{{ $t('yu_yin_xiao_xi') }}</view>
				</view>
				<view v-if="chat.type == 'GROUP'" class="chat-tools-item" @click="switchReceipt()">
					<view class="tool-icon iconfont icon-receipt" :class="isReceipt?'active':''"></view>
					<view class="tool-name">{{ $t('hui_zhi_xiao_xi') }}</view>
				</view>
				<!-- #ifndef MP-WEIXIN -->
				<!-- 音视频不支持小程序 -->
				<view v-if="chat.type == 'PRIVATE'" class="chat-tools-item" @click="onVideoCall()">
					<view class="tool-icon iconfont icon-video"></view>
					<view class="tool-name">{{ $t('shi_pin_tong_hua') }}</view>
				</view>
				<view v-if="chat.type == 'PRIVATE'" class="chat-tools-item" @click="onVoiceCall()">
					<view class="tool-icon iconfont icon-call"></view>
					<view class="tool-name">{{ $t('yu_yin_tong_hua') }}</view>
				</view>
				<!-- #endif -->
			</view>
			<scroll-view v-if="chatTabBox==='emo'" class="chat-emotion" scroll-y="true">
				<view class="emotion-item-list">
					<image class="emotion-item" :title="emoText" :src="$emo.textToPath(emoText)"
						v-for="(emoText, i) in $emo.emoTextList" :key="i" @click="selectEmoji(emoText)" mode="aspectFit"
						lazy-load="true"></image>
				</view>
			</scroll-view>
			<view v-if="showKeyBoard"></view>
		</view>
		<chat-at-box ref="atBox" :ownerId="group.ownerId" :members="groupMembers"
			@complete="onAtComplete"></chat-at-box>
	</view>
</template>

<script>
	import UNI_APP from '@/.env.js';
	export default {
		data() {
			return {
				chat: {},
				friend: {},
				group: {},
				groupMembers: [],
				sendText: "",
				isReceipt: false, // 是否回执消息
				scrollMsgIdx: 0, // 滚动条定位为到哪条消息
				chatTabBox: 'none',
				showKeyBoard: false,
				showRecord: false,
				keyboardHeight: 322,
				atUserIds: [],
				recordText: "",
				showMinIdx: 0 // 下标小于showMinIdx的消息不显示，否则可能很卡
			}
		},
		methods: {
			onRecorderInput() {
				this.showRecord = true;
				this.switchChatTabBox('none',true);
			},
			onKeyboardInput() {
				this.showRecord = false;
				this.switchChatTabBox('none',false);
			},
			onSendRecord(data) {
				let msgInfo = {
					content: JSON.stringify(data),
					type: this.$enums.MESSAGE_TYPE.AUDIO,
					receipt: this.isReceipt
				}
				// 填充对方id
				this.fillTargetId(msgInfo, this.chat.targetId);
				this.$http({
					url: this.messageAction,
					method: 'POST',
					data: msgInfo
				}).then((id) => {
					msgInfo.id = id;
					msgInfo.sendTime = new Date().getTime();
					msgInfo.sendId = this.$store.state.userStore.userInfo.id;
					msgInfo.selfSend = true;
					msgInfo.status = this.$enums.MESSAGE_STATUS.UNSEND;
					msgInfo.readedCount = 0;
					this.$store.commit("insertMessage", msgInfo);
					// 会话置顶
					this.moveChatToTop();
					// 滚动到底部
					this.scrollToBottom();
					this.isReceipt = false;
					
				})
			},
			onRtCall(msgInfo) {
				if (msgInfo.type == this.$enums.MESSAGE_TYPE.RT_VOICE) {
					this.onVoiceCall();
				} else if (msgInfo.type == this.$enums.MESSAGE_TYPE.RT_VIDEO) {
					this.onVideoCall();
				}
			},
			onVideoCall() {
				const friendInfo = encodeURIComponent(JSON.stringify(this.friend));
				uni.navigateTo({
					url: `/pages/chat/chat-video?mode=video&friend=${friendInfo}&isHost=true`
				})
			},
			onVoiceCall() {
				const friendInfo = encodeURIComponent(JSON.stringify(this.friend));
				uni.navigateTo({
					url: `/pages/chat/chat-video?mode=voice&friend=${friendInfo}&isHost=true`
				})
			},
			moveChatToTop() {
				let chatIdx = this.$store.getters.findChatIdx(this.chat);
				this.$store.commit("moveTop", chatIdx);
			},
			switchReceipt() {
				this.isReceipt = !this.isReceipt;
			},
			openAtBox() {
				this.$refs.atBox.init(this.atUserIds);
				this.$refs.atBox.open();
			},
			onAtComplete(atUserIds) {
				this.atUserIds = atUserIds;
			},
			onLongPressHead(msgInfo) {
				if (!msgInfo.selfSend && this.chat.type == "GROUP" && this.atUserIds.indexOf(msgInfo.sendId) < 0) {
					this.atUserIds.push(msgInfo.sendId);
				}
			},
			headImage(msgInfo) {
				if (this.chat.type == 'GROUP') {
					let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
					return member ? member.headImage : "";
				} else {
					return msgInfo.selfSend ? this.mine.headImageThumb : this.chat.headImage
				}
			},
			showName(msgInfo) {
				if (this.chat.type == 'GROUP') {
					let member = this.groupMembers.find((m) => m.userId == msgInfo.sendId);
					return member ? member.aliasName : "";
				} else {
					return msgInfo.selfSend ? this.mine.nickName : this.chat.showName
				}
			},
			sendTextMessage() {
				if (!this.sendText.trim() && this.atUserIds.length == 0) {
					return uni.showToast({
						title: uni.$t('bu_neng_fa_song_kong_bai_xin_x'),
						icon: "none"
					});
				}
				let receiptText = this.isReceipt ? uni.$t('huizhi_xiaoxi') : "";
				let atText = this.createAtText();
				let msgInfo = {
					content: receiptText + this.sendText + atText,
					atUserIds: this.atUserIds,
					receipt: this.isReceipt,
					type: 0
				}
				// 填充对方id
				this.fillTargetId(msgInfo, this.chat.targetId);
				this.sendText = "";
				this.$http({
					url: this.messageAction,
					method: 'POST',
					data: msgInfo
				}).then((id) => {
					msgInfo.id = id;
					msgInfo.sendTime = new Date().getTime();
					msgInfo.sendId = this.$store.state.userStore.userInfo.id;
					msgInfo.selfSend = true;
					msgInfo.readedCount = 0,
						msgInfo.status = this.$enums.MESSAGE_STATUS.UNSEND;
					this.$store.commit("insertMessage", msgInfo);
					// 会话置顶
					this.moveChatToTop();
					this.sendText = "";
				}).finally(() => {
					// 滚动到底部
					this.scrollToBottom();
					// 清空@用户列表
					this.atUserIds = [];
					this.isReceipt = false;
				});
			},
			createAtText() {
				let atText = "";
				this.atUserIds.forEach((id) => {
					if (id == -1) {
						atText += ` @全体成员`;
					} else {
						let member = this.groupMembers.find((m) => m.userId == id);
						if (member) {
							atText += ` @${member.aliasName}`;
						}
					}
				})
				return atText;
			},
			fillTargetId(msgInfo, targetId) {
				if (this.chat.type == "GROUP") {
					msgInfo.groupId = targetId;
				} else {
					msgInfo.recvId = targetId;
				}
			},
			scrollToBottom() {
				let size = this.chat.messages.length;
				if (size > 0) {
					this.scrollToMsgIdx(size - 1);
				}
			},
			scrollToMsgIdx(idx) {
				// 如果scrollMsgIdx值没变化，滚动条不会移动
				if (idx == this.scrollMsgIdx && idx > 0) {
					this.$nextTick(() => {
						// 先滚动到上一条
						this.scrollMsgIdx = idx - 1;
						// 再滚动目标位置
						this.scrollToMsgIdx(idx);
					});
					return;
				}
				this.$nextTick(() => {
					this.scrollMsgIdx = idx;
				});

			},
			onShowEmoChatTab(){
				this.showRecord = false;
				this.switchChatTabBox('emo',true)
			},
			onShowToolsChatTab(){
				this.showRecord = false;
				this.switchChatTabBox('tools',true)
			},
			switchChatTabBox(chatTabBox, hideKeyBoard) {
				this.chatTabBox = chatTabBox;
				if (hideKeyBoard) {
					uni.hideKeyboard();
					this.showKeyBoard = false;
				}
			},
			selectEmoji(emoText) {
				this.sendText += `#${emoText};`;
			},
			onNavBack() {
				uni.switchTab({
					url: "/pages/chat/chat"
				})
			},
			onKeyboardheightchange(e) {
				if (e.detail.height > 0) {
					this.showKeyBoard = true;
					this.switchChatTabBox('none', false)
					this.keyboardHeight = this.rpxTopx(e.detail.height);
				} else {
					this.showKeyBoard = false;
				}
			},
			onUploadImageBefore(file) {
				let data = {
					originUrl: file.path,
					thumbUrl: file.path
				}
				let msgInfo = {
					id: 0,
					fileId: file.uid,
					sendId: this.mine.id,
					content: JSON.stringify(data),
					sendTime: new Date().getTime(),
					selfSend: true,
					type: this.$enums.MESSAGE_TYPE.IMAGE,
					readedCount: 0,
					loadStatus: "loading",
					status: this.$enums.MESSAGE_STATUS.UNSEND
				}
				// 填充对方id
				this.fillTargetId(msgInfo, this.chat.targetId);
				// 插入消息
				this.$store.commit("insertMessage", msgInfo);
				// 会话置顶
				this.moveChatToTop();
				// 借助file对象保存
				file.msgInfo = msgInfo;
				// 滚到最低部
				this.scrollToBottom();
				return true;
			},
			onUploadImageSuccess(file, res) {
				let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
				msgInfo.content = JSON.stringify(res.data);
				msgInfo.receipt = this.isReceipt
				this.$http({
					url: this.messageAction,
					method: 'POST',
					data: msgInfo
				}).then((id) => {
					msgInfo.loadStatus = 'ok';
					msgInfo.id = id;
					this.isReceipt = false;
					this.$store.commit("insertMessage", msgInfo);
				})
			},
			onUploadImageFail(file, err) {
				let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
				msgInfo.loadStatus = 'fail';
				this.$store.commit("insertMessage", msgInfo);
			},
			onUploadFileBefore(file) {
				let data = {
					name: file.name,
					size: file.size,
					url: file.path
				}
				let msgInfo = {
					id: 0,
					sendId: this.mine.id,
					content: JSON.stringify(data),
					sendTime: new Date().getTime(),
					selfSend: true,
					type: this.$enums.MESSAGE_TYPE.FILE,
					readedCount: 0,
					loadStatus: "loading",
					status: this.$enums.MESSAGE_STATUS.UNSEND
				}
				// 填充对方id
				this.fillTargetId(msgInfo, this.chat.targetId);
				// 插入消息
				this.$store.commit("insertMessage", msgInfo);
				// 会话置顶
				this.moveChatToTop();
				// 借助file对象保存
				file.msgInfo = msgInfo;
				// 滚到最低部
				this.scrollToBottom();
				return true;
			},
			onUploadFileSuccess(file, res) {
				let data = {
					name: file.name,
					size: file.size,
					url: res.data
				}
				let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
				msgInfo.content = JSON.stringify(data);
				msgInfo.receipt = this.isReceipt
				this.$http({
					url: this.messageAction,
					method: 'POST',
					data: msgInfo
				}).then((id) => {
					msgInfo.loadStatus = 'ok';
					msgInfo.id = id;
					this.isReceipt = false;
					this.$store.commit("insertMessage", msgInfo);
				})
			},
			onUploadFileFail(file, res) {
				let msgInfo = JSON.parse(JSON.stringify(file.msgInfo));
				msgInfo.loadStatus = 'fail';
				this.$store.commit("insertMessage", msgInfo);
			},
			onDeleteMessage(msgInfo) {
				uni.showModal({
					title: uni.$t('shan_chu_xiao_xi'),
					content: uni.$t('que_ren_shan_chu_xiao_xi'),
					success: (res) => {
						if (!res.cancel) {
							this.$store.commit("deleteMessage", msgInfo);
							uni.showToast({
								title: uni.$t('shan_chu_cheng_gong'),
								icon: "none"
							})
						}
					}
				})
			},
			onRecallMessage(msgInfo) {
				uni.showModal({
					title: uni.$t('che_hui_xiao_xi'),
					content: uni.$t('que_ren_che_hui_xiao_xi'),
					success: (res) => {
						if (!res.cancel) {
							let url = `/message/${this.chat.type.toLowerCase()}/recall/${msgInfo.id}`
							this.$http({
								url: url,
								method: 'DELETE'
							}).then(() => {
								msgInfo = JSON.parse(JSON.stringify(msgInfo));
								msgInfo.type = this.$enums.MESSAGE_TYPE.RECALL;
								msgInfo.content = uni.$t('ni_che_hui_le_yi_tiao_xiao_xi');
								msgInfo.status = this.$enums.MESSAGE_STATUS.RECALL;
								this.$store.commit("insertMessage", msgInfo);
							})
						}
					}
				})
			},
			onDownloadFile(msgInfo) {
				let url = JSON.parse(msgInfo.content).url;
				uni.downloadFile({
					url: url,
					success(res) {
						if (res.statusCode === 200) {
							var filePath = encodeURI(res.tempFilePath);
							uni.openDocument({
								filePath: filePath,
								showMenu: true
							});
						}
					},
					fail(e) {
						console.log(e);
						uni.showToast({
							title: uni.$t('wen_jian_xia_zai_shi_bai'),
							icon: "none"
						})
					}
				});
			},
			onScrollToTop() {
				if(this.showMinIdx==0){
					console.log("消息已滚动到顶部")
					return;
				}
			
				//  #ifndef H5
				// 防止滚动条定格在顶部，不能一直往上滚
				this.scrollToMsgIdx(this.showMinIdx);
				// #endif
				// 多展示0条信息
				this.showMinIdx = this.showMinIdx > 20 ? this.showMinIdx - 20 : 0;
			},
			onShowMore() {
				if (this.chat.type == "GROUP") {
					uni.navigateTo({
						url: "/pages/group/group-info?id=" + this.group.id
					})
				} else {
					uni.navigateTo({
						url: "/pages/common/user-info?id=" + this.friend.id
					})
				}
			},
			onTextInput(e) {
				let idx = e.detail.cursor - 1;
				if (this.chat.type == 'GROUP' && e.detail.value[idx] == '@') {
					this.openAtBox();
					let sendText = e.detail.value.replace("@", '');
					this.$nextTick(() => {
						this.sendText = sendText;
					})
				}
			},
			loadReaded(fId) {
				this.$http({
					url: `/message/private/maxReadedId?friendId=${fId}`,
					method: 'get'
				}).then((id) => {
					this.$store.commit("readedMessage", {
						friendId: fId,
						maxId: id
					});
				});
			},
			readedMessage() {
				if(this.unreadCount == 0){
					return;
				}
				let url = ""
				if (this.chat.type == "GROUP") {
					url = `/message/group/readed?groupId=${this.chat.targetId}`
				} else {
					url = `/message/private/readed?friendId=${this.chat.targetId}`
				}
				this.$http({
					url: url,
					method: 'PUT'
				}).then(() => {
					this.$store.commit("resetUnreadCount", this.chat)
					this.scrollToBottom();
				})
			},
			loadGroup(groupId) {
				this.$http({
					url: `/group/find/${groupId}`,
					method: 'GET'
				}).then((group) => {
					this.group = group;
					this.$store.commit("updateChatFromGroup", group);
					this.$store.commit("updateGroup", group);
				});

				this.$http({
					url: `/group/members/${groupId}`,
					method: 'GET'
				}).then((groupMembers) => {
					this.groupMembers = groupMembers;
				});
			},
			loadFriend(friendId) {
				// 获取对方最新信息
				this.$http({
					url: `/user/find/${friendId}`,
					method: 'GET'
				}).then((friend) => {
					this.friend = friend;
					this.$store.commit("updateChatFromFriend", friend);
					this.$store.commit("updateFriend", friend);
				})
			},
			rpxTopx(rpx) {
				// px转换成rpx
				let info = uni.getSystemInfoSync()
				let px = info.windowWidth * rpx / 750;
				return Math.floor(rpx);
			}
		},
		computed: {
			mine() {
				return this.$store.state.userStore.userInfo;
			},
			title() {
				if (!this.chat) {
					return "";
				}
				let title = this.chat.showName;
				if (this.chat.type == "GROUP") {
					let size = this.groupMembers.filter(m => !m.quit).length;
					title += `(${size})`;
				}
				return title;
			},
			messageAction() {
				return `/message/${this.chat.type.toLowerCase()}/send`;
			},
			messageSize() {
				if (!this.chat || !this.chat.messages) {
					return 0;
				}
				return this.chat.messages.length;
			},
			unreadCount() {
				return this.chat.unreadCount;
			},
			atUserItems() {
				let atUsers = [];
				this.atUserIds.forEach((id) => {
					if (id == -1) {
						atUsers.push({
							id: -1,
							aliasName: uni.$t('quan_ti_cheng_yuan')
						})
						return;
					}
					let member = this.groupMembers.find((m) => m.userId == id);
					if (member) {
						atUsers.push(member);
					}
				})
				return atUsers;
			}
		},
		watch: {
			messageSize: function(newSize, oldSize) {
				// 接收到消息时滚动到底部
				if (newSize > oldSize) {
					this.scrollToBottom();
				}
			},
			unreadCount: {
				handler(newCount, oldCount) {
					if (newCount > 0) {
						// 消息已读
						this.readedMessage()
					}
				}
			}
		},
		onLoad(options) {
			// 聊天数据
			this.chat = this.$store.state.chatStore.chats[options.chatIdx];
			// 初始状态只显示20条消息
			let size = this.chat.messages.length;
			this.showMinIdx = size > 20 ? size - 20 : 0;
			// 消息已读
			this.readedMessage()
			// 加载好友或群聊信息
			if (this.chat.type == "GROUP") {
				this.loadGroup(this.chat.targetId);
			} else {
				this.loadFriend(this.chat.targetId);
				this.loadReaded(this.chat.targetId)
			}
			// 激活当前会话
			this.$store.commit("activeChat", options.chatIdx);
			// 复位回执消息
			this.isReceipt = false;
			// 页面滚到底部
			this.scrollToBottom();
		},
		onUnload() {
			this.$store.commit("activeChat", -1);
		}
	}
</script>

<style lang="scss" scoped>
	.chat-box {
		position: relative;
		border: #dddddd solid 1px;
		display: flex;
		flex-direction: column;

		.header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 60rpx;
			padding: 5px;
			background-color: white;
			line-height: 50px;
			font-size: 40rpx;
			font-weight: 600;
			border: #dddddd solid 1px;


			.btn-side {
				position: absolute;
				line-height: 60rpx;
				font-size: 28rpx;
				cursor: pointer;

				&.left {
					left: 30rpx;
				}

				&.right {
					right: 30rpx;
				}
			}
		}


		.chat-msg {
			flex: 1;
			padding: 0;
			border: #dddddd solid 1px;
			overflow: hidden;
			position: relative;
			background-color: #f8f8f8;

			.scroll-box {
				height: 100%;
			}
		}

		.chat-at-bar {
			display: flex;
			align-items: center;
			padding: 0 10rpx;
			border: #dddddd solid 1px;

			.icon-at {
				font-size: 35rpx;
				color: darkblue;
				font-weight: 600;
			}

			.chat-at-scroll-box {
				flex: 1;
				width: 80%;

				.chat-at-items {
					display: flex;
					align-items: center;
					height: 70rpx;

					.chat-at-item {
						padding: 0 3rpx;
					}
				}
			}

		}

		.send-bar {
			display: flex;
			align-items: center;
			padding: 10rpx;
			margin-bottom: 10rpx;
			border: #dddddd solid 1px;
			background-color: white;

			.iconfont {
				font-size: 60rpx;
				margin: 3rpx;
			}

			.chat-record {
				flex: 1;

			}

			.send-text {
				flex: 1;
				background-color: #f8f8f8 !important;
				overflow: auto;
				padding: 20rpx;
				background-color: #fff;
				border-radius: 20rpx;
				font-size: 30rpx;
				box-sizing: border-box;

				.send-text-area {
					width: 100%;
				}
			}

			.btn-send {
				margin: 5rpx;
			}
		}


		.chat-tab-bar {
			height: 500rpx;
			padding: 20rpx;
			background-color: whitesmoke;

			.chat-tools {
				display: flex;
				flex-wrap: wrap;

				.chat-tools-item {
					width: 140rpx;
					padding: 16rpx;
					display: flex;
					flex-direction: column;
					align-items: center;

					.tool-icon {
						padding: 28rpx;
						font-size: 60rpx;
						background-color: white;
						border-radius: 20%;

						&.active {
							background-color: #ddd;
						}
					}

					.tool-name {
						height: 60rpx;
						line-height: 60rpx;
						font-size: 25rpx;
					}
				}
			}

			.chat-emotion {
				height: 100%;

				.emotion-item-list {
					display: flex;
					flex-wrap: wrap;

					.emotion-item {
						width: 40px;
						height: 40px;
						text-align: center;
						cursor: pointer;
						padding: 6px;
					}
				}
			}

		}
	}
</style>