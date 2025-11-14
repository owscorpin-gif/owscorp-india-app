import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">OWSCORP</h3>
            <p className="text-sm text-muted-foreground">
              Online Web Solution & Corporation - Your trusted marketplace for digital solutions and AI-powered services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categories/all" className="text-muted-foreground hover:text-primary transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link to="/developer/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Developer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/categories/website" className="text-muted-foreground hover:text-primary transition-colors">
                  Websites
                </Link>
              </li>
              <li>
                <Link to="/categories/android" className="text-muted-foreground hover:text-primary transition-colors">
                  Android Apps
                </Link>
              </li>
              <li>
                <Link to="/categories/ios" className="text-muted-foreground hover:text-primary transition-colors">
                  iOS Apps
                </Link>
              </li>
              <li>
                <Link to="/categories/ai" className="text-muted-foreground hover:text-primary transition-colors">
                  AI Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-primary transition-colors">
                  Give Feedback
                </Link>
              </li>
              <li>
                <a href="mailto:support@owscorp.com" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OWSCORP - Online Web Solution & Corporation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
