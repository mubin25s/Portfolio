import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Contact } from './components/Contact';
import { CanvasBackground } from './components/CanvasBackground';

function App() {
  return (
    <main className="relative z-0">
      <CanvasBackground />
      <Navbar />
      <Hero />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}

export default App;
