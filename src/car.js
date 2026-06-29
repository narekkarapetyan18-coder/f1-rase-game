import * as THREE from 'three'

function mesh(geo, color, castShadow = true) {
  const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color, specular: 0x444444, shininess: 60 }))
  m.castShadow = castShadow
  return m
}

export function createCar(scene, color) {
  const group = new THREE.Group()

  // Body
  const body = mesh(new THREE.BoxGeometry(1.8, 0.32, 4.2), color)
  body.position.set(0, 0.32, 0)
  group.add(body)

  // Nose cone
  const nose = mesh(new THREE.BoxGeometry(0.75, 0.22, 1.1), color)
  nose.position.set(0, 0.26, 2.6)
  group.add(nose)

  // Cockpit surround
  const cockpit = mesh(new THREE.BoxGeometry(0.65, 0.38, 0.85), 0x111111)
  cockpit.position.set(0, 0.56, 0.3)
  group.add(cockpit)

  // Halo
  const haloGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16, Math.PI)
  const halo = mesh(haloGeo, 0x222222)
  halo.rotation.set(0, Math.PI / 2, Math.PI / 2)
  halo.position.set(0, 0.72, 0.3)
  group.add(halo)

  // Front wing main
  const fw = mesh(new THREE.BoxGeometry(2.1, 0.055, 0.45), color)
  fw.position.set(0, 0.14, 2.9)
  group.add(fw)
  // Front wing endplates
  for (const sx of [-1, 1]) {
    const ep = mesh(new THREE.BoxGeometry(0.055, 0.22, 0.48), color)
    ep.position.set(sx * 1.0, 0.23, 2.9)
    group.add(ep)
  }

  // Rear wing main
  const rw = mesh(new THREE.BoxGeometry(1.5, 0.055, 0.38), color)
  rw.position.set(0, 0.88, -2.1)
  group.add(rw)
  // Rear wing endplates
  for (const sx of [-1, 1]) {
    const ep = mesh(new THREE.BoxGeometry(0.055, 0.42, 0.42), color)
    ep.position.set(sx * 0.75, 0.68, -2.1)
    group.add(ep)
  }

  // Floor
  const floor = mesh(new THREE.BoxGeometry(1.55, 0.045, 3.8), 0x111111)
  floor.position.set(0, 0.07, 0)
  group.add(floor)

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.3, 20)
  const hubGeo   = new THREE.CylinderGeometry(0.17, 0.17, 0.32, 12)
  const tireMat  = new THREE.MeshPhongMaterial({ color: 0x111111 })
  const hubMat   = new THREE.MeshPhongMaterial({ color: 0xbbbbbb, shininess: 80 })

  const wheelPositions = [
    [-1.08,  0.33,  1.55],
    [ 1.08,  0.33,  1.55],
    [-1.08,  0.33, -1.45],
    [ 1.08,  0.33, -1.45],
  ]

  const wheels = []
  for (const [x, y, z] of wheelPositions) {
    const w = new THREE.Mesh(wheelGeo, tireMat)
    w.rotation.z = Math.PI / 2
    w.castShadow = true
    w.position.set(x, y, z)
    group.add(w)
    wheels.push(w)

    const hub = new THREE.Mesh(hubGeo, hubMat)
    hub.rotation.z = Math.PI / 2
    hub.castShadow = true
    hub.position.set(x, y, z)
    group.add(hub)
  }

  scene.add(group)

  const state = {
    position:   new THREE.Vector3(),
    heading:    0,
    speed:      0,
    steerAngle: 0,
    wheelBase:  3.0,
    onTrack:    true,
  }

  return { group, state, wheels }
}
