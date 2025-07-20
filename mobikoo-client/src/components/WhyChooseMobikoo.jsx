import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const WhyChooseMobikoo = () => {
  const sectionRef = useRef(null);
  const featureRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const features = featureRefs.current;

    if (section && features.length) {
      gsap.fromTo(
        features,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        }
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-50 mb-4">
            Why Choose Mobikoo?
            <span className="inline-block ml-2">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="text-blue-500"
              >
                <path
                  d="M20 4L24 16L36 20L24 24L20 36L16 24L4 20L16 16L20 4Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "No Questions Asked",
              description:
                "We accept 99.4% of all service requests raised. No questions, just swift solutions.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 20c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm2-6h-4v-2c0-2.209 1.791-4 4-4s4 1.791 4 4h-2c0-1.105-.895-2-2-2s-2 .895-2 2v2z"
                    fill="currentColor"
                  />
                </svg>
              ),
            },
            {
              title: "🔧✨ 2-Hour Repair Challenge",
              description:
                "Get Your Device Back Fast - Most repairs completed within 2 hours by our expert technicians.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M16 8v8l4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ),
            },
            {
              title: "No Paperwork",
              description:
                "No forms, no invoices, no paperwork to be filled. Everything is handled digitally.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <rect
                    x="6"
                    y="4"
                    width="20"
                    height="24"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10 12h12M10 16h8M10 20h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ),
            },
            {
              title: "Replacement Guarantee",
              description:
                "We repair your device within the promised time or replace it with zero hassle.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M16 2l4 8h8l-6 6 2 8-8-4-8 4 2-8-6-6h8l4-8z"
                    fill="currentColor"
                  />
                </svg>
              ),
            },
            {
              title: "Free Pick & Drop",
              description:
                "We provide doorstep pick-up & drop. 100% convenience, 0% hassle for you.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M4 18h4v6H4zM24 18h4v6h-4z"
                    fill="currentColor"
                  />
                  <path
                    d="M2 12h6v12H2zM8 8h16v16H8zM24 12h6v12h-6z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                </svg>
              ),
            },
            {
              title: "At-home Service",
              description:
                "Get repair services for your devices & appliances at your doorstep with complete safety.",
              icon: (
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M6 14l10-8 10 8v14H20v-8h-8v8H6V14z"
                    fill="currentColor"
                  />
                </svg>
              ),
            },
          ].map((feature, index) => (
            <div
              key={index}
              ref={(el) => (featureRefs.current[index] = el)}
              className="flex flex-col items-start bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-50 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseMobikoo;