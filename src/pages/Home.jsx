import React from 'react';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 w-full relative">
        <Hero />
      </main>
      
      <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <span className="font-semibold text-lg text-slate-800 tracking-tight">
              Perscripto
            </span>
          </div>
          <p className="text-slate-500 text-sm text-center max-w-lg mb-6 leading-relaxed">
            Securely converting complex medical handwriting into structured, easy-to-understand formats for a seamless patient experience.
          </p>
          <div className="text-slate-400 text-xs font-medium tracking-wide">
            © {new Date().getFullYear()} Perscripto. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
