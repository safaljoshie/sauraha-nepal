/**
 * Soft bubble/pop for the Dhurbe suggestion bubble.
 * Uses Web Audio (no asset). May be silent until the browser unlocks audio
 * after a user gesture — we unlock on first pointer/keydown/scroll.
 */

let audioCtx: AudioContext | null = null
let unlocked = false
let listenersBound = false

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!audioCtx) audioCtx = new AC()
  return audioCtx
}

function unlockAudio() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === "suspended") {
    void ctx.resume().then(() => {
      unlocked = true
    })
  } else {
    unlocked = true
  }
}

/** Call once from the chat widget mount so a later pop can play. */
export function armDhurbePopSound() {
  if (typeof window === "undefined" || listenersBound) return
  listenersBound = true
  const unlock = () => unlockAudio()
  window.addEventListener("pointerdown", unlock, { once: true, passive: true })
  window.addEventListener("keydown", unlock, { once: true })
  window.addEventListener("scroll", unlock, { once: true, passive: true })
}

/** Short rising “pop” — safe to call even if audio is still locked. */
export function playDhurbePopSound() {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const ctx = getCtx()
  if (!ctx) return

  const play = () => {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.16)
  }

  if (ctx.state === "suspended") {
    void ctx.resume().then(() => {
      unlocked = true
      play()
    })
    return
  }

  unlocked = true
  try {
    play()
  } catch {
    // ignore autoplay / audio errors
  }
}
