import dayjs from 'dayjs'
export function generateDtesFromYearBeginning(){
    const firstDayTheYear = dayjs().startOf('year')
    const today = new Date()

    const dates = []
    let compareDate = firstDayTheYear

    while(compareDate.isBefore(today)){
        dates.push(compareDate.toDate())
        compareDate = compareDate.add(1,'day')
    }

    return dates
}