export function createHUD() {
  return {
    speedEl:   document.getElementById('hud-speed'),
    lapEl:     document.getElementById('hud-lap'),
    laptimeEl: document.getElementById('hud-laptime'),
    bestEl:    document.getElementById('hud-bestlap'),
    raceEnd:   document.getElementById('race-end'),
    raceEndBest: document.getElementById('race-end-best'),
  }
}

export function updateHUD(hud, { speedKmh, lap, totalLaps, elapsed, bestLap }) {
  hud.speedEl.textContent   = Math.round(speedKmh)
  hud.lapEl.textContent     = `Lap ${Math.min(lap, totalLaps)} / ${totalLaps}`
  hud.laptimeEl.textContent = formatTime(elapsed)
  hud.bestEl.textContent    = bestLap ? `Best: ${formatTime(bestLap)}` : 'Best: --'
}

export function showRaceEnd(hud, bestLap) {
  hud.raceEnd.classList.remove('hidden')
  hud.raceEndBest.textContent = bestLap ? `Best lap: ${formatTime(bestLap)}` : ''
}

function formatTime(ms) {
  const m   = Math.floor(ms / 60000)
  const s   = Math.floor((ms % 60000) / 1000)
  const ms3 = Math.floor(ms % 1000)
  return `${m}:${String(s).padStart(2, '0')}.${String(ms3).padStart(3, '0')}`
}
