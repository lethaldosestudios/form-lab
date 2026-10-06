import { useRef, type ChangeEvent } from 'react'

/** Input assembly only; uploaded geometry and status are displayed on the CRT. */
export function ReferenceFilm({
  previewUrl,
  onFile,
  onReset,
  disabled = false,
}: {
  previewUrl?: string | null
  onFile?: (file: File) => void
  onReset?: () => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFile?.(file)
    event.target.value = ''
  }
  return (
    <section className="reference-input" aria-label="Reference input">
      <h2 className="browse-controls__label">REFERENCE INPUT</h2>
      <div className="reference-input__keys">
        <button
          type="button"
          className="frosted-key"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          INSERT
        </button>
        <button
          type="button"
          className="frosted-key"
          disabled={disabled || !previewUrl}
          onClick={onReset}
        >
          RESET
        </button>
      </div>
      <input
        ref={inputRef}
        className="film__input"
        type="file"
        tabIndex={-1}
        accept="image/*"
        disabled={disabled}
        onChange={handleChange}
        aria-label="Insert reference silhouette"
      />
    </section>
  )
}
