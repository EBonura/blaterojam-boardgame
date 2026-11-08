import { muted, toggleMute } from './sound'

/** Sound on or off, remembered on this device. A pixel speaker, with waves when on. */
export function MuteButton() {
  const off = muted.value
  return (
    <button type="button" class={`mute corner-btn ${off ? 'off' : ''}`} onClick={toggleMute}
      aria-pressed={off} aria-label={off ? 'Attiva i suoni' : 'Togli i suoni'} title={off ? 'Attiva i suoni' : 'Togli i suoni'}>
      <svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true">
        <path d="M1 6h3l4-3v10l-4-3H1z" fill="currentColor" />
        {off ? (
          <path d="M10 5h1v1h1v1h1V6h1V5h1v1h-1v1h-1v1h1v1h1v1h-1V9h-1V8h-1v1h-1v1h-1V9h1V8h1V7h-1V6h-1z" fill="currentColor" />
        ) : (
          <path d="M10 6h1v4h-1zM12 4h1v1h1v6h-1v1h-1v-1h1V5h-1z" fill="currentColor" />
        )}
      </svg>
    </button>
  )
}
