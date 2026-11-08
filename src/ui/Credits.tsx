import { t } from '../text'

// The two studios behind the game, with their logos (cream versions for the night sky).
export function Credits() {
  return (
    <div class="credits">
      <div class="logos">
        <img src="./brand/kuda-games.png" alt="KUDA Games" />
        <span class="amp">&amp;</span>
        <img src="./brand/bonnie-studios.png" alt="Bonnie Studios" />
      </div>
      <span>{t('byStudios')}</span>
    </div>
  )
}
