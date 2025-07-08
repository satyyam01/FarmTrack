import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  HeartPulse, 
  TrendingUp, 
  Users, 
  Shield, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">FarmTrack</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 font-semibold text-base px-3 py-1 rounded-full">Pro</Badge>
            <span className="text-green-700 font-semibold">Now with AI Assistant!</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Farm Operations with
            <span className="text-green-600"> FarmTrack</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive farm management platform for tracking animals, yields, health records, and night returns. <span className="font-semibold text-green-700">Upgrade to Pro</span> for advanced features, multi-role management, and your own AI assistant.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login?tab=signup">
              <Button size="lg" className="text-lg px-8 py-3 bg-green-600 hover:bg-green-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login?tab=signup">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-green-600 text-green-700 hover:bg-green-50">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Farm
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From animal tracking to yield management, FarmTrack provides all the tools you need to run your farm efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Animal Management</CardTitle>
              <CardDescription>
                Track all your animals with detailed profiles, health records, and breeding history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Individual animal profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Health monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Breeding records
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Yield Tracking</CardTitle>
              <CardDescription>
                Monitor milk, egg, and other product yields with detailed analytics and reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Daily yield recording
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Performance analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Trend analysis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <HeartPulse className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Health Records</CardTitle>
              <CardDescription>
                Comprehensive health monitoring with checkups, medications, and treatment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Medical checkups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Medication tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Treatment history
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Night Returns</CardTitle>
              <CardDescription>
                Track which animals return at night and monitor grazing patterns effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Return tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Grazing patterns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Missing animal alerts
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure access control with different permission levels for farm owners, workers, and veterinarians.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Farm owner controls
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Worker permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Veterinarian access
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Farm Analytics</CardTitle>
              <CardDescription>
                Comprehensive dashboard with real-time insights into your farm's performance and productivity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Data visualization
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pro Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 font-semibold text-base px-3 py-1 rounded-full">Pro</Badge>
            <span className="text-green-700 font-semibold">Premium</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Unlock FarmTrack Pro</h2>
          <p className="text-lg text-gray-600">Supercharge your farm with advanced features designed for growing operations and ambitious farmers.</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-yellow-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Badge variant="secondary" className="bg-yellow-400/80 text-yellow-900 font-semibold px-2 py-1">Pro</Badge>
                FarmTrack Pro Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-base text-gray-700 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Higher animal limits for large farms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Multi-role management (owners, workers, veterinarians)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>RAG AI Assistant for instant farm insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Advanced analytics & reporting</span>
                </li>
              </ul>
              <div className="mt-8 text-center">
                <Link to="/login?tab=signup">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-8 py-3 rounded-full shadow-lg">Upgrade to Pro</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Highlight */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-green-50 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <span className="text-2xl">💬</span>
                AI Farm Assistant
              </CardTitle>
              <CardDescription>Get instant answers, smart suggestions, and farm insights 24/7 with your own AI-powered assistant (Pro only).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg shadow p-4 mb-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💬</span>
                  <span className="font-semibold text-blue-700">FarmTrack Assistant</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-left text-blue-900 text-sm mb-2">
                  <span className="font-semibold">"Hi! I am your FarmTrack Assistant. How can I help you today?"</span>
                </div>
                <ul className="list-disc list-inside text-blue-900 text-sm ml-2">
                  <li>Ask about animal health, yields, or farm stats</li>
                  <li>Get step-by-step guidance for farm tasks</li>
                  <li>Receive smart alerts and recommendations</li>
                </ul>
              </div>
              <div className="text-center">
                <Link to="/login?tab=signup">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">Try the AI Assistant</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farm Management?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who have already improved their operations with FarmTrack.
          </p>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              🚀 Supercharge Your Farm Today!
            </h3>
            {/* <p className="text-lg text-green-100 max-w-xl mx-auto">
              Experience the future of farm management with cutting-edge technology, real-time insights, and unparalleled efficiency. Join the revolution and take your farm operations to the next level!
            </p> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-green-50 via-white to-blue-50 shadow-inner mt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">&copy; {new Date().getFullYear()} FarmTrack. All rights reserved.</div>
          <div className="flex flex-wrap gap-3 text-sm justify-center md:justify-end">
            <Link to="/privacy-policy" className="px-4 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-green-100 hover:text-green-700 transition font-medium">Privacy Policy</Link>
            <Link to="/terms" className="px-4 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-green-100 hover:text-green-700 transition font-medium">Terms and Conditions</Link>
            <Link to="/cancellation-refund" className="px-4 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-green-100 hover:text-green-700 transition font-medium">Cancellation & Refund</Link>
            <Link to="/shipping-delivery" className="px-4 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-green-100 hover:text-green-700 transition font-medium">Shipping & Delivery</Link>
            <Link to="/contact" className="px-4 py-1 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-green-100 hover:text-green-700 transition font-medium">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 