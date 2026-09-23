import { useState } from 'react'

/**
 * De uitlegvideo van een oefening, over de volle breedte. Speelt pas na een tik en
 * zonder geluid: in de sportschool wil je niet dat je telefoon opeens praat.
 */
export function Video({ url }: { url?: string }) {
  const [speelt, setSpeelt] = useState(false)
  if (!url) return <div className="video" aria-label="Nog geen video" />
  if (!speelt) return <button className="video" onClick={() => setSpeelt(true)} aria-label="Video afspelen" />
  return <div className="video speelt"><video src={url} autoPlay muted playsInline controls crossOrigin="anonymous" /></div>
}
