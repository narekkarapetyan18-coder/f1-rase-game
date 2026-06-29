import * as THREE from 'three'

const MAX_SPEED   = 83.3   // m/s  ~300 km/h
const ACCEL       = 28
const BRAKE       = 45
const DRAG        = 0.014
const MAX_STEER   = 0.42   // rad
const STEER_RATE  = 2.6    // rad/s
const GRIP        = 0.90   // 1=no drift, 0=full drift

export function updatePhysics(state, keys, delta) {
  // --- Steering ---
  if (keys.left)       state.steerAngle += STEER_RATE * delta
  else if (keys.right) state.steerAngle -= STEER_RATE * delta
  else                 state.steerAngle *= Math.max(0, 1 - 8 * delta)

  state.steerAngle = THREE.MathUtils.clamp(state.steerAngle, -MAX_STEER, MAX_STEER)

  // --- Throttle / Brake ---
  if (keys.forward)  state.speed += ACCEL * delta
  if (keys.back)     state.speed -= BRAKE * delta
  // Quadratic drag
  state.speed -= state.speed * DRAG * Math.abs(state.speed) * delta
  // Off-track friction
  if (!state.onTrack) state.speed *= Math.pow(0.97, delta * 60)

  state.speed = THREE.MathUtils.clamp(state.speed, 0, MAX_SPEED)

  if (state.speed < 0.01) return

  // --- Bicycle model ---
  const wb    = state.wheelBase
  const h     = state.heading
  const steer = state.steerAngle
  const dt    = delta

  // Rear axle centre
  let rx = state.position.x - (wb / 2) * Math.sin(h)
  let rz = state.position.z - (wb / 2) * Math.cos(h)

  // Advance rear axle
  rx += Math.sin(h) * state.speed * dt
  rz += Math.cos(h) * state.speed * dt

  // Front axle centre
  let fx = state.position.x + (wb / 2) * Math.sin(h)
  let fz = state.position.z + (wb / 2) * Math.cos(h)

  // Advance front axle (steered)
  const fh = h + steer
  fx += Math.sin(fh) * state.speed * dt
  fz += Math.cos(fh) * state.speed * dt

  // New heading
  const newHeading = Math.atan2(fx - rx, fz - rz)

  // Drift blend
  const blended = lerpAngle(h, newHeading, GRIP)

  state.heading = blended
  state.position.x = (rx + fx) / 2
  state.position.z = (rz + fz) / 2
}

function lerpAngle(a, b, t) {
  let diff = b - a
  while (diff >  Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return a + diff * t
}
