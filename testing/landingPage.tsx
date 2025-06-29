import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  Shield, 
  TrendingUp, 
  Users, 
  Database, 
  Smartphone, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Award,
  Globe,
  BarChart3,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Cpu className="h-8 w-8 text-green-600" />,
      title: "RFID Technology",
      description: "Advanced RFID-based tracking system for real-time livestock monitoring and management."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Health Monitoring",
      description: "Comprehensive health records, medication tracking, and veterinary checkup management."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "Yield Analytics",
      description: "Track milk and egg production with detailed analytics and performance insights."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Team Collaboration",
      description: "Multi-user access with role-based permissions for farm workers and veterinarians."
    },
    {
      icon: <Database className="h-8 w-8 text-indigo-600" />,
      title: "Data Management",
      description: "Centralized database for all farm operations with secure cloud storage."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-pink-600" />,
      title: "Mobile Access",
      description: "Access your farm data anywhere with our responsive mobile-friendly interface."
    }
  ];

  const benefits = [
    "Real-time livestock tracking and monitoring",
    "Automated health record management",
    "Production yield optimization",
    "Cost reduction through efficient management",
    "Compliance and regulatory reporting",
    "Data-driven decision making"
  ];

  const stats = [
    { number: "500+", label: "Farms Using FarmTrack" },
    { number: "10K+", label: "Animals Tracked" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "24/7", label: "Support Available" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Dairy Farm Owner",
      content: "FarmTrack has revolutionized how we manage our dairy operations. The RFID tracking saves us hours every day.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Poultry Farm Manager",
      content: "The yield analytics feature helped us increase egg production by 15% in just three months.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Veterinarian",
      content: "As a vet, I love how easy it is to access health records and track medication schedules.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Cpu className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">FarmTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Next-Gen Farm Management
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Livestock
              <span className="text-green-600"> Tracking</span>
              <br />
              Made Simple
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your farm operations with RFID-based livestock tracking. Monitor health, 
              track yields, and manage your entire farm from anywhere with our intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => navigate('/login')} className="text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-8 text-white text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="space-y-4">
                  <Activity className="h-12 w-12 mx-auto" />
                  <h3 className="text-xl font-semibold">Real-time Monitoring</h3>
                  <p className="text-green-100">Track every animal's location and status instantly</p>
                </div>
                <div className="space-y-4">
                  <BarChart3 className="h-12 w-12 mx-auto" />
                  <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                  <p className="text-green-100">Comprehensive insights and performance metrics</p>
                </div>
                <div className="space-y-4">
                  <Globe className="h-12 w-12 mx-auto" />
                  <h3 className="text-xl font-semibold">Cloud-Based</h3>
                  <p className="text-green-100">Access your farm data from anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Farm
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              FarmTrack provides comprehensive tools for modern farm management, 
              from livestock tracking to yield optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose FarmTrack?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" className="mt-8" onClick={() => navigate('/login')}>
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <Award className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Trusted by Leading Farms
                </h3>
                <p className="text-gray-600 mb-6">
                  Join hundreds of farms that have transformed their operations with FarmTrack
                </p>
                <div className="flex justify-center items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from farmers who trust FarmTrack
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers who have already modernized their operations with FarmTrack
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-green-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-6 w-6 text-green-400" />
                <span className="text-lg font-bold">FarmTrack</span>
              </div>
              <p className="text-gray-400">
                Modern farm management made simple with RFID technology and intelligent analytics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Status</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FarmTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}