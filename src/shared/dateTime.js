function _dayOfYear (date) {
  // https://www.30secondsofcode.org/js/s/day-of-year
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
}

function getFormattedDate (date) {
  // YYYY-MM-DD format
  // https://stackoverflow.com/a/29774197/756623
  return date.toISOString().split('T')[0]
}

function formatDateToMMDDYYYY (date) {
  const isoString = date.toISOString() // Get the ISO 8601 format string
  const parts = isoString.split('T')[0].split('-') // Split the string and get date parts
  const [year, month, day] = parts

  return `${month}/${day}/${year}`
}

function sortKeyFromDate (year, date) {
  return parseInt(year.toString() + _dayOfYear(date).toString().padStart(3, 0))
}

function getSkyLogDateTimeObj () {
  const todayTimeStamp = new Date()
  todayTimeStamp.setDate(todayTimeStamp.getDate())
  return {
    todayTimeStamp: todayTimeStamp,
    formattedDate: getFormattedDate(todayTimeStamp),
    year: todayTimeStamp.getFullYear(),
    created: todayTimeStamp.toISOString()
  }
}

function createDateFromMMDDYYYY (dateString) {
  const [monthStr, dayStr, yearStr] = dateString.split('/')
  const month = parseInt(monthStr, 10) - 1 // Month is 0-indexed
  const day = parseInt(dayStr, 10)
  const year = parseInt(yearStr, 10)

  console.log(monthStr, dayStr, yearStr)
  console.log('NEW DATE', new Date(year, month, day))
  return new Date(year, month, day)
}

function formatDateToYYYYMMDD (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

module.exports = { createDateFromMMDDYYYY, formatDateToYYYYMMDD, getFormattedDate, sortKeyFromDate, getSkyLogDateTimeObj, formatDateToMMDDYYYY }