import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Departments from './components/Departments.jsx'
import ApplyForm from './components/ApplyForm.jsx'
import FAQ from './components/FAQ.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Departments />
        <ApplyForm />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
