'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  BarChart3,
  Zap,
  Brain,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Shield,
  Globe,
  Rocket,
  Star
} from 'lucide-react';

import DashboardClient from './dashboard-client';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}

const StatsCard = ({ title, value, change, icon, gradient, delay }: StatsCardProps) => (
  <div
    className={`glass card-hover p-6 relative overflow-hidden group animate-slide-in-left`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Background gradient overlay */}
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          {change}
        </span>
      </div>

      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
    </div>

    {/* Animated border effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
  </div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, gradient, delay }: FeatureCardProps) => (
  <div
    className="glass-intense card-hover p-6 group relative overflow-hidden animate-scale-in-bounce"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
        {title}
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default function HomePage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (showDashboard) {
    return <DashboardClient />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Animated cursor follow effect */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 pointer-events-none z-50 blur-sm transition-all duration-100 ease-out"
        style={{
          transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px)`,
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="floating absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl" />
          <div className="floating-reverse absolute top-40 right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-xl" />
          <div className="floating absolute bottom-20 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl" />
          <div className="floating-reverse absolute bottom-40 right-1/3 w-40 h-40 bg-emerald-500/10 rounded-full blur-xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6 animate-scale-in-bounce">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Ultra-Modern WhatsApp Dashboard</span>
            </div>

            <h1 className="text-display gradient-text-cosmic mb-6 animate-slide-in-left">
              Next-Gen WhatsApp
              <br />
              <span className="gradient-text-secondary">Automation Hub</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
              Experience the future of WhatsApp Business automation with AI-powered message classification,
              real-time analytics, and glassmorphism design that sets new standards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-scale-in-bounce" style={{ animationDelay: '400ms' }}>
              <button
                onClick={() => setShowDashboard(true)}
                className="btn-primary flex items-center gap-3 px-8 py-4 text-lg group hover:scale-105 transition-transform duration-300"
              >
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Launch Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button className="glass px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3 group hover:scale-105">
                <Star className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                View Demo
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatsCard
              title="Messages Processed"
              value="50K+"
              change="+23%"
              icon={<MessageSquare className="w-6 h-6" />}
              gradient="from-blue-500 to-purple-600"
              delay={600}
            />
            <StatsCard
              title="AI Accuracy"
              value="98.5%"
              change="+2.1%"
              icon={<Brain className="w-6 h-6" />}
              gradient="from-purple-500 to-pink-600"
              delay={700}
            />
            <StatsCard
              title="Response Time"
              value="< 1s"
              change="-15%"
              icon={<Zap className="w-6 h-6" />}
              gradient="from-emerald-500 to-blue-600"
              delay={800}
            />
            <StatsCard
              title="Active Users"
              value="2.3K"
              change="+45%"
              icon={<Users className="w-6 h-6" />}
              gradient="from-orange-500 to-red-600"
              delay={900}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-in-left">
            <h2 className="text-headline gradient-text mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powered by cutting-edge technology and designed for the future
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="AI-Powered Classification"
              description="Advanced machine learning algorithms automatically categorize and prioritize messages with 98.5% accuracy"
              gradient="from-purple-500 to-pink-600"
              delay={200}
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Real-Time Analytics"
              description="Comprehensive insights and metrics updated in real-time with beautiful visualizations and trends"
              gradient="from-blue-500 to-emerald-600"
              delay={300}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Lightning Fast"
              description="Ultra-optimized performance with response times under 1 second and seamless user experience"
              gradient="from-yellow-500 to-orange-600"
              delay={400}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Enterprise Security"
              description="Bank-level security with end-to-end encryption and compliance with global data protection standards"
              gradient="from-emerald-500 to-teal-600"
              delay={500}
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Global Scale"
              description="Built to handle millions of messages with auto-scaling infrastructure and 99.9% uptime guarantee"
              gradient="from-indigo-500 to-purple-600"
              delay={600}
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Smart Insights"
              description="Predictive analytics and actionable insights to optimize your WhatsApp business operations"
              gradient="from-rose-500 to-pink-600"
              delay={700}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-intense p-12 relative overflow-hidden card-hover animate-scale-in-bounce" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

            <div className="relative z-10">
              <h2 className="text-headline gradient-text-cosmic mb-6">
                Ready to Transform Your Business?
              </h2>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using our platform to revolutionize their WhatsApp communication
              </p>

              <button
                onClick={() => setShowDashboard(true)}
                className="btn-primary text-xl px-12 py-5 inline-flex items-center gap-4 group hover:scale-105 transition-transform duration-300"
              >
                <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                Experience the Future
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>

            {/* Animated particles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full floating"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${60 + Math.sin(i) * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}