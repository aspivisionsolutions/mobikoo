import React, { useEffect } from 'react';

const LandingPage = () => {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const handleAnchorClick = (e) => {
      e.preventDefault();
      const href = e.currentTarget.getAttribute('href');
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    // Cleanup event listeners
    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  return (
    <div className="font-sans m-0 p-0 box-border">
      <header className="bg-gray-800 text-white py-2 px-5 flex justify-between items-center">
        <div className="text-2xl font-bold">Mobikoo</div>
        <ul className="flex gap-5 list-none">
          <li><a href="#home" className="text-white no-underline">Home</a></li>
          <li><a href="#features" className="text-white no-underline">Features</a></li>
          <li><a href="#about" className="text-white no-underline">About</a></li>
          <li><a href="#contact" className="text-white no-underline">Contact</a></li>
        </ul>
      </header>

      <section id="home" className="bg-cover bg-center h-screen flex justify-center items-center text-white text-center" style={{ backgroundImage: "url('hero-bg.jpg')" }}>
        <div>
          <h1 className="text-5xl text-gray-800 font-bold mb-5">Welcome to Mobikoo</h1>
          <p className="text-2xl text-gray-800 mb-8">Your one-stop solution for all your needs.</p>
          <a href="#features" className="bg-red-500 text-white py-2 px-5 rounded no-underline text-lg">Learn More</a>
        </div>
      </section>

      <section id="features" className="py-12 px-5 text-center">
        <h2 className="text-4xl mb-10">Features</h2>
        <div className="flex justify-around gap-5">
          <div className="bg-gray-100 p-5 rounded-lg w-1/3">
            <h3 className="text-2xl mb-2">Feature One</h3>
            <p>Description of feature one.</p>
          </div>
          <div className="bg-gray-100 p-5 rounded-lg w-1/3">
            <h3 className="text-2xl mb-2">Feature Two</h3>
            <p>Description of feature two.</p>
          </div>
          <div className="bg-gray-100 p-5 rounded-lg w-1/3">
            <h3 className="text-2xl mb-2">Feature Three</h3>
            <p>Description of feature three.</p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white text-center py-5 mt-12">
        <p>&copy; 2023 Mobikoo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;