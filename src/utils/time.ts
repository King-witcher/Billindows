export namespace DBTime {
  export function getMonthByDate(date: Date): number {
    return (date.getFullYear() - 1970) * 12 + date.getMonth()
  }

  export function getMonthByYearAndMonth(year: number, month: number): number {
    return (year - 1970) * 12 + month
  }
}
