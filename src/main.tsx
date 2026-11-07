import { render } from 'preact'
import { App } from './ui/App'
import { startHolo } from './ui/holo'
import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import './style.css'
import { startCpuDriver } from './net/cpuDriver'
import { startVoteDriver } from './net/voteDriver'

startCpuDriver()
startVoteDriver()
render(<App />, document.getElementById('app')!)
startHolo()

// Read-only hook for the automated room tests (tools/test-rooms.mjs).
import { roomState, connected, myId, status, dispatch, reconnectNow, netInfo, debugInfo } from './net/session'
import * as rules from './game/rules'
import * as pace from './ui/pace'
import * as cpu from './game/cpu'
;(window as any).__room = { roomState, connected, myId, status, dispatch, rules, cpu, reconnectNow, netInfo, debugInfo, pace }
