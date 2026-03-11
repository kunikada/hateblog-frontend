import type { ApiEntry } from './fetch-top-data'

type RenderMainContentParams = {
  latestDate: string // YYYY-MM-DD
  entries: ApiEntry[]
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

function previousDay(dateStr: string): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

function toYYYYMMDD(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getHatenaBookmarkUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const pathWithQuery = parsed.pathname + parsed.search + parsed.hash
    if (parsed.protocol === 'https:') {
      return `https://b.hatena.ne.jp/entry/s/${parsed.host}${pathWithQuery}`
    }
    return `https://b.hatena.ne.jp/entry/${parsed.host}${pathWithQuery}`
  } catch {
    return '#'
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function renderEntryCard(entry: ApiEntry): string {
  const domain = getDomain(entry.url)
  const hatenaUrl = getHatenaBookmarkUrl(entry.url)

  // posted_at から表示日付
  const postedDate = entry.posted_at ? new Date(entry.posted_at) : null
  const formattedPostedDate = postedDate
    ? `${postedDate.getFullYear()}/${String(postedDate.getMonth() + 1).padStart(2, '0')}/${String(postedDate.getDate()).padStart(2, '0')}`
    : ''

  const excerptHtml = entry.excerpt
    ? `<p class="text-sm text-muted-foreground line-clamp-2">${escapeHtml(entry.excerpt)}</p>`
    : ''

  const TAG_MIN_SCORE = 60
  const TAG_MAX_COUNT = 6
  const TAG_MAX_WORDS = 3
  const validTags = entry.tags
    .filter((tag) => {
      if (tag.score < TAG_MIN_SCORE) return false
      const words = tag.tag_name.split(' ')
      if (words.length > TAG_MAX_WORDS) return false
      const isAlphanumeric = /^[a-zA-Z0-9 ]+$/.test(tag.tag_name)
      return isAlphanumeric
        ? tag.tag_name.replace(/ /g, '').length >= 3
        : tag.tag_name.length >= 2
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TAG_MAX_COUNT)

  const tagsHtml =
    validTags.length > 0
      ? `<div class="flex flex-wrap gap-0.5">${validTags
          .map(
            (tag) =>
              `<a href="/tags/${encodeURIComponent(tag.tag_name)}" class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground border-border hover:bg-hatebu-500 hover:text-white hover:border-transparent">${escapeHtml(tag.tag_name)}</a>`,
          )
          .join('')}</div>`
      : ''

  return `<article class="group relative rounded-lg border bg-card p-3 hover:shadow-md transition-shadow">
  <div class="flex flex-col gap-2">
    <h3 class="font-semibold text-base leading-tight">
      <a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" class="hover:text-hatebu-500 transition-colors flex items-start gap-2">
        <img src="${escapeHtml(entry.favicon_url || '')}" alt="" class="h-4 w-4 rounded-sm shrink-0 translate-y-0.5" loading="lazy" />
        <span class="flex-1">${escapeHtml(entry.title)}</span>
      </a>
    </h3>
    ${excerptHtml}
    ${tagsHtml}
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <a href="${escapeHtml(hatenaUrl)}" target="_blank" rel="noopener noreferrer" class="font-medium text-hatebu-500 hover:underline">${entry.bookmark_count.toLocaleString()} users</a>
        <a href="/search?q=${encodeURIComponent(domain)}" class="font-medium hover:underline">${escapeHtml(domain)}</a>
        <span class="flex items-center gap-1">${escapeHtml(formattedPostedDate)}</span>
      </div>
    </div>
  </div>
</article>`
}

export function renderMainContentHtml(params: RenderMainContentParams): string {
  const { latestDate, entries } = params

  const displayDate = formatDate(latestDate)
  const dateYYYYMMDD = toYYYYMMDD(latestDate)
  const prevDate = previousDay(latestDate)
  const prevDateYYYYMMDD = toYYYYMMDD(prevDate)
  const prevDisplayDate = formatDate(prevDate)

  const entryCardsHtml = entries
    .map((entry) => `<li>${renderEntryCard(entry)}</li>`)
    .join('\n')

  const entryCountHtml =
    entries.length > 0
      ? `<div class="text-sm text-muted-foreground mb-4">${entries.length.toLocaleString()}件のエントリー</div>`
      : ''

  return `<div class="flex flex-col lg:flex-row gap-6">
  <!-- Main Column -->
  <div class="flex-1">
    <!-- Page Title and Date Navigation -->
    <div class="mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
        <h2 class="text-2xl font-bold">${escapeHtml(displayDate)}の人気エントリー</h2>
        <div class="ml-auto">
          <div class="flex items-center gap-2">
            <a href="/entries/${prevDateYYYYMMDD}/hot" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border bg-card text-gray-600 border-gray-300 h-9 px-4 py-2">
              &lt; ${escapeHtml(prevDisplayDate)}
            </a>
            <button disabled class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border bg-card text-gray-600 border-gray-300 h-9 px-4 py-2 opacity-50 cursor-not-allowed">
              ${escapeHtml(displayDate)} &gt;
            </button>
          </div>
        </div>
      </div>
      <!-- Filter Bar placeholder (activated by client JS) -->
      <div id="filter-bar-placeholder" class="flex flex-wrap gap-2 items-start">
        <span class="text-sm text-gray-400 pt-1.5">フィルター:</span>
        <div class="flex flex-wrap gap-2 flex-1 min-w-0">
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-hatebu-500 text-white h-9 px-4 py-2">5+ users</span>
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-card text-gray-600 border border-gray-300 h-9 px-4 py-2">10+ users</span>
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-card text-gray-600 border border-gray-300 h-9 px-4 py-2">50+ users</span>
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-card text-gray-600 border border-gray-300 h-9 px-4 py-2">100+ users</span>
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-card text-gray-600 border border-gray-300 h-9 px-4 py-2">500+ users</span>
          <span class="inline-flex items-center justify-center rounded-md text-sm font-medium min-w-28 bg-card text-gray-600 border border-gray-300 h-9 px-4 py-2">1000+ users</span>
        </div>
      </div>
    </div>
    ${entryCountHtml}
    <!-- Entry Cards -->
    <ul class="space-y-4" data-prerendered-date="${escapeHtml(dateYYYYMMDD)}">
      ${entryCardsHtml}
    </ul>
  </div>
  <!-- Sidebar placeholder (rendered by client JS) -->
  <aside class="hidden lg:block w-80 space-y-6" id="sidebar-placeholder"></aside>
</div>`
}
