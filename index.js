#!/usr/bin/env node

const pkg = require('./package.json')
const dayjs = require('dayjs')
const updateNotifier = require('update-notifier')
updateNotifier({ pkg }).notify()

const v = pkg.version

const API = 'https://whois3.weapi.co/api/v1/methods/get_name_info'

const { program } = require('commander')
const { default: axios } = require('axios')
program.version(v)

program.arguments('<keyword>').action(async (keyword) => {
	console.log()
	console.log('querying: ', keyword)
	if (!keyword) {
		console.error('Please type something.')
		return
	}
	try {
		const { data } = await axios.get(API, {
			params: {
				name: keyword,
				v: v
			}
		})
		console.log()
		console.log('-------------------------------------------')
		console.log('available:     ', data.data.available, data.data.reason ? `(${data.data.reason})` : '')
		if (data.data.available) {
			console.log('register url:  ', getRegisterUrl(data.data.name))
		}
		if (data.data.registered_at) {
			console.log('registered at: ', dayjs(data.data.registered_at).format('YYYY-MM-DD HH:mm'))
			console.log('expire at:     ', dayjs(data.data.expire_at).format('YYYY-MM-DD HH:mm'))
		}
		if (data.data.period) {
			console.log('period:        ', data.data.period, `(${data.data.period_left_days} days left)`)
		}
		if (data.data.premium_eth_price) {
			console.log('current price: ', `$${data.data.basic_price} + $${data.data.premium_usd_price.toFixed(2)}`)
		}
		if (data.data.status === 20) {
			console.log('register url:  ', getRegisterUrl(data.data.name))
		}
		console.log('-------------------------------------------')
    console.dir(data.data)
	} catch (e) {
		console.log(e.message)
	}
})

program.parse()

function getRegisterUrl(name) {
	if (name.includes('.bit')) {
		return `https://app.did.id/explorer?inviter=digging.bit`
	} else if (name.includes('.eth')) {
		return `https://app.ens.domains/name/${name}/register`
	}
}
