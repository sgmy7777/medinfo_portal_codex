const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const EVENT_HANDLER_ATTR_RE = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JS_PROTOCOL_RE = /(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi

export function sanitizeRichTextHtml(value: unknown): string {
  if (typeof value !== 'string') return ''

  return value
    .replace(SCRIPT_TAG_RE, '')
    .replace(EVENT_HANDLER_ATTR_RE, '')
    .replace(JS_PROTOCOL_RE, '$1="#"')
    .trim()
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}