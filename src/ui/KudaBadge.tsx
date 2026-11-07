import { t } from '../i18n'

// KUDA Games credit. Drop their real logo at public/brand/kuda-logo.svg (or .png
// and change the src); the current file is a text placeholder.
export function KudaBadge({ large = false }: { large?: boolean }) {
  return (
    <div class={`kuda ${large ? 'large' : ''}`}>
      <img src="./brand/kuda-logo.svg" alt="KUDA Games" />
      <span>{t('byKuda')}</span>
    </div>
  )
}
