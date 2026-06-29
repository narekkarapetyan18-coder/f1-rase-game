import * as THREE from 'three'
import { initScene }                       from './scene.js'
import { buildTrack, TRACK_WIDTH }         from './track.js'
import { createCar }                       from './car.js'
import { updatePhysics }                   from './physics.js'
import { updateCamera }                    from './camera.js'
import { createInput }                     from './input.js'
import { createAI, updateAI }              from './ai.js'
import { createLapTracker, updateLapTracker } from './lap.js'
import { createHUD, updateHUD, showRaceEnd }  from './hud.js'

const TOTAL_LAPS = 3

// ---- Init ----
const { scene, renderer, camera } = initScene()
const { curve, checkpoints, curveLength, pathPoints } = buildTrack(scene)

// Player car — F1 red, starts at curve t=0
const player  = createCar(scene, 0xe10600)
const startPos = curve.getPoint(0)
const startTan = curve.getTangent(0).normalize()
player.state.position.set(startPos.x, 0, startPos.z)
player.state.heading = Math.atan2(startTan.x, startTan.z)
player.group.position.copy(player.state.position)
player.group.rotation.y = player.state.heading

// AI cars
const aiCar1  = createCar(scene, 0x00d2be)  // Mercedes teal
const aiCar2  = createCar(scene, 0xff8000)  // McLaren orange
const ai1     = createAI(aiCar1.state, curve, curveLength, 0.33, 52)
const ai2     = createAI(aiCar2.state, curve, curveLength, 0.66, 56)

const input      = createInput()
const lapTracker = createLapTracker(checkpoints)
const hud        = createHUD()

let raceOver = false

// ---- Resize ----
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ---- Loop ----
const clock = new THREE.Clock()

function loop() {
  requestAnimationFrame(loop)
  const delta = Math.min(clock.getDelta(), 0.05)
  const now   = performance.now()

  if (!raceOver) {
    // Player
    updatePhysics(player.state, input.keys, delta)
    player.group.position.copy(player.state.position)
    player.group.rotation.y = player.state.heading

    // Spin wheels proportional to speed
    const wheelRot = (player.state.speed / 0.33) * delta
    player.wheels.forEach(w => { w.rotation.x += wheelRot })

    // AI
    updateAI(ai1, delta)
    aiCar1.group.position.copy(aiCar1.state.position)
    aiCar1.group.rotation.y = aiCar1.state.heading

    updateAI(ai2, delta)
    aiCar2.group.position.copy(aiCar2.state.position)
    aiCar2.group.rotation.y = aiCar2.state.heading

    // Off-track detection (simple: find nearest path point, check distance)
    player.state.onTrack = isOnTrack(player.state.position, pathPoints)

    // Lap tracking
    const evt = updateLapTracker(lapTracker, player.state.position, now)
    if (evt?.type === 'lap_complete' && lapTracker.currentLap > TOTAL_LAPS) {
      raceOver = true
      const best = lapTracker.lapTimes.length ? Math.min(...lapTracker.lapTimes) : null
      showRaceEnd(hud, best)
    }
  }

  // Camera and HUD always update
  updateCamera(camera, player.group, player.state, delta)

  const elapsed = raceOver ? 0 : now - lapTracker.lapStartTime
  const best    = lapTracker.lapTimes.length ? Math.min(...lapTracker.lapTimes) : null
  updateHUD(hud, {
    speedKmh: player.state.speed * 3.6,
    lap:      lapTracker.currentLap,
    totalLaps: TOTAL_LAPS,
    elapsed,
    bestLap: best,
  })

  renderer.render(scene, camera)
}

loop()

// ---- Helpers ----
function isOnTrack(pos, pts) {
  let minDist = Infinity
  for (const p of pts) {
    const dx = pos.x - p.x
    const dz = pos.z - p.z
    const d  = dx * dx + dz * dz
    if (d < minDist) minDist = d
  }
  return Math.sqrt(minDist) < TRACK_WIDTH / 2 + 1.5
}
