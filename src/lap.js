import * as THREE from 'three'

export function createLapTracker(checkpoints) {
  return {
    checkpoints,
    nextCheckpoint: 0,
    currentLap:     1,
    lapStartTime:   performance.now(),
    lapTimes:       [],
    finished:       false,
  }
}

export function updateLapTracker(tracker, carPos, now) {
  if (tracker.finished) return null

  const cp  = tracker.checkpoints[tracker.nextCheckpoint]
  const toGate = new THREE.Vector3().subVectors(carPos, cp.position)
  const dot    = toGate.dot(cp.tangent)

  // Initialise prevDot on first call
  if (cp.prevDot === undefined || cp.prevDot === null) {
    cp.prevDot = dot
    return null
  }

  // Crossed from negative to positive side (forward through gate)
  if (cp.prevDot < 0 && dot >= 0) {
    tracker.nextCheckpoint = (tracker.nextCheckpoint + 1) % tracker.checkpoints.length

    if (tracker.nextCheckpoint === 0) {
      // Completed a lap
      const lapTime = now - tracker.lapStartTime
      tracker.lapTimes.push(lapTime)
      tracker.lapStartTime = now
      tracker.currentLap++
      cp.prevDot = dot
      return { type: 'lap_complete', lapTime }
    }
  }

  cp.prevDot = dot
  return null
}
