import { mkdir, readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { parseBuffer } from 'music-metadata'
import { isAdmin } from '../../../lib/admin-auth'

const dataPath = path.join(process.cwd(), 'data', 'library.json')
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const validType = (type) => ['music', 'arts', 'games'].includes(type)
const safeName = (name) => `${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
async function readLibrary() { return JSON.parse(await readFile(dataPath, 'utf8')) }
async function saveLibrary(library) { await writeFile(dataPath, JSON.stringify(library, null, 2)) }
async function saveUpload(file, type) { const folder = path.join(process.cwd(), 'public', 'uploads', type); await mkdir(folder, { recursive: true }); const filename = safeName(file.name); await writeFile(path.join(folder, filename), Buffer.from(await file.arrayBuffer())); return `/uploads/${type}/${filename}` }
async function saveCover(file) { return saveUpload(file, 'covers') }
async function saveCoverBytes(bytes, mime) { const folder = path.join(process.cwd(), 'public', 'uploads', 'covers'); await mkdir(folder, { recursive: true }); const extension = mime?.split('/')[1] || 'jpg'; const filename = safeName(`embedded-cover.${extension}`); await writeFile(path.join(folder, filename), bytes); return `/uploads/covers/${filename}` }
async function embeddedCover(audio) { try { const buffer = Buffer.from(await audio.arrayBuffer()); const metadata = await parseBuffer(buffer, audio.type || 'audio/mpeg'); const picture = metadata.common.picture?.[0]; return picture ? saveCoverBytes(picture.data, picture.format) : null } catch { return null } }
async function removeUpload(file) { if (file?.startsWith('/uploads/')) await unlink(path.join(process.cwd(), 'public', file)).catch(() => {}) }

export async function GET() { return Response.json(await readLibrary(), { headers: { 'Cache-Control': 'no-store, max-age=0' } }) }

export async function POST(request) {
  if (!isAdmin(request)) return Response.json({ message: 'Admin sign-in required.' }, { status: 401 })
  const form = await request.formData(); const type = form.get('type'); const title = form.get('title')?.toString().trim(); const detail = form.get('detail')?.toString().trim(); const url = form.get('url')?.toString().trim(); const file = form.get('file'); const coverFile = form.get('cover'); const useEmbedded = form.get('useEmbeddedCover') === 'on'; const published = form.get('published') !== 'draft'; const order = Number(form.get('order'))
  if (!validType(type) || !title) return Response.json({ message: 'Choose a content type and title.' }, { status: 400 })
  const library = await readLibrary()
  if (type === 'games') { if (!url) return Response.json({ message: 'Add a Scratch link for the game.' }, { status: 400 }); library.games.push({ title, description: detail || 'New Scratch project', url, published, order: Number.isFinite(order) ? order : library.games.length + 1 }) }
  else { if (!file || typeof file === 'string' || !file.size) return Response.json({ message: 'Choose a file to upload.' }, { status: 400 }); const filePath = await saveUpload(file, type); let cover = null; if (type === 'music') { if (coverFile && typeof coverFile !== 'string' && coverFile.size) cover = await saveCover(coverFile); else if (useEmbedded) cover = await embeddedCover(file) } library[type].push(type === 'music' ? { title, category: detail || 'Original', file: filePath, cover, published, order: Number.isFinite(order) ? order : library.music.length + 1 } : { title, artist: detail || 'Candlelight Studio', file: filePath, published, order: Number.isFinite(order) ? order : library.arts.length + 1 }) }
  await saveLibrary(library); return Response.json({ message: 'Published. Your collection is ready to refresh.' })
}

export async function PATCH(request) {
  if (!isAdmin(request)) return Response.json({ message: 'Admin sign-in required.' }, { status: 401 })
  const form = await request.formData(); const type = form.get('type'); const index = Number(form.get('index')); const title = form.get('title')?.toString().trim(); const detail = form.get('detail')?.toString().trim(); const url = form.get('url')?.toString().trim(); const replacement = form.get('file'); const coverFile = form.get('cover'); const useEmbedded = form.get('useEmbeddedCover') === 'on'; const published = form.get('published') !== 'draft'; const order = Number(form.get('order'))
  if (!validType(type) || !Number.isInteger(index)) return Response.json({ message: 'Invalid item.' }, { status: 400 })
  const library = await readLibrary(); const item = library[type]?.[index]
  if (!item) return Response.json({ message: 'Item not found.' }, { status: 404 })
  item.title = title || item.title
  item.published = published
  item.order = Number.isFinite(order) ? order : item.order
  if (type === 'music') item.category = detail || item.category
  if (type === 'arts') item.artist = detail || item.artist
  if (type === 'games') { item.description = detail || item.description; item.url = url || item.url }
  if (type !== 'games' && replacement && typeof replacement !== 'string' && replacement.size) { const old = item.file; item.file = await saveUpload(replacement, type); await removeUpload(old) }
  if (type === 'music') { if (coverFile && typeof coverFile !== 'string' && coverFile.size) { const old = item.cover; item.cover = await saveCover(coverFile); await removeUpload(old) } else if (useEmbedded && replacement && typeof replacement !== 'string' && replacement.size) { const old = item.cover; item.cover = await embeddedCover(replacement); await removeUpload(old) } }
  await saveLibrary(library); return Response.json({ message: 'Changes saved.' })
}

export async function DELETE(request) {
  if (!isAdmin(request)) return Response.json({ message: 'Admin sign-in required.' }, { status: 401 })
  const { type, index } = await request.json(); if (!validType(type) || !Number.isInteger(index)) return Response.json({ message: 'Invalid item.' }, { status: 400 })
  const library = await readLibrary(); const item = library[type]?.[index]; if (!item) return Response.json({ message: 'Item not found.' }, { status: 404 })
  library[type].splice(index, 1); await removeUpload(item.file); await removeUpload(item.cover); await saveLibrary(library); return Response.json({ message: 'Item deleted.' })
}
