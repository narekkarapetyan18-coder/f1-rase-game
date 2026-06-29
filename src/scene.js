import * as THREE from 'three'

export function initScene() {
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 150, 400)

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 8, -15)

  // Ambient
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambient)

  // Sun
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.4)
  sun.position.set(80, 120, 60)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 500
  sun.shadow.camera.left = -200
  sun.shadow.camera.right = 200
  sun.shadow.camera.top = 200
  sun.shadow.camera.bottom = -200
  sun.shadow.bias = -0.001
  scene.add(sun)

  // Hemisphere for sky/ground colour bounce
  const hemi = new THREE.HemisphereLight(0x87ceeb, 0x2d7a27, 0.4)
  scene.add(hemi)

  return { scene, renderer, camera }
}
