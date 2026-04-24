import { Link } from "react-router-dom";
import { Youtube, Instagram, Linkedin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ivory text-ink pt-32 pb-16 border-t-2 border-ink/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        
        {/* TOP SECTION: The Brand Identity (Masthead) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-32">
          <div className="max-w-md">
            {/* The Logo Re-created per Flyer Aesthetic */}
            <Link to="/" className="flex flex-col mb-10 group">
              <span className="text-4xl font-sans font-bold tracking-tighter leading-none mb-2">II</span>
              <span className="text-[11px] tracking-[0.5em] font-black uppercase text-gold group-hover:text-ink transition-colors">
                INTELLECTUAL INTIMACY
              </span>
            </Link>
            
            <p className="text-base font-medium leading-relaxed tracking-wide uppercase">
              meaningful human connection is formed <br className="hidden md:block" /> 
              through honest, thoughtful, and <br className="hidden md:block" />
              intellectually engaged dialogue.
            </p>
          </div>

          {/* SOCIAL REGISTRY */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: 'YOUTUBE', url: 'https://www.youtube.com/@Intellectual-Intimacy' },
              { label: 'INSTAGRAM', url: '#' },
              { label: 'LINKEDIN', url: 'https://www.linkedin.com/company/intellectualintimacy/' },
              { label: 'CONTACT', url: '/contact' }
            ].map((social) => (
              <a 
                key={social.label} 
                href={social.url} 
                className="text-xs tracking-[0.3em] font-black uppercase flex items-center gap-2 hover:text-gold transition-colors"
              >
                {social.label} <ArrowUpRight size={14} strokeWidth={3} />
              </a>
            ))}
          </div>
        </div>

        {/* MIDDLE SECTION: Navigation Ledger */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 border-t-2 border-ink pt-16 mb-24">
          
          {/* NAVIGATION */}
          <div>
            <h4 className="text-xs tracking-[0.4em] text-gold uppercase font-black mb-10">
              NAVIGATE
            </h4>
            <ul className="space-y-6">
              {['Home', 'About', 'Events', 'Support'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="text-sm font-bold tracking-widest uppercase hover:text-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ARCHIVE */}
          <div>
            <h4 className="text-xs tracking-[0.4em] text-gold uppercase font-black mb-10">
              ARCHIVE
            </h4>
            <ul className="space-y-6">
              {['Blog', 'Podcast', 'Dialogue', 'Resources'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-sm font-bold tracking-widest uppercase hover:text-gold transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* LOCATION (Flyer Detail) */}
          <div className="md:col-span-2 lg:col-span-2 lg:text-right">
             <h4 className="text-xs tracking-[0.4em] text-gold uppercase font-black mb-10">
              ESTABLISHED
            </h4>
            <p className="text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase leading-none">
              CAPE TOWN <br /> SOUTH AFRICA
            </p>
          </div>
        </div>

        {/* BOTTOM SECTION: Copyright & Legal */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-stone-200">
          <div className="flex items-center gap-6">
            <span className="text-[10px] tracking-[0.4em] font-black uppercase">
              © {currentYear} INTELLECTUAL INTIMACY
            </span>
            <div className="w-10 h-[1px] bg-gold/30"></div>
            <span className="text-[10px] tracking-[0.4em] text-gold uppercase font-black">
              WHERE IDEAS SHAPE REALITY
            </span>
          </div>
          
          <div className="flex gap-10">
            <Link to="/privacy" className="text-[10px] tracking-[0.4em] font-black uppercase hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[10px] tracking-[0.4em] font-black uppercase hover:text-gold transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}