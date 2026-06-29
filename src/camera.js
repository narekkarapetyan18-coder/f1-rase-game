import * as THREE from 'three'

const _lookTarget = new THREE.Vector3()
const _desired    = new THREE.Vector3()
const _forward    = new THREE.Vector3()

export function updateCamera(camera, carGroup, carState, delta) {
  // Forward direction of car
  _forward.set(Math.sin(carState.heading), 0, Math.cos(carState.heading))

  // Desired camera position: behind and above
  _desired.copy(carGroup.position)
    .addScaledVector(_forward, -12)
    .add(new THREE.Vector3(0, 4.5, 0))

  camera.position.lerp(_desired, 0.08)

  // LookAt: slightly ahead of car
  _lookTarget.copy(carGroup.position)
    .addScaledVector(_forward, 8)
    .add(new THREE.Vector3(0, 1.2, 0))

  // Lerp a stored look target (smooth)
  if (!camera.userData.lt) camera.userData.lt = _lookTarget.clone()
  camera.userData.lt.lerp(_lookTarget, 0.12)
  camera.lookAt(camera.userData.lt)

  // Speed-based FOV
  const targetFov = 62 + carState.speed * 0.10
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.04)
  camera.updateProjectionMatrix()
}
