import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ProfileCardInfo } from './ProfileInfo'

export function ProfileCard() {
  const ref = useRef(null)
  const [style, setStyle] = useState<React.CSSProperties>({})

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return

    const { clientX, clientY } = e
    const { width, height, x, y } = ref.current.getBoundingClientRect()
    const mouseX = Math.abs(clientX - x)
    const mouseY = Math.abs(clientY - y)
    const rotateMin = -10
    const rotateMax = 10
    const rotateRange = rotateMax - rotateMin

    const rotate = {
      x: rotateMax - (mouseY / height) * rotateRange,
      y: rotateMin + (mouseX / width) * rotateRange,
    }

    setStyle({
      transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
    })
  }, [])

  const onMouseLeave = useCallback(() => {
    setStyle({ transform: 'rotateX(0deg) rotateY(0deg)' })
  }, [])

  useEffect(() => {
    const { current } = ref
    if (!current) return

    current.addEventListener('mousemove', onMouseMove)
    current.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (!current) return
      current.removeEventListener('mousemove', onMouseMove)
      current.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [onMouseLeave, onMouseMove])

  return (
    <div
      className="z-10 mb-8 scale-100 transition-all duration-200 ease-out hover:z-50 md:mb-0 md:hover:scale-[1.15]"
      style={{ perspective: '600px' }}
      ref={ref}
    >
      <div
        style={style}
        className="flex flex-col overflow-hidden bg-white shadow-cyan-100/50 transition-all duration-200 ease-out dark:bg-dark dark:shadow-cyan-700/50 md:rounded-lg md:shadow-lg"
      >
        <Image
          src={'/static/images/profile.jpg'}
          alt="avatar"
          width={550}
          height={350}
          style={{
            objectPosition: '50% 16%',
            objectFit: 'cover',
            width: '100%',
            aspectRatio: '17/11',
          }}
        />
        <ProfileCardInfo />
        <span className="h-1.5 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
      </div>
    </div>
  )
}
