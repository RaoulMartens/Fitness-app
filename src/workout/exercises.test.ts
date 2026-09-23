import { describe, expect, it } from 'vitest'
import { exercises } from './exercises'

describe('oefenvideos', () => {
  it('gebruikt voor elke gekoppelde video alleen een youtube-nocookie embed met optionele starttijd', () => {
    const urls = exercises.flatMap(exercise => exercise.videoUrl ? [exercise.videoUrl] : [])
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}(?:\?start=\d+)?$/)
    }
  })
})
