import { describe, expect, it } from 'vitest'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { exercises } from './exercises'

describe('oefenvideos', () => {
  it('gebruikt voor elke gekoppelde video een bestaand lokaal mp4-bestand', () => {
    const urls = exercises.flatMap(exercise => exercise.videoUrl ? [exercise.videoUrl] : [])
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      const base = `${import.meta.env.BASE_URL}video/`
      expect(url.startsWith(base)).toBe(true)
      const filename = url.slice(base.length)
      expect(filename).toMatch(/^[A-Za-z0-9_-]{11}\.mp4$/)
      expect(statSync(join(process.cwd(), 'public/video', filename)).size).toBeGreaterThan(0)
    }
  })
})
