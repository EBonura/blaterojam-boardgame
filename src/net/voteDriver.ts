// Closes the vote for the videogame. Only the host does it, as soon as every connected
// person has confirmed, so someone dropping out mid-vote doesn't hold up the table.
import { effect } from '@preact/signals'
import { roomState, amHost, connected, myId, dispatch } from './session'
import { voteClosed } from '../room/state'

export function startVoteDriver() {
  effect(() => {
    const s = roomState.value
    if (s?.phase === 'voting' && amHost.value && voteClosed(s, connected.value)) dispatch({ type: 'tally', id: myId.value })
  })
}
