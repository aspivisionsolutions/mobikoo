import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessStories = () => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const successStories = [
    {
      client: "TechResell (Online Seller)",
      challenge: "Fake warranty claims were eating into profits.",
      results: [
        "100% genuine claims flagged by AI",
        "₹1.2L/month saved on fraudulent repairs",
        "4.8/5 customer ratings on Amazon Renewed"
      ],
      quote: "With Mobikoo, we focus on sales—not disputes!",
      quotePerson: "Neha Patel, Founder"
    },
    {
      client: "QuickFix Repairs, Delhi",
      challenge: "Repair delays caused customer dissatisfaction.",
      results: [
        "60% faster repairs with prioritized orders",
        "200+ warranties processed monthly",
        "30% revenue growth from Mobikoo partnerships"
      ],
      quote: "Mobikoo's platform keeps our garage full and customers happy!",
      quotePerson: "Arjun Singh, Repair Head"
    },
    {
      client: "TechResell Shop",
      challenge: "Low customer trust in refurbished phones led to high returns and stagnant sales.",
      results: [
        "40% increase in sales of pre-owned devices",
        "₹78,000 saved in repair costs (first month)",
        "90% repeat customers due to trust in warranties"
      ],
      quote: "Mobikoo's warranties made my shop the go-to place for reliable second-hand phones!",
      quotePerson: "Rajesh Kumar, Owner"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex((prevIndex) => 
        (prevIndex + 1) % successStories.length
      );
    }, 3000); // Change card every 3 seconds

    return () => clearInterval(interval);
  }, [successStories.length]);

  return (
    <div className="bg-gray-900 flex items-center justify-center p-4 mt-32">
      <div className="flex justify-center items-center gap-12">
        {/* Left Side - Text Content */}
        <div className="space-y-6 w-[50%] pl-20">
          <h1 className="text-4xl font-bold text-gray-50">
            Transforming <span className="text-yellow-500">Business</span> Success
          </h1>
          <p className="text-gray-50 text-lg leading-relaxed">
            Our innovative solutions have empowered businesses to overcome challenges, 
            increase efficiency, and drive remarkable growth. Each success story 
            demonstrates our commitment to solving real-world problems and creating 
            tangible value for our partners.
          </p>
        </div>

        {/* Right Side - Card Transition */}
        <div className="relative w-[50%] h-[600px] flex items-center justify-center">
          <div className="absolute w-full h-full flex items-center justify-center">
            <AnimatePresence>
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ 
                    x: index === activeCardIndex ? '100%' : '200%',
                    opacity: 0,
                    scale: 0.9
                  }}
                  animate={{ 
                    x: index === activeCardIndex ? '0%' : '-100%',
                    opacity: index === activeCardIndex ? 1 : 0,
                    scale: index === activeCardIndex ? 1 : 0.9
                  }}
                  exit={{ 
                    x: '200%',
                    opacity: 0,
                    scale: 0.9
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  className="absolute w-72"
                >
                  <div className="w-full bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {story.client}
                    </h3>
                    <p className="text-gray-600 mb-4 italic">
                      "{story.challenge}"
                    </p>
                    <ul className="mb-4 space-y-2">
                      {story.results.map((result, rIndex) => (
                        <li 
                          key={rIndex} 
                          className="flex items-start"
                        >
                          <svg 
                            className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t pt-4 mt-4">
                      <blockquote className="italic text-gray-600 mb-2">
                        "{story.quote}"
                      </blockquote>
                      <p className="font-medium text-gray-800">
                        {story.quotePerson}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;