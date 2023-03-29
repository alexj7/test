<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
</script>

<div class="chat mb-4 {type === 'user' ? 'chat-start' : 'chat-end '} justify-end">
	<div class="chat-image avatar">
		<div class="w-6 rounded-full">
			<img
				src="{type === 'user'? 'user.svg': '/dary-chat.svg' }"
				alt="{type} avatar"
			/>
		</div>
	</div>
	<div
		class="chat-bubble {type === 'user'
			? 'chat-bubble-user bg-gray-50 text-gray-600'
			: 'chat-bubble-system bg-gradient-to-r  from-pink-600 to-purple-700'}"
	>
		{message}
	</div>
</div>

<style>
	.chat-bubble-user {
		color: #63697b;
		background-color: #eaecf2;
	}
	.chat-bubble-system {
		color: #ffffff !important;
	}
	.chat-bubble-system:before {
		background-color: #8422c8;
	}
</style>
