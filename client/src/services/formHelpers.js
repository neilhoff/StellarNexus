import { date } from 'quasar'

export const formHelpers = {
  defaultDateParams: {
    dateStart: date.formatDate(new Date(), 'MM/DD/YYYY'),
    dateEnd: date.formatDate(new Date(), 'MM/DD/YYYY')
  },
  getFormattedDate (year, monthNumber, day) {
    const jsMonth = monthNumber - 1
    return date.formatDate(new Date(year, jsMonth, day), 'MM/DD/YYYY')
  }

}
