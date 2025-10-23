import { addDays, subDays, format } from 'date-fns'

function formatDateString (val, formatStr, options = {}) {
  // format: 'https://date-fns.org/v4.1.0/docs/format example: M/dd/yyyy',
  // Options object:
  // {
  //   subDays: 'Number to subtract by',
  //   addDays: 'Number to add to'
  // }
  const initialValue = options.subDays ?
    subDays(val, options.subDays) :
    options.addDays ?
      addDays(val, options.addDays) :
      val
  const formattedVal = format(initialValue, formatStr)

  return formattedVal
}

export { formatDateString }