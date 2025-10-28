import { Link } from "react-router-dom";
import NewsletterForm from '../home/Newsletter'
import { Youtube, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-stone-100 dark:bg-stone-900 py-16 border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Main footer grid */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand / About */}
          <div className="md:col-span-2">
            <h3
              className="text-2xl mb-4 elegant-text font-light"
              style={{ fontFamily: "Crimson Pro, serif" }}
            >
              Intellectual Intimacy
            </h3>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-light text-sm mb-6">
              Cultivating meaningful dialogue and authentic human connection 
              through thoughtful gatherings and conversations.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.youtube.com/@Intellectual-Intimacy"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-footer"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="social-icon-footer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/intellectualintimacy/"
                className="social-icon-footer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-6 font-light">
              Navigate
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Events", path: "/events" },
                { name: "Support", path: "/support" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-stone-500 dark:text-stone-400 mb-6 font-light">
              Resources
            </h4>
            <ul className="space-y-3">
              {["Blog", "Podcast", "Newsletter", "FAQ"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors font-light"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-stone-200 dark:border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 dark:text-stone-400 text-sm font-light">
            © {new Date().getFullYear()} Intellectual Intimacy. Crafted with care.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors font-light"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors font-light"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
