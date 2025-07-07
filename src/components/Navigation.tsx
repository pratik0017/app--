import { Link, useLocation } from "react-router-dom";
import { Video, MessageSquare, File, Monitor } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Home", path: "/", icon: null },
    { name: "WebCall", path: "/webcall", icon: Video },
    { name: "Chat", path: "/chat", icon: MessageSquare },
    { name: "File Sharing", path: "/file-sharing", icon: File },
    { name: "Smart Board", path: "/smart-board", icon: Monitor },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ConferenceHub
              </h1>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-elegant"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;