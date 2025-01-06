'use client'

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, BarChart, TrendingUp, Activity, Brain, LineChartIcon as ChartLineUp, ArrowRight, DollarSign, Globe, Users, CheckIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Day Trader",
    quote: "The AI-powered indicators have significantly improved my trading accuracy. I've seen a 30% increase in my win rate since using this platform."
  },
  {
    name: "Amit Jain",
    role: "Founder",
    quote: "The real-time market sentiment analysis has been a game-changer for my forex trading strategy. It's like having a team of analysts working for me 24/7."
  },
  {
    name: "Emily Rodriguez",
    role: "Stock Trader",
    quote: "As a stock trader, the volatility can be overwhelming. This platform's AI predictions have helped me navigate the market with much more confidence and success."
  }
];

export default function Home() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const indicatorRef = useRef(null);
  const videoRef = useRef(null);
  const testimonialRef = useRef(null);
  const statsRef = useRef(null);
  const pricingRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Hero Animation
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: "power3.out"
      });

      // Features Animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2
      });

      // Indicator Section Animation
      gsap.from(indicatorRef.current.children, {
        scrollTrigger: {
          trigger: indicatorRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        scale: 0.9,
        duration: 1,
        stagger: 0.2
      });

      // Video Section Animation
      gsap.from(videoRef.current, {
        scrollTrigger: {
          trigger: videoRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        x: -100,
        duration: 1
      });

      // Testimonial Animation
      gsap.from(testimonialRef.current.children, {
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2
      });

      // Stats Animation
      gsap.from(statsRef.current.children, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2
      });

      // Pricing Animation
      gsap.from(pricingRef.current.children, {
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2
      });

      // CTA Animation
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top center+=100",
        },
        opacity: 0,
        scale: 0.9,
        duration: 1
      });
    }
  }, []);

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced artificial intelligence algorithms analyze market patterns and trends in real-time",
      icon: <Brain className="h-12 w-12 text-[#39FF14]" />
    },
    {
      title: "Smart Indicators",
      description: "Custom-built technical indicators that adapt to market conditions",
      icon: <ChartLineUp className="h-12 w-12 text-[#39FF14]" />
    },
    {
      title: "Real-time Alerts",
      description: "Instant notifications for potential trading opportunities and market movements",
      icon: <Activity className="h-12 w-12 text-[#39FF14]" />
    },
    {
      title: "Performance Tracking",
      description: "Comprehensive analytics to monitor your trading performance",
      icon: <TrendingUp className="h-12 w-12 text-[#39FF14]" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-950">
      {/* Hero Section */}
      <div ref={heroRef} className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[46.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-300 to-[#39FF14] opacity-20" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-green-500">
              AI-Powered Trading Solutions
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Advanced trading indicators and analysis powered by artificial intelligence. Make smarter trading decisions with our cutting-edge technology.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`}>
                <Button className="bg-[#39FF14] hover:bg-black text-black hover:text-[#39FF14] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#39FF14]/50">
                  Get started
                </Button>
              </Link>
              <Link href={`${process.env.NEXT_PUBLIC_API_URL}/about`} className="text-sm font-semibold leading-6 text-white hover:text-[#39FF14] transition-colors">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div ref={featuresRef} className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powerful Trading Features
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Everything you need to make informed trading decisions
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card   hover:scale-105 bg-gray-950 border border-gray-700 hover:border-[#39FF14]">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* AI Candle Indicators Section */}
      <div ref={indicatorRef} className="py-24 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              AI Candle Indicators
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Advanced technical analysis powered by artificial intelligence
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">Smart Pattern Recognition</CardTitle>
                <CardDescription className="text-gray-300">
                  Our AI algorithms detect complex chart patterns with high accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <LineChart className="h-32 w-32 text-[#39FF14]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">Market Sentiment Analysis</CardTitle>
                <CardDescription className="text-gray-300">
                  Real-time analysis of market sentiment and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <BarChart className="h-32 w-32 text-[#39FF14]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">AI-Powered Predictions</CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced forecasting models for potential market movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <TrendingUp className="h-32 w-32 text-[#39FF14]" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12 text-center">
            <Link href="https://aicandle.in">
              <Button className="bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#39FF14]/50">
                Explore AI Candle Indicators <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div ref={videoRef} className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              See Our Platform in Action
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Watch how our AI-powered trading indicators work
            </p>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:border-[#39FF14] transition-all duration-300">
            <iframe 
              className="absolute w-full h-full"
              src="https://www.youtube.com/embed/lkUFWXhpMsE?si=kg7y3Mx8tcfhz_LC"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div ref={testimonialRef} className="py-24 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What Our Users Say
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Hear from traders who have transformed their strategies with our AI-powered platform
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-white">{testimonial.name}</CardTitle>
                      <CardDescription className="text-gray-300">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="py-24 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Impact in the Market
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              See how our AI-powered platform is revolutionizing trading
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-[#39FF14]" />
              <p className="mt-2 text-3xl font-bold text-white">Great</p>
              <p className="text-lg font-medium text-gray-300">Trading Volume</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-[#39FF14]" />
              <p className="mt-2 text-3xl font-bold text-white">High</p>
              <p className="text-lg font-medium text-gray-300">Active Traders</p>
            </div>
            <div className="text-center">
              <Globe className="mx-auto h-12 w-12 text-[#39FF14]" />
              <p className="mt-2 text-3xl font-bold text-white">Wide</p>
              <p className="text-lg font-medium text-gray-300">States Served</p>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-[#39FF14]" />
              <p className="mt-2 text-3xl font-bold text-white">High</p>
              <p className="text-lg font-medium text-gray-300">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div ref={pricingRef} className="py-24 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Select the perfect plan for your trading needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">Monthly</CardTitle>
                <CardDescription className="text-gray-300"> To start trading with</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">Rs 5000<span className="text-lg font-normal text-gray-300">/month</span></p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Basic AI indicators</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Daily market analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Monthly support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Email support</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#39FF14]/50">Get Started</Button>
              </CardContent>
            </Card>
            <Card className="border-[#39FF14] bg-gray-800 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">Enterprise</CardTitle>
                <CardDescription className="text-gray-300">For Enterprises</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">Custom<span className="text-lg font-normal text-gray-300"></span></p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Advanced AI indicators</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Real-time market analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">24/7 priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Custom alerts</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#39FF14]/50">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border border-gray-700 hover:border-[#39FF14] transition-all duration-300 transform hover:scale-105">
              <CardHeader>
                <CardTitle className="text-white">Yearly</CardTitle>
                <CardDescription className="text-gray-300">To reach your trading goals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">Rs 31000/year</p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">All Pro features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Custom AI indicators</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Dedicated Mentor</span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#39FF14] mr-2" />
                    <span className="text-gray-300">Yearly support</span>
                  </li>
                </ul>
                <Button className="w-full mt-8 bg-[#39FF14] text-black hover:bg-black hover:text-[#39FF14] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#39FF14]/50">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="py-24 bg-[#39FF14] opacity-80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Ready to Transform Your Trading?
          </h2>
          <p className="mt-6 text-xl leading-8 text-green-900">
            Join thousands of successful traders using our AI-powered platform
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="https://aicandle.in" className="text-sm font-semibold leading-6 text-black hover:text-green-900 transition-colors">
              View Pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}