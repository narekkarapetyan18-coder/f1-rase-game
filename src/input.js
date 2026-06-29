export function createInput() {
  const keys = { forward: false, back: false, left: false, right: false }

  const map = {
    w: 'forward', arrowup: 'forward',
    s: 'back',    arrowdown: 'back',
    a: 'left',    arrowleft: 'left',
    d: 'right',   arrowright: 'right',
  }

  window.addEventListener('keydown', e => {
    const k = map[e.key.toLowerCase()]
    if (k) keys[k] = true
  })
  window.addEventListener('keyup', e => {
    const k = map[e.key.toLowerCase()]
    if (k) keys[k] = false
  })

  // Touch controls
  const touchMap = {
    'btn-accel': 'forward',
    'btn-brake': 'back',
    'btn-left': 'left',
    'btn-right': 'right',
  }
  for (const [id, action] of Object.entries(touchMap)) {
    const el = document.getElementById(id)
    if (!el) continue
    el.addEventListener('touchstart', e => { e.preventDefault(); keys[action] = true }, { passive: false })
    el.addEventListener('touchend',   e => { e.preventDefault(); keys[action] = false }, { passive: false })
  }

  return { keys }
}
