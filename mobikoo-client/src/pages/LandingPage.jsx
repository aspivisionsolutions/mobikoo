"use client"

import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { ArrowRight, Activity, ArrowDownRight, Quote } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import FlipKartAssured from "../../public/flipkartassured.png"
import AmazonRenewed from "../../public/amazonrenewed.png"
import SangeethaMobiles from "../../public/sangeethamobiles.png"
import RelianceJio from "../../public/relaincejio.png"
import Timex from "../../public/timex.png"
import Amazon from "../../public/amazon.png"
import Flipkart from "../../public/flipkart.png"
import SuccessStories from "../components/SuccessStories"
import DeviceProtectionForm from "../components/DeviceProtectionForm"
import { Link } from "react-router-dom";
import WhyChooseMobikoo from "../components/WhyChooseMobikoo"
const API_URL = import.meta.env.VITE_API_URL

gsap.registerPlugin(ScrollTrigger)

export function LandingPage() {
  const partners = [
    { src: FlipKartAssured, alt: "Flipkart Assured" },
    { src: AmazonRenewed, alt: "Amazon Renewed" },
    { src: SangeethaMobiles, alt: "Sangeetha Mobiles" },
    { src: RelianceJio, alt: "Reliance Jio" },
    { src: Timex, alt: "Timex" },
    { src: Amazon, alt: "Amazon" },
    { src: Flipkart, alt: "Flipkart" },
  ]

  const features = [
    "Cost-Effective Plans",
    "Complete Coverage",
    "Quick Claims",
    "Rapid Activation",
    "Peaceful Assurance",
    "High Quality Service",
  ]

  const [currentFeature, setCurrentFeature] = useState("")
  const [featureIndex, setFeatureIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showImeiPopup, setShowImeiPopup] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const typingSpeed = 100 // Speed of typing
    const deletingSpeed = 50 // Speed of deleting
    const pauseBetween = 2000 // Pause between typing and deleting

    const handleTyping = () => {
      const feature = features[featureIndex]

      // Typing logic
      if (!isDeleting && currentFeature.length < feature.length) {
        setCurrentFeature(feature.substring(0, currentFeature.length + 1))
      }

      // Deleting logic
      else if (isDeleting && currentFeature.length > 0) {
        setCurrentFeature(feature.substring(0, currentFeature.length - 1))
      }

      // Switch between typing and deleting
      else if (!isDeleting && currentFeature.length === feature.length) {
        setTimeout(() => setIsDeleting(true), pauseBetween)
      }

      // Move to next feature
      else if (isDeleting && currentFeature.length === 0) {
        setIsDeleting(false)
        setFeatureIndex((prevIndex) => (prevIndex + 1) % features.length)
      }
    }

    // Set different timeout based on whether we're typing or deleting
    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentFeature, featureIndex, isDeleting])

  const footerLinks = {
    product: [
      { name: "Features", url: "#" },
      { name: "Pricing", url: "#" },
      { name: "Contact Us", url: "#" },
    ],
    company: [
      { name: "Terms & Conditions", url: "/TandC.pdf" },
      { name: "Privacy Policy", url: "/PrivacyPolicy.pdf" },
      { name: "Contact Us", url: "#" },
      { name: "Refund Policy", url: "/RefundPolicy.pdf" },
      { name: "Shipping", url: "#" },
    ],
  }
  const cardARef = useRef(null)
  const cardBRef = useRef(null)
  const cardCRef = useRef(null)
  const cardDRef = useRef(null)
  const cardERef = useRef(null)
  const gridRef = useRef(null)
  const featuresSectionRef = useRef(null)
  const [warrantyDetails, setWarrantyDetails] = useState(null) // Add state for warranty details
  useEffect(() => {
    const cardA = cardARef.current
    const cardB = cardBRef.current
    const cardC = cardCRef.current
    const cardD = cardDRef.current
    const cardE = cardERef.current
    const grid = gridRef.current
    const featuresSection = featuresSectionRef.current

    if (cardA && cardB && cardC && cardD && cardE && grid && featuresSection) {
      // Set initial state for cards D and E
      gsap.set([cardD, cardE], { yPercent: 100, opacity: 0 })

      // Animate cards D and E together
      ScrollTrigger.batch([cardD, cardE], {
        start: "top bottom-=100", // Start when the top of the first card hits the bottom of the viewport
        onEnter: (batch) => {
          gsap.to(batch, {
            yPercent: 0, // Slide up to their normal position
            opacity: 1, // Fade in
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.2, // Stagger the animation slightly
          })
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            yPercent: 100, // Slide down below the viewport
            opacity: 0, // Fade out
            duration: 0.8,
            ease: "power2.in",
            stagger: 0.2,
          })
        },
        // markers: true,
      })
    }
  }, [])

  const seamlessSectionRef = useRef(null)
  const firstRowRef = useRef(null)
  const secondRowRef = useRef(null)

  useEffect(() => {
    // ... (rest of your useEffect code - card animations, etc.)
    const seamlessSection = seamlessSectionRef.current
    const firstRow = firstRowRef.current
    const secondRow = secondRowRef.current

    if (seamlessSection && firstRow && secondRow) {
      gsap.to(firstRow, {
        xPercent: 10,
        scrollTrigger: {
          trigger: seamlessSection,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
          // markers: true,
        },
      })

      gsap.to(secondRow, {
        xPercent: -10,
        scrollTrigger: {
          trigger: seamlessSection,
          start: "top center",
          end: "bottom center",
          scrub: 1.5,
          // markers: true,
        },
      })
    }
  }, [])

  useEffect(() => {
    const cardA = cardARef.current
    const cardB = cardBRef.current
    const cardC = cardCRef.current
    const cardD = cardDRef.current
    const cardE = cardERef.current
    const grid = gridRef.current
    const featuresSection = featuresSectionRef.current

    if (cardA && cardB && cardC && cardD && cardE && grid && featuresSection) {
      // Set initial state for cards D and E
      gsap.set([cardD, cardE], { yPercent: 100, opacity: 0 })

      // Animate cards D and E together
      ScrollTrigger.batch([cardD, cardE], {
        start: "top bottom-=100", // Start when the top of the first card hits the bottom of the viewport
        onEnter: (batch) => {
          gsap.to(batch, {
            yPercent: 0, // Slide up to their normal position
            opacity: 1, // Fade in
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.2, // Stagger the animation slightly
          })
        },
        onLeaveBack: (batch) => {
          gsap.to(batch, {
            yPercent: 100, // Slide down below the viewport
            opacity: 0, // Fade out
            duration: 0.8,
            ease: "power2.in",
            stagger: 0.2,
          })
        },
        // markers: true,
      })
    }
  }, [])
  const [imeiNumber, setImeiNumber] = useState("")
  const [searchError, setSearchError] = useState("")
  const navigate = useNavigate()
  const handleGetStartedClick = () => {
    navigate("/login") // Call navigate inside the handler
  }
  const handleImeiChange = (event) => {
    setImeiNumber(event.target.value)
    setSearchError("") // Clear previous error
  }

  const handleSearch = async () => {
    if (!imeiNumber) {
      setSearchError("Please enter an IMEI number.")
      return
    }

    try {
      const response = await axios.get(`${API_URL}/api/warranty/find-by-imei/${imeiNumber}`)
      console.log(response.data.data)
      if (response.data.success) {
        const warranty = response.data.data
        if (warranty) {
          setShowImeiPopup(false) // Close popup on success
          navigate("/warranty-details", { state: { warranty } })
        } else {
          setSearchError("No warranty found for this IMEI number.")
        }
      } else {
        setSearchError(response.data.message)
      }
    } catch (error) {
      console.error("Error searching for warranty:", error)
      setSearchError("An error occurred while searching. Please try again later.")
      setWarrantyDetails(null) // Clear warranty details on error
    }
  }
  const stats = [
    { value: "80K+", label: "TRUSTED CUSTOMERS" },
    { value: "72+", label: "SHOP" },
    { value: "70K+", label: "ACTIVE CLAIMS" },
    { value: "3+", label: "BRANCHES" }, // Note: "BRANCES" in image appears to be a typo for "BRANCHES"
  ]

  const reviews = [
    {
      name: "Ravi Sharma",
      image: "/pfp1.jpg",
      text: "Mobikoo saved my day when I accidentally dropped my phone. The claims process was so quick and easy. Highly recommend!",
    },
    {
      name: "Priya Mehta",
      image: "/pfp3.jpg",
      text: "Excellent service! Mobikoo's affordable plans and comprehensive coverage give me peace of mind knowing my phone is always protected.",
    },
    {
      name: "Anil Kapoor",
      image: "/pfp2.jpg",
      text: "Partnering with Mobikoo has been great for my business. My customers love the added security, and I've seen an increase in sales.",
    },
    {
      name: "Sneha Patil",
      image: "/pfp4.jpg",
      text: "I was skeptical at first, but Mobikoo's customer support is fantastic. They guided me through every step when I needed to file a claim.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <header className="w-full py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8L16 4L24 8L16 12L8 8Z" fill="white" />
                <path d="M8 8V16L16 20V12L8 8Z" fill="white" />
                <path d="M16 12V20L24 16V8L16 12Z" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-300">MOBIKOO.COM</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-white">
                Features
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Pricing
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                Contact Us
              </a>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
                <a href="/login">
                  <span className="text-gray-300">Log In</span>
                </a>
              </div>
            </div>
          </div>



          <div className="flex items-center gap-4">
            <Link to={"/direct-warranty-search"}><button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              My Direct Warranties
            </button></Link>
            {/* IMEI Search Button */}
            <button
              onClick={() => setShowImeiPopup(true)}
              className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              IMEI Search
            </button>

            <button
              onClick={handleGetStartedClick}
              className="bg-transparent text-white font-semibold py-2 px-6 border-2 border-white rounded-full hover:bg-white hover:text-black transition-all"
            >
              GET STARTED
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-gray-900 rounded-lg">
            <div className="flex flex-col space-y-4 px-4">
              <a href="#" className="text-gray-300 hover:text-white py-2">
                Features
              </a>
              <a href="#" className="text-gray-300 hover:text-white py-2">
                Pricing
              </a>
              <a href="#" className="text-gray-300 hover:text-white py-2">
                Contact Us
              </a>
              <a href="/login" className="text-gray-300 hover:text-white py-2">
                Log In
              </a>
              <button
                onClick={() => {
                  setShowImeiPopup(true)
                  setMobileMenuOpen(false)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-left"
              >
                IMEI Search
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center">
        <div className="relative">
          {/* Background Image - Circuit Board */}
          {/* Background Image - Circuit Board */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Video Background */}
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/mobikoo-bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-20 md:py-32">
            <h1 className="text-6xl md:text-8xl font-bold mb-4">MOBIKOO</h1>
            <h2 className="text-2xl md:text-4xl font-light mb-8 max-w-2xl">
              Your Phone's Best Friend in Times of Trouble
            </h2>
            <h2 className="text-2xl md:text-5xl font-bold mb-8">
              {currentFeature}
              <span className="animate-pulse">|</span>
            </h2>
          </div>
        </div>
        {/* Search Section */}
      </main>
      <div className="w-full px-4 md:px-6 py-12">
        <DeviceProtectionForm />
      </div>

      <section ref={featuresSectionRef} className="px-6 mt-20 py-16 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Feature Card A */}
          <div
            ref={cardARef}
            className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/featureone.jpg" // Path to your image in the public folder
                alt="Feature A"
                className="w-full h-full object-cover"
              />
            </div>
            {/* ... (Card A content) */}
            <div className="absolute top-6 left-6 text-4xl font-light text-gray-400">A</div>

            <div className="mt-12">
              <h3 className="text-xl font-bold mb-2 underline">Affordable Plans</h3>
              <p className="font-extrabold z-10 text-white">
                offers budget-friendly insurance options to ensure that everyone can afford comprehensive mobile
                protection.
              </p>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-10">
              <div className="w-full h-full bg-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-30"
                >
                  <path d="M80 40 L120 40 L120 160 L80 160 Z" stroke="white" strokeWidth="2" />
                  <path d="M50 70 L150 70" stroke="white" strokeWidth="2" />
                  <path d="M50 140 L150 140" stroke="white" strokeWidth="2" />
                  <path d="M90 170 L110 170 L110 180 L90 180 Z" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Card B */}
          <div
            ref={cardBRef}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/featuretwo.jpg" // Path to your image in the public folder
                alt="Feature A"
                className="w-full h-full object-cover"
              />
            </div>
            {/* ... (Card B content) */}
            <div className="absolute top-6 left-6 text-4xl font-light text-gray-400">B</div>

            <div className="mt-12">
              <h3 className="text-xl font-bold mb-2 underline">Easy Claims Process</h3>
              <p className="font-bold text-white">
                We have designed a straightforward and efficient claims process to make it easy for customers to get
                their issues resolved quickly.
              </p>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="16" cy="8" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Card C */}
          <div
            ref={cardCRef}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden relative p-6 h-96"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/featurethree.jpg" // Path to your image in the public folder
                alt="Feature A"
                className="w-full h-full object-cover"
              />
            </div>
            {/* ... (Card C content) */}
            <div className="absolute top-6 left-6 text-4xl font-light text-gray-400">C</div>

            <div className="mt-12">
              <h3 className="text-xl font-bold mb-2 underline">Fast Activation</h3>
              <p className="font-bold text-white">
                Insurance coverage activates within 48 hours of purchase, ensuring that your mobile is protected
                quickly.
              </p>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row (Partial) */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Feature Card D (Partial) */}
          <div
            ref={cardDRef}
            className="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl overflow-hidden relative p-6 h-96"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/featurefour.jpg" // Path to your image in the public folder
                alt="Feature A"
                className="w-full h-full object-cover"
              />
            </div>
            {/* ... (Card D content) */}
            <div className="absolute top-6 left-6 text-4xl font-light text-gray-400">D</div>
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-2 underline">Transparent Terms</h3>
              <p className="text-white font-bold">
                Our insurance terms and conditions are clear and easy to understand, with no hidden clauses.
              </p>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-10">
              <div className="w-full h-full bg-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-30"
                >
                  <path d="M80 40 L120 40 L120 160 L80 160 Z" stroke="white" strokeWidth="2" />
                  <path d="M50 70 L150 70" stroke="white" strokeWidth="2" />
                  <path d="M50 140 L150 140" stroke="white" strokeWidth="2" />
                  <path d="M90 170 L110 170 L110 180 L90 180 Z" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Card E (Partial) */}
          <div
            ref={cardERef}
            className="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-3xl overflow-hidden relative p-6 h-96"
          >
            <div className="absolute inset-0 z-0 opacity-20">
              <img
                src="/featurefive.jpg" // Path to your image in the public folder
                alt="Feature A"
                className="w-full h-full object-cover"
              />
            </div>
            {/* ... (Card E content) */}
            <div className="absolute top-6 left-6 text-4xl font-light text-gray-400">E</div>
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-2 underline">High-Quality Service</h3>
              <p className="font-bold text-white">
                We provide professional repair and replacement services to maintain the performance and longevity of
                your device.
              </p>
            </div>

            <div className="absolute bottom-6 left-6">
              <div className="bg-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>

            <div className="absolute inset-0 z-0 opacity-10">
              <div className="w-full h-full bg-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-30"
                >
                  <path d="M80 40 L120 40 L120 160 L80 160 Z" stroke="white" strokeWidth="2" />
                  <path d="M50 70 L150 70" stroke="white" strokeWidth="2" />
                  <path d="M50 140 L150 140" stroke="white" strokeWidth="2" />
                  <path d="M90 170 L110 170 L110 180 L90 180 Z" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seamless User Experience Section */}
      <section ref={seamlessSectionRef} className="overflow-hidden px-6 py-16 bg-black">
        {/* ... (rest of your seamless section code - header, etc.) */}
        <div className="relative w-full h-48 mb-16 rounded-lg overflow-hidden">
          <img
            src="/sux.jpg" // Path to your image in the public folder
            alt="Seamless User Experience"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-opacity-30"></div>
          <div className="absolute inset-0 flex items-center px-8">
            <h2 className="text-5xl font-light text-white">
              {" "}
              {/* Increased text size */}
              Seamless User Experience
            </h2>
          </div>
        </div>
        {/* Feature Grid - First Row */}
        <div ref={firstRowRef} className="flex justify-start w-full">
          <div className="w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-6">
            {/* Feature 1 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 1</h4>
              </div>
              <div className="bg-indigo-600 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">Cost-Effective Plans</h3>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 2</h4>
              </div>
              <div className="bg-gray-700 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">Complete Coverage</h3>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 3</h4>
              </div>
              <div className="bg-indigo-600 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">Quick Claims</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid - Second Row */}
        <div ref={secondRowRef} className="flex justify-end w-full">
          <div className="w-[90%] grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 4 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 4</h4>
              </div>
              <div className="bg-gray-700 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">Rapid Activation</h3>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 5</h4>
              </div>
              <div className="bg-indigo-600 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">Peaceful Assurance</h3>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gray-800 py-3 px-4">
                <h4 className="text-sm font-bold text-gray-400">FEATURE 6</h4>
              </div>
              <div className="bg-gray-700 py-6 px-4">
                <h3 className="text-2xl font-medium text-white">High-Quality Service</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col w-full text-white">
        {/* Top banner with "About us" */}
        <div className="relative w-full h-64">
          <div className="relative w-full h-48 mt-16 mb-8 rounded-lg overflow-hidden">
            <img
              src="/ux.jpg" // Path to your image in the public folder
              alt="Seamless User Experience"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0"></div>
            <div className="absolute inset-0 flex items-center px-8">
              <h2 className="text-5xl font-light text-white">
                {" "}
                {/* Increased text size */}
                About Us
              </h2>
            </div>
          </div>
        </div>

        {/* Content section with description and phone images */}
        <div className="flex flex-col md:flex-row">
          {/* Left text section */}
          <div className="w-full p-10 flex items-center h-auto relative" style={{ backgroundColor: "#360A3F" }}>
            <div className="relative inset-0 opacity-30" style={{ backgroundColor: "purple" }}></div>
            <div className="z-10">
              <p className="text-lg leading-relaxed text-white mb-6">
                At Mobikoo, we empower mobile retailers with smart extended warranty solutions that boost revenue & cut
                costs.
              </p>
              <h3 className="text-2xl font-bold text-white mb-4">How Mobikoo Saves You Lakhs?</h3>
              <ul className="list-disc list-inside text-lg leading-relaxed text-white mb-6">
                <li>
                  <span className="text-yellow-500 font-bold">Zero Repair Bills:</span> We cover 100% repair costs
                  (saves ₹3-5 lakhs/year).
                </li>
                <li>
                  <span className="text-yellow-500 font-bold">Extra Income:</span> Earn ₹500-1,000/warranty (20+ sales =
                  ₹10,000-20,000/month).
                </li>
                <li>
                  <span className="text-yellow-500 font-bold">Customer Lock-in:</span> Reduce churn by 40% with warranty
                  loyalty.
                </li>
              </ul>
              <p className="text-lg leading-relaxed text-white mb-4">Trusted by 5,000+ shops across India.</p>
              <p className="text-lg leading-relaxed text-white mb-6">
                📞 Join today & start saving! <span className="font-bold">+91 9699539240</span> |{" "}
                <a href="mailto:support@mobikoo.com" className="underline">
                  support@mobikoo.com
                </a>
              </p>
              <h3 className="text-2xl font-bold text-white mb-4">Why Mobikoo?</h3>
              <ul className="list-disc list-inside text-lg leading-relaxed text-white">
                <li>
                  <span className="text-yellow-500 font-bold">Zero Risk:</span> No upfront costs.
                </li>
                <li>
                  <span className="text-yellow-500 font-bold">Pan-India Network:</span> Fast claim settlements.
                </li>
                <li>
                  <span className="text-yellow-500 font-bold">Easy Onboarding:</span> Start earning in 24hrs.
                </li>
              </ul>
            </div>
          </div>

          {/* Right image section */}
        </div>
      </div>

      <SuccessStories />


      <WhyChooseMobikoo />

      {/* Partners Sections */}

      <div className="w-full py-32 my-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-50 mb-12">Our Clients</h2>

          <div class="slider my-10">
            <div className="slide-track">
              {partners.concat(partners).map((partner, index) => (
                <div
                  key={index}
                  className="
                bg-white 
                rounded-xl 
                shadow-md 
                hover:shadow-lg 
                transition-all 
                duration-300 
                ease-in-out
                w-50 
                h-50 
                flex 
                items-center 
                justify-center 
                p-6
                hover:scale-105
              "
                >
                  <img
                    src={partner.src || "/placeholder.svg"}
                    alt={partner.alt}
                    className="
                  w-50   
                  hover:grayscale-0 
                  transition-all 
                  duration-300 
                  ease-in-out
                "
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-gray-900 to-black text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-6 mx-auto ring-4 ring-gray-700/50 group-hover:ring-blue-500/50 transition-all duration-300">
                  <img
                    src={review.image || "/placeholder.svg"}
                    alt={`${review.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center text-blue-400 mb-4">
                  <Quote size={20} className="opacity-60" />
                  <Quote size={20} className="opacity-60 -ml-2" />
                </div>

                <h3 className="text-blue-400 text-lg font-semibold mb-4 text-center group-hover:text-blue-300 transition-colors">{review.name}</h3>

                <p className="text-gray-300 text-center text-sm leading-relaxed group-hover:text-gray-200 transition-colors">{review.text}</p>

                {/* Rating stars */}
                <div className="flex justify-center mt-4 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-black to-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with background image */}
          <div className="relative w-full h-40 mb-12 rounded-2xl overflow-hidden">
            <img src="/api/placeholder/1200/200" alt="Mobile phone repair" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
            <div className="absolute inset-0 flex items-center px-8">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Our Growing Impact
              </h2>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                {/* Upper section with large number */}
                <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-8 flex items-center justify-center group-hover:from-blue-900/30 group-hover:to-purple-900/30 transition-all duration-300">
                  <span className="text-5xl md:text-6xl font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                    {stat.value}
                  </span>
                </div>

                {/* Lower section with label */}
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 flex items-center group-hover:from-gray-700/50 group-hover:to-gray-800/50 transition-all duration-300">
                  <ArrowRight className="text-blue-400 mr-2 group-hover:text-blue-300 transition-colors duration-300" size={16} />
                  <span className="text-gray-300 text-sm font-medium tracking-wider group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="w-full bg-black text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Product Column */}
          <div>
            <h3 className="text-white text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.url} className="hover:font-bold text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.url} target="_blank" className="hover:text-gray-300 transition-colors" rel="noreferrer">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional columns can be added as needed */}
          <div className="lg:col-span-2">
            {/* Empty space or could contain newsletter signup, social media links, etc. */}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-800">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} Mobikoo. All rights reserved.</p>
        </div>
      </footer>
      {/* IMEI Search Popup */}
      {showImeiPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowImeiPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white mb-4">Search Warranty by IMEI</h3>

            <div className="relative">
              <input
                type="text"
                id="imei-popup"
                name="imei"
                value={imeiNumber}
                onChange={handleImeiChange}
                placeholder="Enter IMEI Number"
                className="w-full px-4 py-3 text-white bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  handleSearch()
                  if (!searchError) {
                    setShowImeiPopup(false)
                  }
                }}
                className="mt-4 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none"
              >
                Search
              </button>
            </div>

            {searchError && <p className="mt-2 text-red-500 text-sm">{searchError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
