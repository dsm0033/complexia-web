import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function LegalLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
