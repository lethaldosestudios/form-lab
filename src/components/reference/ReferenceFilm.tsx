import { useRef, type ChangeEvent } from 'react'

import { PushButton } from '../controls/PushButton'

interface ReferenceFilmProps {
  /** Preview image URL (uploaded silhouette). */
  previewUrl?: string | null
  /** Printed shape code shown on the film, e.g. "SHAPE-042" (handoff §9). */
  shapeCode?: string
  onFile?: (file: File) => void
  onReset?: () => void
}

/**
 * The reference input as a physical transparency/film card (handoff §9). The
 * uploaded silhouette appears as film; INSERT / REPLACE / RESET are explicit
 * and keyboard accessible.
 */
export function ReferenceFilm({ previewUrl, shapeCode = 'SHAPE-000', onFile, onReset }: ReferenceFilmProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile?.(file)
  }

  return (
    <div className="film">
      <div className="film__frame" data-loaded={Boolean(previewUrl) || undefined}>
        <div className="film__window">
          {previewUrl ? (
            <img className="film__image" src={previewUrl} alt="Reference silhouette" />
          ) : (
            <span className="film__placeholder" aria-hidden="true">
              <span className="film__placeholder-shape" />
            </span>
          )}
        </div>
        <div className="film__footer">
          <span className="film__code">REFERENCE FILM</span>
          <span className="film__id">{previewUrl ? shapeCode : 'NO MEDIA'}</span>
        </div>
      </div>

      <div className="film__actions">
        <PushButton size="md" onClick={() => inputRef.current?.click()}>
          {previewUrl ? 'REPLACE' : 'INSERT'}
        </PushButton>
        <PushButton size="md" variant="ghost" onClick={onReset} disabled={!previewUrl}>
          RESET
        </PushButton>
      </div>

      <input
        ref={inputRef}
        className="film__input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        aria-label="Insert reference silhouette"
      />
    </div>
  )
}
