export function getPreUrl(url: string) {
  return `/${url.split('.')?.[0]?.split('/')?.pop()}`
}
