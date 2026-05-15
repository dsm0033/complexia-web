import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
      </main>
    </>
  );
}
