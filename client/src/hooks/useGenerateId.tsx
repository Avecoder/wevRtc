import { useEffect, useRef } from "react"

export const useGenerateId = () => {
  const userIdRef = useRef<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('userSoketId')
    if (stored) {
      userIdRef.current = Number(stored)
    } else {
      const unix = Date.now()
      localStorage.setItem('userSoketId', `${unix}`)
      userIdRef.current = unix
    }
  }, [])

  const getUserId = () => userIdRef.current

  return { getUserId }
}
