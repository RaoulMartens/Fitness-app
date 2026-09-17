import { useEffect, useState } from 'react'

export function useWakeLock(enabled: boolean) {
  const [message, setMessage] = useState('Uit')
  useEffect(() => {
    let disposed = false
    let lock: WakeLockSentinel | null = null
    let requesting = false
    async function update() {
      if (!enabled || document.visibilityState !== 'visible') {
        if (lock) {
          try { await lock.release() } catch { if (!disposed) setMessage('Scherm-aanhouden kon niet worden vrijgegeven.') }
          lock = null
        }
        if (!enabled && !disposed) setMessage('Uit')
        return
      }
      if (lock || requesting || disposed) return
      if (!('wakeLock' in navigator)) { setMessage('Scherm aanhouden wordt niet ondersteund. Houd zelf je scherm actief.'); return }
      requesting = true
      try {
        const requested = await navigator.wakeLock.request('screen')
        if (disposed || document.visibilityState !== 'visible') { await requested.release(); return }
        lock = requested
        setMessage('Scherm blijft aan zolang dit verzoek actief is.')
        requested.addEventListener('release', () => {
          if (lock === requested) { lock = null; if (!disposed) setMessage('Scherm-aanhouden is gestopt. Houd zelf je scherm actief.') }
        })
      } catch { if (!disposed) setMessage('Scherm aanhouden lukt niet. Houd zelf je scherm actief.') }
      finally { requesting = false }
    }
    void update()
    document.addEventListener('visibilitychange', update)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', update)
      if (lock) void lock.release().catch(cause => console.warn('Scherm-aanhouden kon niet worden vrijgegeven.', cause))
    }
  }, [enabled])
  return message
}
