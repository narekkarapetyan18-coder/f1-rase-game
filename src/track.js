import * as THREE from 'three'

// F1-style circuit waypoints (XZ plane)
const RAW_WAYPOINTS = [
  [  0,   0,    0],   // S/F line
  [ 60,   0,    0],   // main straight
  [120,   0,    0],
  [150,   0,  -20],   // T1 entry
  [158,   0,  -55],   // T1 apex
  [148,   0,  -90],   // T1 exit
  [120,   0, -110],   // T2 left
  [ 75,   0, -120],   // hairpin entry
  [ 45,   0, -115],   // hairpin apex
  [ 25,   0,  -95],   // hairpin exit
  [  5,   0,  -75],   // chicane R
  [-20,   0,  -85],   // chicane L
  [-50,   0,  -75],   // chicane exit
  [-80,   0,  -50],   // sweeper
  [-85,   0,  -15],   // return bend
  [-55,   0,    5],   // back to start
  [-20,   0,    5],
]

export const TRACK_WIDTH = 13

function buildRibbon(points, halfW, closed) {
  const UP = new THREE.Vector3(0, 1, 0)
  const positions = []
  const normals   = []
  const uvs       = []
  const indices   = []

  const count = closed ? points.length : points.length
  for (let i = 0; i < count; i++) {
    const cur  = points[i]
    const next = points[(i + 1) % points.length]
    const tangent = next.clone().sub(cur).normalize()
    const right   = new THREE.Vector3().crossVectors(tangent, UP).normalize()

    const L = cur.clone().sub(right.clone().multiplyScalar(halfW))
    const R = cur.clone().add(right.clone().multiplyScalar(halfW))

    const u = i / (count - 1)
    positions.push(L.x, L.y, L.z,  R.x, R.y, R.z)
    normals.push(0, 1, 0,  0, 1, 0)
    uvs.push(0, u,  1, u)
  }

  for (let i = 0; i < count - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3
    indices.push(a, b, c,  b, d, c)
  }
  if (closed) {
    const a = (count - 1) * 2, b = a + 1
    indices.push(a, b, 0,  b, 1, 0)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

export function buildTrack(scene) {
  const curve = new THREE.CatmullRomCurve3(
    RAW_WAYPOINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    true, 'catmullrom', 0.5
  )

  const SEGMENTS = 500
  const pts = curve.getSpacedPoints(SEGMENTS)

  // Road
  const roadGeo  = buildRibbon(pts, TRACK_WIDTH / 2, true)
  const roadMat  = new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
  const roadMesh = new THREE.Mesh(roadGeo, roadMat)
  roadMesh.receiveShadow = true
  scene.add(roadMesh)

  // White centre line
  const lineGeo  = buildRibbon(pts, 0.15, true)
  const lineMat  = new THREE.MeshLambertMaterial({ color: 0xffffff })
  const lineMesh = new THREE.Mesh(lineGeo, lineMat)
  lineMesh.position.y = 0.01
  scene.add(lineMesh)

  // Kerbs (left = red, right = white alternating via vertex colours would be complex — use solid red/white)
  const kerbHalfW = TRACK_WIDTH / 2 + 1.2
  const kerbInner = TRACK_WIDTH / 2
  const kerbLGeo  = buildRibbon(pts, kerbHalfW, true)
  const kerbLMat  = new THREE.MeshLambertMaterial({ color: 0xcc0000 })
  const kerbL     = new THREE.Mesh(kerbLGeo, kerbLMat)
  kerbL.position.y = -0.005
  scene.add(kerbL)

  // Grass
  const grassGeo = new THREE.PlaneGeometry(800, 800)
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x2d7a27 })
  const grass    = new THREE.Mesh(grassGeo, grassMat)
  grass.rotation.x = -Math.PI / 2
  grass.position.y = -0.06
  grass.receiveShadow = true
  scene.add(grass)

  // Start/Finish line markers
  for (let i = 0; i < 6; i++) {
    const col = i % 2 === 0 ? 0xffffff : 0x000000
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH / 6, 0.02, 0.8),
      new THREE.MeshLambertMaterial({ color: col })
    )
    box.position.set(pts[0].x + (i - 2.5) * (TRACK_WIDTH / 6), 0.02, pts[0].z)
    scene.add(box)
  }

  // Checkpoints (12 evenly spaced)
  const NUM_CP = 12
  const checkpoints = []
  for (let i = 0; i < NUM_CP; i++) {
    const t       = i / NUM_CP
    const pos     = curve.getPoint(t)
    const tangent = curve.getTangent(t).normalize()
    checkpoints.push({ t, position: pos, tangent, prevDot: null })
  }

  // Curve length (approximate)
  const curveLength = curve.getLength()

  return { curve, checkpoints, curveLength, pathPoints: pts }
}
