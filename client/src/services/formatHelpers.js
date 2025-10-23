import { addDays, subDays, format } from 'date-fns'

function getInitialFormatObj (val) {
  return {
    formattedVal: val,
    statusText: 'success'
  }
}

function getFormatted (type, val, options) {
  if (type === 'color') {
    return formatColorSquare(val, options)
  } else if (type === 'currency') {
    return formatCurrency(val, options)
  } else if (type === 'date') {
    return formatDateString(val, options)
  } else if (type === 'image') {
    return formatImage(val, options)
  } else if (type === 'link') {
    return formatLink(val, options)
  } else if (type === 'percent') {
    return formatPercent(val, options)
  } else {
    const formatObj = getInitialFormatObj(val)
    formatObj.statusText = 'Format Type not found'
    return formatObj
  }
}

function formatColorSquare (val, options) {
  const formatObj = getInitialFormatObj(val)
  if (typeof val === 'string' && (val.startsWith('#') || val.startsWith('rgb'))) {
    formatObj.formattedVal = `
      <div
        style="background-color: ${val}; width: ${options.width || '20px'}; height: ${options.height || '20px'};
        display: inline-block;">
      </div>
      ${val}
    `
  } else {
    formatObj.statusText = 'Value must be a String in hex: #ffffff or RGB: rgb(255,255,255) format'
  }
  return formatObj
}
function formatCurrency (val, options) {
  const formatObj = getInitialFormatObj(val)
  try {
    const currency = new Intl.NumberFormat(options.locale, {
      style: 'currency',
      currency: options.currency,
      maximumFractionDigits: options.maxFractionDigits
    })
    formatObj.formattedVal = currency.format(val)
  } catch (error) {
    formatObj.statusText = error
  }
  return formatObj
}
function formatDateString (val, options) {
  const initialValue = options.subDays ?
    subDays(val, options.subDays) :
    options.addDays ?
      addDays(val, options.addDays) :
      val
  const formatObj = getInitialFormatObj(initialValue)
  try {
    // https://date-fns.org/v4.1.0/docs/format#
    // const dateVal = new Date(val)
    formatObj.formattedVal = format(initialValue, options.formatStr)
  } catch (error) {
    formatObj.statusText = error
  }
  return formatObj
}

function formatImage (val, options) {
  const formatObj = getInitialFormatObj(val)
  formatObj.formattedVal = `<img src="${val}" style="max-height: ${options.maxHeight || '40px'}; max-width: ${options.maxWidth || '40px'};">`
  return formatObj
}

function formatLink (val, options) {
  const formatObj = getInitialFormatObj(val)
  formatObj.formattedVal = `<a href="${val}" target="${options.target || '_blank'}">${options.linkName || val}</a>`
  return formatObj
}

function formatPercent (val, options) {
  const formatObj = getInitialFormatObj(val)
  const percentage = new Intl.NumberFormat(options.locale, {
    style: 'percent',
    maximumFractionDigits: options.maxFractionDigits
  })
  formatObj.formattedVal = percentage.format(val)
  return formatObj
}

export default {
  getFormatted,
  formatColorSquare,
  formatCurrency,
  formatDateString,
  formatImage,
  formatLink,
  formatPercent
}
