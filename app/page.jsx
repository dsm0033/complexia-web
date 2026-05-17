import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/sections/Hero';
import Servicios from '@/components/sections/Servicios';
import Metodologia from '@/components/sections/Metodologia';
import Casos from '@/components/sections/Casos';
import Contacto from '@/components/sections/Contacto';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Servicios />
        <Metodologia />
        <Casos />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
