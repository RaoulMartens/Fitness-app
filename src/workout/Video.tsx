import { useState } from 'react'

/**
 * De uitlegvideo van een oefening, over de volle breedte. Speelt pas na een tik en
 * zonder geluid: in de sportschool wil je niet dat je telefoon opeens praat.
 */
export function Video({ url }: { url?: string }) {
  const [speelt, setSpeelt] = useState(false)
  if (!url) return <div className="video" aria-label="Nog geen video" />
  if (!speelt) return <button className="video" onClick={() => setSpeelt(true)} aria-label="Video afspelen" />
  if (url.endsWith('.mp4')) {
    return <div className="video speelt"><video src={url} autoPlay muted playsInline controls /></div>
  }
  return (
    <div className="video speelt">
      <iframe src={`${url}${url.includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1`}
        title="Uitvoering" allow="autoplay; encrypted-media" />
    </div>
  )
}
