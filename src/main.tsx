import { render } from 'preact'
import { App } from './ui/App'
import './style.css'

render(<App />, document.getElementById('app')!)

// Read-only hook for the automated room tests (tools/test-rooms.mjs).
import { roomState, connected, myId, status } from './net/session'
;(window as any).__room = { roomState, connected, myId, status }
