import { useEffect, useRef, type ReactNode } from 'react'

export function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    element?.showModal()
    return () => {
      element?.close()
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])
  return <dialog ref={dialog} className="sheet" aria-labelledby="sheet-title" onCancel={onClose} onClick={event => {
    if (event.target === event.currentTarget) {
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientY < bounds.top || event.clientX < bounds.left || event.clientX > bounds.right) onClose()
    }
  }}>
    <div className="sheet-content">
      <div className="sheet-header"><h2 id="sheet-title">{title}</h2><button type="button" onClick={onClose}>Sluiten</button></div>
      {children}
    </div>
  </dialog>
}
