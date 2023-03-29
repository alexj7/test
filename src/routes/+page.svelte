<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import type { ChatCompletionRequestMessage } from 'openai'
	import { SSE } from 'sse.js'

	let query: string = ''
	let answer: string = ''
	let loading: boolean = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let scrollToDiv: HTMLDivElement

	function scrollToBottom() {
		setTimeout(function () {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	const handleSubmit = async () => {
		loading = true
		chatMessages = [...chatMessages, { role: 'user', content: query }]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		query = ''

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e) => {
			scrollToBottom()
			try {
				loading = false
				if (e.data === '[DONE]') {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}
			} catch (err) {
				handleError(err)
			}
		})
		eventSource.stream()
		scrollToBottom()
	}

	function handleError<T>(err: T) {
		loading = false
		query = ''
		answer = ''
		console.error(err)
	}
</script>

<div class="h-screen max-w-2xl bg-gray-100">
	<div class="h-full flex flex-col w-full items-center text-xs">
		<div class="h-14 w-full px-4 bg-white flex items-center">
			<img src="/dary.svg" alt="Icono" />
			<img class="h-4/6 ml-3" src="/dary_logo_1.svg" alt="Icono" />
		</div>
		<div
			class="bg-gray-100 h-full w-full bg-bacground-chat border-none p-4 overflow-y-auto flex flex-col"
		>
			<div class="flex flex-col">
				<p class="text-blue-900 text-center mt-6">
					Hola! 😄 Soy Dary, asistente virtual de Tanta. 🍽️ Estoy aquí para ayudarte a obtener
					información sobre el restaurante, los productos del menú y las recomendaciones de una
					manera fácil y rápida.
				</p>
				<p class="text-blue-900 text-center my-5">
					Conmigo, tendrás una atención 100% personalizada y siempre aprenderé de cada interacción
					contigo para brindarte una mejor experiencia cada vez. 🤖💬
				</p>
				<p class="text-blue-900 text-center mb-11">Pregúntame ¿qué puedo hacer por ti? 😉</p>
				<ChatMessage type="assistant" message="¡Bienvenido 👋🏼 ¿Cómo puedo ayudarte hoy?" />
				{#each chatMessages as message}
					<ChatMessage type={message.role} message={message.content} />
				{/each}
				{#if answer}
					<ChatMessage type="assistant" message={answer} />
				{/if}
				{#if loading}
					<ChatMessage type="assistant" message="Loading..." />
				{/if}
			</div>
			<div class="" bind:this={scrollToDiv} />
		</div>
		<form
			class="flex w-full max-w-2xl pb-5 pt-1 px-4  items-center bg-gray-100"
			on:submit|preventDefault={() => handleSubmit()}
		>
			<input
				type="text"
				placeholder="Pídeme las recomendaciones que quieras…"
				class="h-11 pl-5 outline-none placeholder-gray-400 w-full shadow-xl text-gray-600 py-3 rounded-full mr-3 bg-gray-200"
				bind:value={query}
			/>
			<button
				type="submit"
				class=" h-11 w-11 max-w-[2.5rem] max-h-[2.5rem] shadow-2xl rounded-full bg-gradient-to-t flex items-center justify-center from-pink-600 to-indigo-600"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="icon icon-tabler icon-tabler-send"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="#ffffff"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none" />
					<line x1="10" y1="14" x2="21" y2="3" />
					<path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
				</svg>
			</button>
		</form>
	</div>
</div>

<style>
	.h-full {
		flex-grow: 1;
		height: 100dvh;
	}
</style>
