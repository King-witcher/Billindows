export namespace DBTime {
  export function fromDateToDB(date: Date): number {
    return (date.getFullYear() - 1970) * 12 + date.getMonth()
  }

  export function fromYMToDB(year: number, month: number): number {
    return (year - 1970) * 12 + month
  }

  export function fromDBToYM(dbMonth: number): [number, number] {
    const month = dbMonth % 12
    const year = 1970 + (dbMonth - month) / 12
    return [year, month]
  }
}
