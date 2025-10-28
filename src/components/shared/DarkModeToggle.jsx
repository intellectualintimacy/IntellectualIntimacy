import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function DarkToggle(){
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle(){
    document.documentElement.classList.toggle('dark')
    setDark(document.documentElement.classList.contains('dark'))
  }

  return (
    <button onClick={toggle} aria-label="Toggle theme" className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/6 transition">
      {dark ? <Sun /> : <Moon />}
    </button>
  )
}
