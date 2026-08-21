import { useEffect, useState } from 'react'

export default function useIsSmallDesktop() {
  const [isSmallDesktop, setIsSmallDesktop] = useState(window.innerWidth < 1550)

  useEffect(() => {
    const handleResize = () => {
      setIsSmallDesktop(window.innerWidth < 1550)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isSmallDesktop
}
