import { readFile, rename, writeFile } from 'node:fs/promises'
import { fetchArchive, fetchHotEntries, issueApiKey } from './lib/fetch-top-data'
import { renderMainContentHtml } from './lib/render-top-page'

async function main() {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) {
    throw new Error('API_BASE_URL environment variable is required')
  }

  console.log('[prerender-top] Issuing API key...')
  const credentials = await issueApiKey(baseUrl)

  console.log('[prerender-top] Fetching archive...')
  const archive = await fetchArchive(baseUrl, credentials, { minUsers: 5 })

  const latestDate = archive.items[0]?.date
  if (!latestDate) {
    throw new Error('No archive items found')
  }
  console.log(`[prerender-top] Latest date: ${latestDate}`)

  const dateYYYYMMDD = latestDate.replace(/-/g, '')
  console.log(`[prerender-top] Fetching hot entries for ${dateYYYYMMDD}...`)
  const entriesResult = await fetchHotEntries(baseUrl, credentials, {
    date: dateYYYYMMDD,
    minUsers: 5,
  })
  console.log(`[prerender-top] Fetched ${entriesResult.entries.length} entries`)

  const template = await readFile('dist/index.html', 'utf-8')

  const mainContentHtml = renderMainContentHtml({
    latestDate,
    entries: entriesResult.entries,
  })

  const html = template.replace('<div id="root"></div>', `<div id="root">${mainContentHtml}</div>`)

  if (html === template) {
    throw new Error('Failed to inject content: <div id="root"></div> not found in template')
  }

  await writeFile('dist/index.top.html.tmp', html, 'utf-8')
  await rename('dist/index.top.html.tmp', 'dist/index.top.html')

  console.log('[prerender-top] Successfully updated dist/index.top.html')
}

main().catch((err) => {
  console.error('[prerender-top] Error:', err)
  process.exit(1)
})
