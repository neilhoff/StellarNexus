import arc from '@architect/functions'

export const handler = arc.http(async req => {
  return {
    session: {},
    json: { ok: true }
  }
})