import React,{useRef,useEffect} from 'react';
import { ArrowRight, Activity, ArrowDownRight, Quote } from 'lucide-react';
import {gsap} from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const footerLinks = {
    product: [
      { name: 'Features', url: '#' },
      { name: 'Pricing', url: '#' },
      { name: 'Contact Us', url: '#' },
    ],
    company: [
      { name: 'Terms & Conditions', url: '#' },
      { name: 'Privacy Policy', url: '#' },
      { name: 'Contact Us', url: '#' },
      { name: 'Refund Policy', url: '#' },
      { name: 'Shipping', url: '#' },
    ],
  };
  const cardARef = useRef(null);
  const cardBRef = useRef(null);
  const cardCRef = useRef(null);
  const cardDRef = useRef(null);
  const cardERef = useRef(null);

  useEffect(() => {
    const cardA = cardARef.current;
    const cardB = cardBRef.current;
    const cardC = cardCRef.current;
    const cardD = cardDRef.current;
    const cardE = cardERef.current;

    if (cardA && cardB && cardC && cardD && cardE) {
      // Card D animation
      gsap.to(cardD, {
        yPercent: -100, // Move up by 100% of its height
        scrollTrigger: {
          trigger: cardD,
          start: 'top bottom', // Start when the top of cardD hits the bottom of the viewport
          end: 'bottom top', // End when the bottom of cardD hits the top of the viewport
          scrub: true, // Smoothly animate while scrolling
          // markers: true, // For debugging
        },
      });

      // Card E animation
      gsap.to(cardE, {
        yPercent: -100, // Move up by 100% of its height
        scrollTrigger: {
          trigger: cardE,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          // markers: true,
        },
      });
    }
  }, []);

  const stats = [
    { value: '80K', label: 'TRUSTED CUSTOMERS' },
    { value: '72', label: 'SHOP' },
    { value: '70K', label: 'ACTIVE CLAIMS' },
    { value: '3', label: 'BRANCHES' }, // Note: "BRANCES" in image appears to be a typo for "BRANCHES"
  ];

  const reviews = [
    {
      name: 'Ravi Sharma',
      image: '/api/placeholder/200/200',
      text: 'Mobikoo saved my day when I accidentally dropped my phone. The claims process was so quick and easy. Highly recommend!',
    },
    {
      name: 'Priya Mehta',
      image: '/api/placeholder/200/200',
      text: "Excellent service! Mobikoo's affordable plans and comprehensive coverage give me peace of mind knowing my phone is always protected.",
    },
    {
      name: 'Anil Kapoor',
      image: '/api/placeholder/200/200',
      text: "Partnering with Mobikoo has been great for my business. My customers love the added security, and I've seen an increase in sales.",
    },
    {
      name: 'Sneha Patil',
      image: '/api/placeholder/200/200',
      text: "I was skeptical at first, but Mobikoo's customer support is fantastic. They guided me through every step when I needed to file a claim.",
    },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-black text-white'>
      {/* Navigation Bar */}
      <header className='w-full py-4 px-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='mr-2'>
              <svg
                width='32'
                height='32'
                viewBox='0 0 32 32'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M8 8L16 4L24 8L16 12L8 8Z' fill='white' />
                <path d='M8 8V16L16 20V12L8 8Z' fill='white' />
                <path d='M16 12V20L24 16V8L16 12Z' fill='white' />
              </svg>
            </div>
            <span className='text-xl font-bold text-gray-300'>
              MOBIKOO.ONLINE
            </span>
          </div>

          <div className='hidden md:flex items-center space-x-8'>
            <div className='flex items-center gap-8'>
              <a href='#' className='text-gray-300 hover:text-white'>
                Features
              </a>
              <a href='#' className='text-gray-300 hover:text-white'>
                Pricing
              </a>
              <a href='#' className='text-gray-300 hover:text-white'>
                Contact Us
              </a>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center'>
                  <svg
                    width='12'
                    height='12'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21'
                      stroke='black'
                      strokeWidth='2'
                    />
                    <circle
                      cx='12'
                      cy='7'
                      r='4'
                      stroke='black'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
                <a href="/login"><span className='text-gray-300'>Log In</span></a>
              </div>
            </div>
          </div>

          <button className='bg-transparent text-white font-semibold py-2 px-6 border-2 border-white rounded-full hover:bg-white hover:text-black transition-all'>
            GET STARTED
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-grow flex flex-col justify-center'>
        <div className='relative'>
          {/* Background Image - Circuit Board */}
                    {/* Background Image - Circuit Board */}
                    <div className='absolute inset-0 z-0 overflow-hidden'>
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className='w-full h-full object-cover'
            >
              <source src='/mobikoo-bg.mp4' type='video/mp4' />
              Your browser does not support the video tag.
            </video>
            <div className='absolute inset-0 w-full h-full bg-gradient-to-r from-blue-900/50 to-purple-900/50'></div>
          </div>


          {/* Content */}
          <div className='relative z-10 px-6 py-20 md:py-32'>
            <h1 className='text-6xl md:text-8xl font-bold mb-4'>MOBIKOO</h1>
            <h2 className='text-2xl md:text-4xl font-light mb-8 max-w-2xl'>
              Your Phone's Best Friend in Times of Trouble
            </h2>
          </div>
        </div>
      </main>

      <section className='px-6 py-16 bg-black'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {/* Feature Card A */}
          <div
            ref={cardARef}
            className='md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96'
          >
            {/* ... (Card A content) */}
            <div className='absolute top-6 left-6 text-4xl font-light text-gray-400'>
                A
              </div>

              <div className='mt-12'>
                <h3 className='text-xl font-bold mb-2 underline'>
                  Affordable Plans
                </h3>
                <p className='text-gray-300'>
                  offers budget-friendly insurance options to ensure that
                  everyone can afford comprehensive mobile protection.
                </p>
              </div>

              <div className='absolute bottom-6 left-6'>
                <div className='bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center'>
                  <Activity className='h-6 w-6 text-white' />
                </div>
              </div>

              <div className='absolute inset-0 z-0 opacity-20'>
                <div className='w-full h-full bg-black'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <svg
                    width='200'
                    height='200'
                    viewBox='0 0 200 200'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='opacity-30'
                  >
                    <path
                      d='M80 40 L120 40 L120 160 L80 160 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                    <path d='M50 70 L150 70' stroke='white' strokeWidth='2' />
                    <path d='M50 140 L150 140' stroke='white' strokeWidth='2' />
                    <path
                      d='M90 170 L110 170 L110 180 L90 180 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
              </div>
          </div>

          {/* Feature Card B */}
          <div
            ref={cardBRef}
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96'
          >
            {/* ... (Card B content) */}
            <div className='absolute top-6 left-6 text-4xl font-light text-gray-400'>
                B
              </div>

              <div className='mt-12'>
                <h3 className='text-xl font-bold mb-2 underline'>
                  Easy Claims Process
                </h3>
                <p className='text-gray-300'>
                  We have designed a straightforward and efficient claims
                  process to make it easy for customers to get their issues
                  resolved quickly.
                </p>
              </div>

              <div className='absolute bottom-6 left-6'>
                <div className='bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center'>
                  <svg
                    className='h-6 w-6 text-white'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <rect
                      x='4'
                      y='4'
                      width='16'
                      height='16'
                      rx='2'
                      stroke='currentColor'
                      strokeWidth='2'
                    />
                    <circle cx='8' cy='8' r='1' fill='currentColor' />
                    <circle cx='16' cy='8' r='1' fill='currentColor' />
                  </svg>
                </div>
              </div>
          </div>

          {/* Feature Card C */}
          <div
            ref={cardCRef}
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96'
          >
            {/* ... (Card C content) */}
            <div className='absolute top-6 left-6 text-4xl font-light text-gray-400'>
                C
              </div>

              <div className='mt-12'>
                <h3 className='text-xl font-bold mb-2 underline'>
                  Fast Activation
                </h3>
                <p className='text-gray-300'>
                  Insurance coverage activates within 48 hours of purchase,
                  ensuring that your mobile is protected quickly.
                </p>
              </div>

              <div className='absolute bottom-6 left-6'>
                <div className='bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center'>
                  <ArrowDownRight className='h-6 w-6 text-white' />
                </div>
              </div>
          </div>
        </div>

        {/* Bottom Row (Partial) */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          {/* Feature Card D (Partial) */}
          <div
            ref={cardDRef}
            className='md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl overflow-hidden relative p-6 h-96'
          >
            {/* ... (Card D content) */}
            <div className='absolute top-6 left-6 text-4xl font-light text-gray-400'>
                D
              </div>
              <div className='mt-12'>
                <h3 className='text-xl font-bold mb-2 underline'>
                  Affordable Plans
                </h3>
                <p className='text-gray-300'>
                  offers budget-friendly insurance options to ensure that
                  everyone can afford comprehensive mobile protection.
                </p>
              </div>

              <div className='absolute bottom-6 left-6'>
                <div className='bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center'>
                  <Activity className='h-6 w-6 text-white' />
                </div>
              </div>

              <div className='absolute inset-0 z-0 opacity-20'>
                <div className='w-full h-full bg-black'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <svg
                    width='200'
                    height='200'
                    viewBox='0 0 200 200'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='opacity-30'
                  >
                    <path
                      d='M80 40 L120 40 L120 160 L80 160 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                    <path d='M50 70 L150 70' stroke='white' strokeWidth='2' />
                    <path d='M50 140 L150 140' stroke='white' strokeWidth='2' />
                    <path
                      d='M90 170 L110 170 L110 180 L90 180 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
              </div>
          </div>

          {/* Feature Card E (Partial) */}
          <div
            ref={cardERef}
            className='md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl overflow-hidden relative p-6 h-96'
          >
            {/* ... (Card E content) */}
            <div className='absolute top-6 left-6 text-4xl font-light text-gray-400'>
                E
              </div>
              <div className='mt-12'>
                <h3 className='text-xl font-bold mb-2 underline'>
                  Affordable Plans
                </h3>
                <p className='text-gray-300'>
                  offers budget-friendly insurance options to ensure that
                  everyone can afford comprehensive mobile protection.
                </p>
              </div>

              <div className='absolute bottom-6 left-6'>
                <div className='bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center'>
                  <Activity className='h-6 w-6 text-white' />
                </div>
              </div>

              <div className='absolute inset-0 z-0 opacity-20'>
                <div className='w-full h-full bg-black'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <svg
                    width='200'
                    height='200'
                    viewBox='0 0 200 200'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='opacity-30'
                  >
                    <path
                      d='M80 40 L120 40 L120 160 L80 160 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                    <path d='M50 70 L150 70' stroke='white' strokeWidth='2' />
                    <path d='M50 140 L150 140' stroke='white' strokeWidth='2' />
                    <path
                      d='M90 170 L110 170 L110 180 L90 180 Z'
                      stroke='white'
                      strokeWidth='2'
                    />
                  </svg>
                </div>
              </div>
          </div>
        </div>
      </section>


      {/* Seamless User Experience Section */}
      <section className='px-6 py-16 bg-black'>
        <div className='relative mb-12'>
          <div className='h-48 w-full overflow-hidden rounded-lg relative'>
            <div className='absolute inset-0 z-0 opacity-40'>
              <img
                src='/api/placeholder/1200/300'
                alt='Keyboard background'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='relative z-10 p-8 flex items-center h-full'>
              <h2 className='text-4xl md:text-5xl font-light text-white'>
                A Seamless User Experience
              </h2>
            </div>
          </div>
        </div>

        {/* Feature Grid - First Row */}
        <div className='flex justify-start w-full'>
          <div className='w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            {/* Feature 1 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 1</h4>
              </div>
              <div className='bg-indigo-600 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>
                  Cost-Effective Plans
                </h3>
              </div>
            </div>

            {/* Feature 2 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 2</h4>
              </div>
              <div className='bg-gray-700 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>
                  Complete Coverage
                </h3>
              </div>
            </div>

            {/* Feature 3 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 3</h4>
              </div>
              <div className='bg-indigo-600 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>Quick Claims</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid - Second Row */}
        <div className='flex justify-end w-full'>
          <div className='w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Feature 4 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 4</h4>
              </div>
              <div className='bg-gray-700 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>
                  Rapid Activation
                </h3>
              </div>
            </div>

            {/* Feature 5 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 5</h4>
              </div>
              <div className='bg-indigo-600 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>
                  Peaceful Assurance
                </h3>
              </div>
            </div>

            {/* Feature 6 */}
            <div className='rounded-lg overflow-hidden'>
              <div className='bg-gray-800 py-3 px-4'>
                <h4 className='text-sm font-bold text-gray-400'>FEATURE 6</h4>
              </div>
              <div className='bg-gray-700 py-6 px-4'>
                <h3 className='text-2xl font-medium text-white'>
                  High-Quality Service
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='flex flex-col w-full bg-slate-800 text-white'>
        {/* Top banner with "About us" */}
        <div className='relative w-full h-64'>
          <div className='absolute inset-0'>
            <img
              src='/api/placeholder/1200/400'
              alt='Mobile devices'
              className='w-full h-full object-cover'
            />
          </div>
          <div className='absolute inset-0 bg-black bg-opacity-30'></div>
          <div className='absolute top-10 left-10'>
            <h1 className='text-4xl font-bold text-white'>About us</h1>
          </div>
        </div>

        {/* Content section with description and phone images */}
        <div className='flex flex-col md:flex-row'>
          {/* Left text section */}
          <div className='w-full md:w-1/2 bg-slate-700 p-10 flex items-center'>
            <p className='text-xl leading-relaxed'>
              Mobikoo is a pioneering mobile insurance company dedicated to
              providing comprehensive protection for your devices. With our
              affordable and flexible plans, we ensure your mobile is
              safeguarded against accidental damage, theft, and other common
              issues. Our easy claims process, coupled with 24/7 customer
              support, guarantees hassle-free and swift resolution of any
              problems you may face.
            </p>
          </div>

          {/* Right image section */}
          <div className='w-full md:w-1/2 bg-gray-200 p-6 flex justify-center items-center'>
            <div className='relative w-full h-64'>
              <img
                src='/api/placeholder/600/400'
                alt='iPhone models'
                className='w-full h-full object-contain'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='w-full bg-black text-white py-12 px-4'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold mb-12 px-4'>Customer Reviews</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {reviews.map((review, index) => (
              <div
                key={index}
                className='bg-gray-900 rounded-lg p-6 flex flex-col items-center'
              >
                <div className='w-24 h-24 rounded-full overflow-hidden mb-4'>
                  <img
                    src={review.image}
                    alt={`${review.name} avatar`}
                    className='w-full h-full object-cover'
                  />
                </div>

                <div className='flex justify-center text-blue-500 mb-2'>
                  <Quote size={24} />
                  <Quote size={24} />
                </div>

                <h3 className='text-blue-500 text-xl font-medium mb-4'>
                  {review.name}
                </h3>

                <p className='text-blue-400 text-center'>{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='w-full bg-black py-12 px-4'>
        <div className='max-w-6xl mx-auto'>
          {/* Header with background image */}
          <div className='relative w-full h-32 mb-8 rounded-lg overflow-hidden'>
            <img
              src='/api/placeholder/1200/200'
              alt='Mobile phone repair'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-black bg-opacity-30'></div>
            <div className='absolute inset-0 flex items-center px-8'>
              <h2 className='text-4xl font-light text-white'>
                A Glimpse into Our Growth
              </h2>
            </div>
          </div>

          {/* Stats grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <div key={index} className='rounded-lg overflow-hidden'>
                {/* Upper section with large number */}
                <div className='bg-gray-700 p-8 flex items-center justify-center'>
                  <span className='text-6xl font-light text-white'>
                    {stat.value}
                  </span>
                </div>

                {/* Lower section with label */}
                <div className='bg-gray-800 p-4 flex items-center'>
                  <ArrowRight className='text-gray-500 mr-2' size={16} />
                  <span className='text-gray-400 text-sm font-medium tracking-wider'>
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className='w-full bg-black text-gray-400 py-12 px-6'>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Product Column */}
          <div>
            <h3 className='text-white text-lg mb-4'>Product</h3>
            <ul className='space-y-2'>
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className='hover:text-gray-300 transition-colors'
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className='text-white text-lg mb-4'>Company</h3>
            <ul className='space-y-2'>
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className='hover:text-gray-300 transition-colors'
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional columns can be added as needed */}
          <div className='lg:col-span-2'>
            {/* Empty space or could contain newsletter signup, social media links, etc. */}
          </div>
        </div>

        <div className='max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800'>
          <p className='text-sm text-gray-600'>
            © {new Date().getFullYear()} Mobikoo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;