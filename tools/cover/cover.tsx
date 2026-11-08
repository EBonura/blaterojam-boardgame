// The itch.io cover (630x500): the title over a fan of real game cards, the BLATERO card in the middle.
// Rendered by tools/shot-itch.mjs with the game's own components and styles.
import { render } from 'preact'
import { Card } from '../../src/ui/Card'
import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import '../../src/style.css'
import '../../src/ui/game.css'
import './cover.css'

const FAN: { card: string; kind?: 'play' | 'imprevisto' }[] = [
  { card: 'grafico#1' },
  { card: 'crash-improvviso', kind: 'imprevisto' },
  { card: 'spaghetti-code#1' },
  { card: 'brainstorming#1' },
]

function Cover() {
  return (
    <main class="cover">
      <h1>
        {'BLATERO'.split('').map((ch, i) => <span class={`c${(i % 4) + 1}`}>{ch}</span>)}
      </h1>
      <p class="sub">Il gioco da tavolo della game jam</p>
      <div class="fan">
        {FAN.map((c, i) => (
          <div class={`slot s${i}`}>
            <Card card={c.card} kind={c.kind} />
          </div>
        ))}
        <div class="slot hero-slot">
          <div class="hero-card card f-arcobaleno">
            <div class="card-in">
              <img class="card-art" src="./cards/art/blatero.svg" alt="" />
            </div>
          </div>
        </div>
      </div>
      <p class="by">KUDA Games &amp; Bonnie Studios</p>
    </main>
  )
}

render(<Cover />, document.getElementById('cover')!)
