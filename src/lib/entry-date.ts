import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export class EntryDate {
  private readonly date: Date

  private constructor(date: Date) {
    this.date = date
  }

  static fromYYYYMMDD(dateStr: string): EntryDate {
    if (!/^\d{8}$/.test(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYYMMDD.`)
    }
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`)
    }
    return new EntryDate(date)
  }

  static fromYYYY_MM_DD(dateStr: string): EntryDate {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`)
    }
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`)
    }
    return new EntryDate(date)
  }

  static fromUrlParam(dateStr: string): EntryDate {
    if (/^\d{8}$/.test(dateStr)) {
      return EntryDate.fromYYYYMMDD(dateStr)
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return EntryDate.fromYYYY_MM_DD(dateStr)
    }
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYYMMDD or YYYY-MM-DD.`)
  }

  static fromTimestamp(timestamp: string | number): EntryDate {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: ${timestamp}`)
    }
    return new EntryDate(date)
  }

  static today(): EntryDate {
    return new EntryDate(new Date())
  }

  toYYYYMMDD(): string {
    return format(this.date, 'yyyyMMdd')
  }

  toYYYY_MM_DD(): string {
    return format(this.date, 'yyyy-MM-dd')
  }

  toDisplayString(): string {
    return format(this.date, 'yyyy年M月d日', { locale: ja })
  }

  toSlashSeparated(): string {
    return format(this.date, 'yyyy/MM/dd')
  }

  previousDay(): EntryDate {
    const prev = new Date(this.date)
    prev.setDate(prev.getDate() - 1)
    return new EntryDate(prev)
  }

  nextDay(): EntryDate {
    const next = new Date(this.date)
    next.setDate(next.getDate() + 1)
    return new EntryDate(next)
  }

  isToday(): boolean {
    return this.toYYYY_MM_DD() === EntryDate.today().toYYYY_MM_DD()
  }

  isFuture(): boolean {
    return this.date > new Date()
  }

  toDate(): Date {
    return new Date(this.date)
  }

  getYear(): string {
    return format(this.date, 'yyyy')
  }

  getMonth(): string {
    return format(this.date, 'MM')
  }

  getISOWeek(): number {
    const d = new Date(this.date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
    const week1 = new Date(d.getFullYear(), 0, 4)
    return (
      1 +
      Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
    )
  }

  getISOWeekYear(): number {
    const d = new Date(this.date)
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
    return d.getFullYear()
  }

  subtractWeeks(weeks: number): EntryDate {
    const result = new Date(this.date)
    result.setDate(result.getDate() - weeks * 7)
    return new EntryDate(result)
  }

  subtractYears(years: number): EntryDate {
    const result = new Date(this.date)
    result.setFullYear(result.getFullYear() - years)
    return new EntryDate(result)
  }
}
