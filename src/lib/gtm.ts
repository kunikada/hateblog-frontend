import TagManager from 'react-gtm-module'
import { config } from '@/lib/config'

export function initializeGtm(): void {
  if (!config.gtm.id) return
  TagManager.initialize({ gtmId: config.gtm.id })
}

type PageViewEvent = {
  event: 'page_view'
  page_path: string
}

type SelectContentEvent = {
  event: 'select_content'
  content_type: 'entry'
  entry_id: string
  entry_title: string
  entry_url: string
}

type ShareEvent = {
  event: 'share'
  method: string
  entry_id: string
}

type SearchEvent = {
  event: 'search'
  search_term: string
}

type FilterChangeEvent = {
  event: 'filter_change'
  filter_value: number
}

type GtmEvent = PageViewEvent | SelectContentEvent | ShareEvent | SearchEvent | FilterChangeEvent

export function pushEvent(data: GtmEvent): void {
  if (!config.gtm.id) return
  TagManager.dataLayer({ dataLayer: data })
}
