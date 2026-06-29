import * as THREE from 'three'

export function createAI(carState, curve, curveLength, startT, targetSpeed) {
  // Place car at start t
  const pos     = curve.getPoint(startT)
  const tangent = curve.getTangent(startT).normalize()

  carState.position.copy(pos)
  carState.heading = Math.atan2(tangent.x, tangent.z)
  carState.speed   = targetSpeed * 0.6

  return { carState, curve, curveLength, t: startT, targetSpeed, LOOKAHEAD: 0.016 }
}

export function updateAI(ai, delta) {
  const { carState, curve, curveLength, targetSpeed } = ai

  // Current point and lookahead
  const lookaheadT  = (ai.t + ai.LOOKAHEAD) % 1
  const targetPos   = curve.getPoint(lookaheadT)

  // Direction from current car pos to lookahead
  const toTarget    = targetPos.clone().sub(carState.position)
  const desiredHead = Math.atan2(toTarget.x, toTarget.z)

  // Heading error
  let err = desiredHead - carState.heading
  while (err >  Math.PI) err -= 2 * Math.PI
  while (err < -Math.PI) err += 2 * Math.PI

  carState.steerAngle = THREE.MathUtils.clamp(err * 1.8, -0.42, 0.42)

  // Curvature-based speed
  const curv       = computeCurvature(curve, ai.t)
  const cornerSpd  = Math.max(28, targetSpeed - curv * 350)
  const spd        = carState.speed

  if (spd > cornerSpd) carState.speed -= 28 * delta
  else                  carState.speed += 18 * delta
  carState.speed = THREE.MathUtils.clamp(carState.speed, 0, targetSpeed)

  // Advance t
  ai.t = (ai.t + (carState.speed * delta) / curveLength) % 1

  // Apply bicycle model (simplified — set position directly from t with heading from steer)
  const newPos  = curve.getPoint(ai.t)
  const newTan  = curve.getTangent(ai.t).normalize()
  carState.position.copy(newPos)
  carState.heading = Math.atan2(newTan.x, newTan.z)
}

function computeCurvature(curve, t) {
  const p0 = curve.getPoint(Math.max(0, t - 0.005))
  const p1 = curve.getPoint(t)
  const p2 = curve.getPoint((t + 0.005) % 1)
  const v1 = p1.clone().sub(p0).normalize()
  const v2 = p2.clone().sub(p1).normalize()
  return new THREE.Vector3().crossVectors(v1, v2).length()
}
