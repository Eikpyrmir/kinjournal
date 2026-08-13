const CONFIG_KEY = 'kinjournal.nextcloud.v1'
const LAST_BACKUP_KEY = 'kinjournal.lastBackup.v1'
const BACKUP_FILE_NAME = 'kinjournal-backup.json'
const REQUEST_TIMEOUT_MS = 15000

export interface NextcloudConfig {
  url: string
  username: string
  appPassword: string
  enabled: boolean
}

export interface LastBackupInfo {
  date: string
  at: number
}

export class WebdavError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

export function loadNextcloudConfig(): NextcloudConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const o = parsed as Record<string, unknown>
    if (
      typeof o.url === 'string' &&
      typeof o.username === 'string' &&
      typeof o.appPassword === 'string'
    ) {
      return {
        url: o.url,
        username: o.username,
        appPassword: o.appPassword,
        enabled: o.enabled === true,
      }
    }
    return null
  } catch {
    return null
  }
}

export function saveNextcloudConfig(config: NextcloudConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

export function loadLastBackup(): LastBackupInfo | null {
  try {
    const raw = localStorage.getItem(LAST_BACKUP_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const o = parsed as Record<string, unknown>
    if (typeof o.date === 'string' && typeof o.at === 'number') {
      return { date: o.date, at: o.at }
    }
    return null
  } catch {
    return null
  }
}

export function saveLastBackup(info: LastBackupInfo): void {
  localStorage.setItem(LAST_BACKUP_KEY, JSON.stringify(info))
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function authHeader(config: NextcloudConfig): string {
  const bytes = new TextEncoder().encode(`${config.username}:${config.appPassword}`)
  let bin = ''
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return `Basic ${btoa(bin)}`
}

function davBase(config: NextcloudConfig): string {
  return `${normalizeBaseUrl(config.url)}/remote.php/dav/files/${encodeURIComponent(config.username)}`
}

async function request(input: RequestInfo, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch {
    throw new WebdavError('ネットワークエラーが発生しました')
  } finally {
    clearTimeout(timer)
  }
}

export async function testConnection(config: NextcloudConfig): Promise<void> {
  const res = await request(`${davBase(config)}/`, {
    method: 'PROPFIND',
    headers: { Authorization: authHeader(config), Depth: '0' },
  })
  if (res.status === 401 || res.status === 403) {
    throw new WebdavError('認証に失敗しました。ユーザー名とアプリパスワードを確認してください', res.status)
  }
  if (!res.ok) throw new WebdavError('接続に失敗しました。URLを確認してください', res.status)
}

export async function backupToWebdav(config: NextcloudConfig, payload: string): Promise<void> {
  const res = await request(`${davBase(config)}/${BACKUP_FILE_NAME}`, {
    method: 'PUT',
    headers: { Authorization: authHeader(config), 'Content-Type': 'application/json' },
    body: payload,
  })
  if (res.status === 401 || res.status === 403) {
    throw new WebdavError('認証に失敗しました。ユーザー名とアプリパスワードを確認してください', res.status)
  }
  if (res.status !== 201 && res.status !== 204 && !res.ok) {
    throw new WebdavError('バックアップに失敗しました', res.status)
  }
}
