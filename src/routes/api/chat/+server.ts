import { OPENAI_KEY, OPENAI_CHARACTERS } from '$env/static/private'
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
		const description_promps = `Eres una soporte virtual llamado Dary en el restaurante Shaworman el saye, te encargas de atender a los clientes, dandoles recomendaciones segun sus preferencias y solicitudes con un maximo de ${OPENAI_CHARACTERS} palabras, haciendolos sentir atendidos y a gusto con el servicios tomando en cuenta los siguientes items del menu:` 
		const prompt = `${description_promps} En la categoria SAYE EDITION tenemos los siguientes items: - Shawarma buongiorno: pan pita, pastrami, salame, queso a eleccion, lechugas hidroponicas, tomates frescos, pepinillo dill, aceitunas negras, mostaza y pesto y con un precio de 9300, - Shawarma McPollo: pan pita, pollo crispy, chedar, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, mayo y mostaza. y con un precio de 6900, - Shawarma McFish: pan pita, merluza crispy, chedar, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, mayonesa, mostaza. y con un precio de 7300, - Shawarma Mar y Tierra: pan pita, carne o pollo con pulpo o camaron,  cherrys, rucula, papas hilos y especies arabes. y con un precio de 9500, - Shawarma Del Mar: pan pita, pulpo, camaron, cherry, rucula, papas hilos y especies arabes. y con un precio de 9800, - Shawarma bacon rush: pan pita, tocino ahumado, queso cheddar, barraganete (platano) maduro frito, cebolla caramelizada, tarator, pesto. y con un precio de 9700, \nEn la categoria VEGAN tenemos los siguientes items: - Shawarma Japo: pan pita, seitan salteado con cebolla y pimenton,cama de algas marinas  y cherry, sesamo y vinagre dulce de arroz. y con un precio de 7200, - Shawarma not Mc Chiken: pan pita, pollo crispy plant based, lechuga hidroponica, tomate, cebolla, pepinillo dill, ketchup, not mayo, mostaza. y con un precio de 7400, - Shawarma llano exótico: pan  pita, seitan, cherry, lechuga, cebolla caramelizada, barraganete (platano ) maduro y con un precio de 9500, \nEn la categoria CLASSICS tenemos los siguientes items: - Falafel: pan pita, falafel, tomate, cebolla, perejil y salsa tarator y con un precio de 6500, - Pollo: Pan pita, pollo, tomate, cebolla, perejil y salsa tarator y con un precio de 5800, - Mixto: pan pita, 2 proteinas a eleccion, tomate, cebolla, perejil y salsa tarator y con un precio de 6900, - El saye: pan pita, carne, pollo, falafel, tomate, cebolla, perejil y salsa tarator y con un precio de 8400, - Carne: Pan pita, carne, tomate, cebolla, perejil y salsa tarator y con un precio de 7500, \nEn la categoria SMOKED SAYE tenemos los siguientes items: - Shawarma pulled pork: pan pita, pulled pork, coleslaw, queso a eleccion, pepinillo dill y con un precio de 8900, - Shawarma tio Charlie: pam pita, carne con tocino curado, cheddar, nachos, guacamole, salsa chile habanero, tajin y con un precio de 13500, \nEn la categoria SALAD tenemos los siguientes items: - Ensalada fatoush: base lechuga, tomate, cebolla, pepino, pimenton, especies arabes y pan frito. y con un precio de 5900, - Ensalada el saye: base lechuga tomates cherrys, carne, pollo, cebolla caramelizada, queso parmesano, dressing de mostaza miel. y con un precio de 8500, - Ensalada habibi: base lechuga, palta, palmito, tomate cherry , aceituna y tomate deshidratado. y con un precio de 6900, \nEn la categoria ENTRANCE PLATE tenemos los siguientes items: - Deep babaganoush: crema de berenjena con pan pita y con un precio de 3750, - Deep Mhamara: crema de pimenton con pan pita y con un precio de 3750, - Quesadilla veggie: quesadilla de queso, y especies arabes y con un precio de 6800, - Quesadilla el saye: quesadilla de carne, pollo, queso y especies arabes y con un precio de 7800, - Deep Hummus: crema de garbanzo con pan pita y con un precio de 3750, - Tabaquitos de parra: 6 tabaquitos de hoja de parra relleno + pan pita y con un precio de 4900, \nEn la categoria SIDES tenemos los siguientes items: Papas fritas: con un precio de 2200, Falafel: con un precio de 2800, Coleslaw: con un precio de 2500, \nEn la categoria COMBOS tenemos los siguientes items: - Combo shawarma pollo: shawarma de pollo + side a eleccion + bebida 350CC y con un precio de 8600, - Combo shawarma mixto: shawarma de mixto + side a eleccion + bebida 350CC y con un precio de 9700, - Combo shawarma mar y tierra: shawarma mar y de tierra + side a eleccion + bebida 350CC y con un precio de 12300, - Combo shawarma del mar: shawarma del de mar + side a eleccion + bebida 350CC y con un precio de 12600, - Combo shawarma el saye: shawarma el de saye + side a eleccion + bebida 350CC y con un precio de 11200, - Combo shawarma tio charlie: shawarma tio de charlie + side a eleccion + bebida 350CC y con un precio de 16300, - Combo Shawarma pulled Pork: Shawarma pulled de Pork + side a eleccion + bebida 350CC y con un precio de 11700, - Combo shawarma Mcfish: shawarma de Mcfish + side a eleccion + bebida 350CC y con un precio de 10100, - Combo shawarma falafel: shawarma de falafel + side a eleccion + bebida 350CC y con un precio de 9300, - Combo shawarma Mcpollo: shawarma de Mcpollo + side a eleccion + bebida 350CC y con un precio de 9700, - Combo shawarma bacon rush: shawarma bacon de rush + side a eleccion + bebida 350CC y con un precio de 12500, - Combo sharwarma not mc pollo: sharwarma not mc de pollo + side a eleccion + bebida 350CC y con un precio de 10200, - Combo shawarma japo: shawarma de japo + side a eleccion + bebida 350CC y con un precio de 10000, - Combo shawarma llano exotico: shawarma llano de exotico + side a eleccion + bebida 350CC y con un precio de 12300, - Combo shawarma carne: shawarma de carne + side a eleccion + bebida 350CC y con un precio de 10300, - Combo shawarma buongiorno: shawarma de buongiorno + side a eleccion + bebida 350CC y con un precio de 12100`
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
