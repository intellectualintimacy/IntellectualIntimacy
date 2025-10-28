import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DonationWidget() {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link
        to="/support"
        className="group flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
        <span className="font-medium">Support Us</span>
      </Link>
    </div>
  )
}