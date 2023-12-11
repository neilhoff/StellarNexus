import { date } from 'quasar'

function getDateArray (start, end) {
  const arr = []
  for (let dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)) {
    arr.push(defaultDateFormat(new Date(dt)))
  }
  return arr
}

function sortByDate (arr, direction, sortParam) {
  const arrCopy = JSON.parse(JSON.stringify(arr))
  return arrCopy.sort((a, b) => {
    if (direction === 'desc') return new Date(b[sortParam]).getTime() - new Date(a[sortParam]).getTime()
    else return new Date(a[sortParam]).getTime() - new Date(b[sortParam]).getTime()
  })
}

function sortByNumber (arr, direction, sortParam) {
  const arrCopy = JSON.parse(JSON.stringify(arr))
  return arrCopy.sort((a, b) => {
    if (direction === 'desc') return (b[sortParam] - a[sortParam])
    else return (a[sortParam] - b[sortParam])
  })
}

function defaultDateFormat (dateObj) {
  if (typeof dateObj === 'object') {
    return date.formatDate(dateObj, 'MM/DD/YYYY')
  } else {
    // If the dateObj is a string then it is the dateOfAnalytics param in the format of YYYY-MM-DD
    // Quasar date util doesn't handle strings very well. It subtracts a day.
    const splitDate = dateObj.split('-')
    if (splitDate.length === 0) {
      return null
    }
    const year = splitDate[0]
    const month = splitDate[1]
    const day = splitDate[2]
    const newDateObj = new Date()
    newDateObj.setDate(day)
    newDateObj.setMonth(month - 1) // Months start at 0 in JS
    newDateObj.setFullYear(year)

    return date.formatDate(newDateObj, 'MM/DD/YYYY')
  }
}

function formatTime (dateString) {
  return date.formatDate(dateString, 'h:mm a')
}

function defaultChartColors () {
  return ['#6290e7', '#62cbc9', '#ff7f40', '#b04fc4']
}

function getViewsByDay (param, day, data) {
  const dayCopy = { ...day }
  const dataCopy = [...data]
  for (const item of dayCopy.analytics) {
    const index = dataCopy.findIndex(d => d.x === item[param])
    if (index >= 0) {
      dataCopy[index].y++
    } else {
      dataCopy.push({
        x: item[param],
        y: 1
      })
    }
  }
  return dataCopy
}

function getViewsBy (param, analytics, sortDirection) {
  let data = []
  for (const day of analytics) {
    data = getViewsByDay(param, day, data)
  }
  return sortByNumber(data, sortDirection, 'y')
}

function getViewsByUser (analytics) {
  return getViewsBy('displayName', analytics, 'desc')
}

function getViewsByUserByDay (dayItems) {
  return getViewsByDay('displayName', dayItems, [])
}

function getViewsByPage (analytics) {
  return getViewsBy('toUrl', analytics, 'desc')
}

export { getDateArray, sortByDate, defaultDateFormat, formatTime, defaultChartColors, getViewsByUser, getViewsByPage, getViewsByUserByDay }
