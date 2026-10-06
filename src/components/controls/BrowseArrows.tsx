interface BrowseArrowsProps {
  label: string
  previousDisabled: boolean
  nextDisabled: boolean
  onPrevious: () => void
  onNext: () => void
}

/** Fixed legends, momentary keys: feedback lives on the CRT. */
export function BrowseArrows({
  label,
  previousDisabled,
  nextDisabled,
  onPrevious,
  onNext,
}: BrowseArrowsProps) {
  return (
    <div className="browse-controls">
      <span className="browse-controls__label">{label}</span>
      <div className="browse-controls__keys" role="group" aria-label={label}>
        <button
          type="button"
          className="frosted-key"
          aria-label={`Previous ${label.toLowerCase()}`}
          disabled={previousDisabled}
          onClick={onPrevious}
        >
          <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
            <path d="M3 13L10 6L17 13" />
          </svg>
        </button>
        <button
          type="button"
          className="frosted-key"
          aria-label={`Next ${label.toLowerCase()}`}
          disabled={nextDisabled}
          onClick={onNext}
        >
          <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
            <path d="M3 9L10 16L17 9" />
          </svg>
        </button>
      </div>
    </div>
  )
}
