import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageSquare, File, Monitor, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-conference.png"; // Adjust the path as necessary

const Index = () => {
  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal clear video conferencing with up to 100 participants",
      link: "/webcall",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "Instant Chat",
      description: "Real-time messaging and group conversations",
      link: "/chat",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: File,
      title: "File Sharing",
      description: "Secure document sharing and collaboration tools",
      link: "/file-sharing",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Monitor,
      title: "Smart Board",
      description: "Interactive whiteboard for visual collaboration",
      link: "/smart-board",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "--", label: "Active Users" },
    { number: "99.9%", label: "Uptime" },
    { number: "--", label: "Countries" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Connect, Collaborate, and 
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Create Together</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience seamless web conferencing with high-quality video calls, instant messaging, 
                file sharing, and interactive collaboration tools. All in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <Link to="/webcall">Start Meeting Now</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} // Ensure this path is correct
                alt="Web conferencing platform" 
                className="rounded-2xl shadow-elegant w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Connect
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful tools designed to make remote work and collaboration effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-card transition-all duration-300 hover:-translate-y-2 border-border">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-4">
                      {feature.description}
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <Link to={feature.link}>Explore</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl lg:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-primary mr-4" />
            <Shield className="w-12 h-12 text-secondary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Team Communication?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join millions of users who trust ConferenceHub for their daily collaboration needs.
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <Link to="/webcall">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;