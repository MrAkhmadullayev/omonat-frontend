export const formatMoney = (amount, currency = 'UZS') => {
	return new Intl.NumberFormat('uz-UZ', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount || 0)
}

export const formatPhoneNumber = value => {
	let val = value.replace(/\D/g, '').slice(0, 9)
	if (val.length > 2) val = `${val.slice(0, 2)} ${val.slice(2)}`
	if (val.length > 6) val = `${val.slice(0, 6)} ${val.slice(6)}`
	return val
}

export const formatCardNumber = value => {
	const val = value.replace(/\D/g, '').substring(0, 16)
	return val.match(/.{1,4}/g)?.join(' ') || val
}

export const formatAmount = e => {
	let value = e.target.value.replace(/\D/g, '')
	if (value) {
		e.target.value = parseInt(value, 10)
			.toLocaleString('ru-RU')
			.replace(/,/g, ' ')
	}
}

export const calculateDaysLeft = dueDateStr => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const due = new Date(dueDateStr)
	return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
}
