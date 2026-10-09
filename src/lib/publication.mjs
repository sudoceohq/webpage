export function isPublished(data, now = new Date()) {
  return data.status === 'published'
    && Boolean(data.reviewedBy?.trim())
    && Boolean(data.reviewedAt)
    && new Date(data.reviewedAt).getTime() <= now.getTime()
    && new Date(data.pubDate).getTime() <= now.getTime();
}
