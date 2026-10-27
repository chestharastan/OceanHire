import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import DotNav from './components/DotNav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import About from './components/About.jsx'
import Anatomy from './components/Anatomy.jsx'
import Sail from './components/Sail.jsx'
import Voyage from './components/Voyage.jsx'
import Gallery from './components/Gallery.jsx'
import ApplyForm from './components/ApplyForm.jsx'
import FAQ from './components/FAQ.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Loader from './components/Loader.jsx'
import FallbackBackdrop from './components/FallbackBackdrop.jsx'
import { prefersReducedMotion } from './lib/quality.js'
import { scrollToId, setScrollLocked } from './lib/scroll.js'

// The whole 3D engine is a separate chunk, fetched after first paint.
const Backdrop = lazy(() => import('./three/Backdrop.jsx'))

// If the 3D chunk fails to load (offline, blocked, old browser) the page must
// still work — fall back to the CSS backdrop instead of unmounting the app.
class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.error('3D backdrop failed to load', err)
    this.props.onError?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const introSeen = () => {
  try {
    return sessionStorage.getItem('oh-intro') === '1'
  } catch {
    return false
  }
}

export default function App() {
  const reduce = useRef(prefersReducedMotion()).current
  const skipIntro = useRef(introSeen()).current
  // WebGL state: 'pending' → starting, 'on' → painting, 'off' → unavailable / reduced motion
  const [gl, setGl] = useState(reduce ? 'off' : 'pending')
  // Intro: 'loading' → curtain up, 'leaving' → lifting, 'done' → gone
  const [phase, setPhase] = useState(skipIntro ? 'done' : 'loading')
  const glReady = useRef(reduce) // read by the loader to know when the 3D scene is ready

  const onReady = useCallback(() => {
    glReady.current = true
    setGl('on')
  }, [])
  const onFail = useCallback(() => {
    glReady.current = true
    setGl('off')
  }, [])
  const onGone = useCallback(() => {
    setPhase('done')
    setScrollLocked(false)
    try {
      sessionStorage.setItem('oh-intro', '1')
    } catch {
      /* private mode — fine */
    }
  }, [])
  const onLeave = useCallback(() => setPhase('leaving'), [])

  // Lock scrolling for the duration of the intro (released in onGone).
  useEffect(() => {
    if (!skipIntro) setScrollLocked(true)
    return () => setScrollLocked(false)
  }, [skipIntro])

  return (
    <div className="relative">
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('about')
        }}
        className="eyebrow sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-foam focus:px-5 focus:py-3 focus:text-ink"
      >
        Skip to content
      </a>

      <FallbackBackdrop active={gl !== 'on'} />
      {gl !== 'off' && (
        <Boundary onError={onFail}>
          <Suspense fallback={null}>
            <Backdrop onReady={onReady} onFail={onFail} />
          </Suspense>
        </Boundary>
      )}
      <div className="grain" aria-hidden="true" />

      <Navbar />
      <DotNav />
      <main>
        <Hero ready={phase !== 'loading'} />
        <Marquee />
        <About />
        <Anatomy />
        <Sail />
        <Voyage />
        <Gallery />
        <ApplyForm />
        <FAQ />
        <Contact />
      </main>
      <Footer />

      {phase !== 'done' && <Loader glReady={glReady} onLeave={onLeave} onGone={onGone} />}
    </div>
  )
}
