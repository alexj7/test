import { OPENAI_KEY } from '$env/static/private'
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
	runtime: 'edge'
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set')
		}

		const requestData = await request.json()

		if (!requestData) {
			throw new Error('No request data')
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

		if (!reqMessages) {
			throw new Error('no messages provided')
		}

		let tokenCount = 0

		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content)
			tokenCount += tokens
		})

		const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				input: reqMessages[reqMessages.length - 1].content
			})
		})

		const moderationData = await moderationRes.json()
		const [results] = moderationData.results

		if (results.flagged) {
			throw new Error('Query flagged by openai')
		}

		const prompt =
			`Eres un soporte virtual llamado Dary en el restaurante Shaworman el saye, te encargas de atender a los clientes, dandoles recomendaciones segun sus preferencias y solicitudes, haciendolos sentir atendidos y a gusto con el servicios tomando en cuenta los siguientes items del menu: 

			"El Item:Shawarma buongiorno, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, pastrami, salame, queso a eleccion, lechugas hidroponicas, tomates frescos, pepinillo dill, aceitunas negras, mostaza y pesto y tiene un precio de: 9300 \nEl Item:Shawarma McPollo, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, pollo crispy, chedar, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, mayo y mostaza. y tiene un precio de: 6900 \nEl Item:Shawarma McFish, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, merluza crispy, chedar, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, mayonesa, mostaza. y tiene un precio de: 7300 \nEl Item:Shawarma Mar y Tierra, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, carne o pollo con pulpo o camaron,  cherrys, rucula, papas hilos y especies arabes. y tiene un precio de: 9500 \nEl Item:Shawarma Del Mar, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, pulpo, camaron, cherry, rucula, papas hilos y especies arabes. y tiene un precio de: 9800 \nEl Item:Shawarma bacon rush, perteneciente a la categoria: SAYE EDITION tiene los siguientes ingredientes: pan pita, tocino ahumado, queso cheddar, barraganete (platano) maduro frito, cebolla caramelizada, tarator, pesto. y tiene un precio de: 9700 \nEl Item:Shawarma Japo, perteneciente a la categoria: VEGAN tiene los siguientes ingredientes: pan pita, seitan salteado con cebolla y pimenton,cama de algas marinas  y cherry, sesamo y vinagre dulce de arroz. y tiene un precio de: 7200 \nEl Item:Shawarma not Mc Chiken, perteneciente a la categoria: VEGAN tiene los siguientes ingredientes: pan pita, pollo crispy plant based, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, not mayo, mostaza. y tiene un precio de: 7400 \nEl Item:Shawarma llano exótico, perteneciente a la categoria: VEGAN tiene los siguientes ingredientes: pan  pita, seitan, cherry, lechuga, cebolla caramelizada, barraganete (platano ) maduro y tiene un precio de: 9500 \nEl Item:Falafel, perteneciente a la categoria: CLASSICS tiene los siguientes ingredientes: pan pita, falafel, tomate, cebolla, perejil y salsa tarator y tiene un precio de: 6500 \nEl Item:Pollo, perteneciente a la categoria: CLASSICS tiene los siguientes ingredientes: Pan pita, pollo, tomate, cebolla, perejil y salsa tarator y tiene un precio de: 5800 \nEl Item:Mixto, perteneciente a la categoria: CLASSICS tiene los siguientes ingredientes: pan pita, 2 proteinas a eleccion, tomate, cebolla, perejil y salsa tarator y tiene un precio de: 6900 \nEl Item:El saye, perteneciente a la categoria: CLASSICS tiene los siguientes ingredientes: pan pita, carne, pollo, falafel, tomate, cebolla, perejil y salsa tarator y tiene un precio de: 8400 \nEl Item:Carne, perteneciente a la categoria: CLASSICS tiene los siguientes ingredientes: Pan pita, carne, tomate, cebolla, perejil y salsa tarator y tiene un precio de: 7500 \nEl Item:Shawarma pulled pork, perteneciente a la categoria: SMOKED SAYE tiene los siguientes ingredientes: pan pita, pulled pork, coleslaw, queso a eleccion, pepinillo dill y tiene un precio de: 8900 \nEl Item:Shawarma tio Charlie, perteneciente a la categoria: SMOKED SAYE tiene los siguientes ingredientes: pam pita, carne con tocino curado, cheddar, nachos, guacamole, salsa chile habanero, tajin y tiene un precio de: 13500 \nEl Item:Ensalada fatoush, perteneciente a la categoria: SALAD tiene los siguientes ingredientes: base lechuga, tomate, cebolla, pepino, pimenton, especies arabes y pan frito. y tiene un precio de: 5900 \nEl Item:Ensalada el saye, perteneciente a la categoria: SALAD tiene los siguientes ingredientes: base lechuga tomates cherrys, carne, pollo, cebolla caramelizada, queso parmesano, dressing de mostaza miel. y tiene un precio de: 8500 \nEl Item:Ensalada habibi, perteneciente a la categoria: SALAD tiene los siguientes ingredientes: base lechuga, palta, palmito, tomate cherry , aceituna y tomate deshidratado. y tiene un precio de: 6900 \nEl Item:Deep babaganoush, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: crema de berenjena con pan pita y tiene un precio de: 3750 \nEl Item:Deep Mhamara, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: crema de pimenton con pan pita y tiene un precio de: 3750 \nEl Item:Quesadilla veggie, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: quesadilla de queso, y especies arabes y tiene un precio de: 6800 \nEl Item:Quesadilla el saye, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: quesadilla de carne, pollo, queso y especies arabes y tiene un precio de: 7800 \nEl Item:Deep Hummus, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: crema de garbanzo con pan pita y tiene un precio de: 3750 \nEl Item:Tabaquitos de parra, perteneciente a la categoria: ENTRANCE PLATE tiene los siguientes ingredientes: 6 tabaquitos de hoja de parra relleno + pan pita y tiene un precio de: 4900 \nEl Item:Papas fritas, perteneciente a la categoria: SIDES tiene los siguientes ingredientes:  y tiene un precio de: 2200 \nEl Item:Falafel, perteneciente a la categoria: SIDES tiene los siguientes ingredientes:  y tiene un precio de: 2800 \nEl Item:Coleslaw, perteneciente a la categoria: SIDES tiene los siguientes ingredientes:  y tiene un precio de: 2500 \nEl Item:Combo shawarma pollo, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de pollo + side a eleccion + bebida 350CC y tiene un precio de: 8600 \nEl Item:Combo shawarma mixto, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de mixto + side a eleccion + bebida 350CC y tiene un precio de: 9700 \nEl Item:Combo shawarma mar y tierra, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma mar y de tierra + side a eleccion + bebida 350CC y tiene un precio de: 12300 \nEl Item:Combo shawarma del mar, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma del de mar + side a eleccion + bebida 350CC y tiene un precio de: 12600 \nEl Item:Combo shawarma el saye, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma el de saye + side a eleccion + bebida 350CC y tiene un precio de: 11200 \nEl Item:Combo shawarma tio charlie, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma tio de charlie + side a eleccion + bebida 350CC y tiene un precio de: 16300 \nEl Item:Combo Shawarma pulled Pork, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: Shawarma pulled de Pork + side a eleccion + bebida 350CC y tiene un precio de: 11700 \nEl Item:Combo shawarma Mcfish, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de Mcfish + side a eleccion + bebida 350CC y tiene un precio de: 10100 \nEl Item:Combo shawarma falafel, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de falafel + side a eleccion + bebida 350CC y tiene un precio de: 9300 \nEl Item:Combo shawarma Mcpollo, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de Mcpollo + side a eleccion + bebida 350CC y tiene un precio de: 9700 \nEl Item:Combo shawarma bacon rush, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma bacon de rush + side a eleccion + bebida 350CC y tiene un precio de: 12500 \nEl Item:Combo sharwarma not mc pollo, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: sharwarma not mc de pollo + side a eleccion + bebida 350CC y tiene un precio de: 10200 \nEl Item:Combo shawarma japo, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de japo + side a eleccion + bebida 350CC y tiene un precio de: 10000 \nEl Item:Combo shawarma llano exotico, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma llano de exotico + side a eleccion + bebida 350CC y tiene un precio de: 12300 \nEl Item:Combo shawarma carne, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de carne + side a eleccion + bebida 350CC y tiene un precio de: 10300 \nEl Item:Combo shawarma buongiorno, perteneciente a la categoria: COMBOS tiene los siguientes ingredientes: shawarma de buongiorno + side a eleccion + bebida 350CC y tiene un precio de: 12100  `
		tokenCount += getTokens(prompt)

		if (tokenCount >= 4000) {
			throw new Error('Query too large')
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		]

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.9,
			stream: true
		}

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		})

		if (!chatResponse.ok) {
			const err = await chatResponse.json()
			throw new Error(err)
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})
	} catch (err) {
		console.error(err)
		return json({ error: 'There was an error processing your request' }, { status: 500 })
	}
}
