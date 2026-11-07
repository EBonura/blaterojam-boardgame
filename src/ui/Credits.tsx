import { t } from '../text'

// The two studios behind the game. KUDA's logo is still a placeholder: drop the
// real one at public/brand/kuda-logo.svg (or a .png and change the src).
export function Credits() {
  return (
    <div class="credits">
      <div class="logos">
        <img src="./brand/kuda-logo.svg" alt="KUDA Games" />
        <span class="amp">&amp;</span>
        <img src="./brand/bonnie-studios.png" alt="Bonnie Studios" />
      </div>
      <span>{t('byStudios')}</span>
    </div>
  )
}
