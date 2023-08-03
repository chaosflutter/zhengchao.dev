import React, { useRef, useEffect } from 'react'
import Typed from 'typed.js'
import { Twemoji } from '../Twemoji'

export function TypedBios() {
  const el = useRef(null)
  const typed = useRef(null)

  useEffect(() => {
    typed.current = new Typed(el.current, {
      stringsElement: '#bios',
      typeSpeed: 40,
      backSpeed: 10,
      loop: false,
      backDelay: 1000,
    })
    return () => typed.current.destroy()
  }, [])

  return (
    <div className="-mt-1">
      <ul id="bios" className="hidden1">
        <li>
          Hello, I'm a software engineer, living in{' '}
          <Twemoji emoji="flag-china" /> China. I'm enthusiastic about coding
          and writing. I have been developing web applications with JavaScript,
          TypeScript, React, Vue, Node.js, and more since 2014.
          <br />
          <br />
          I am also a fan of <Twemoji emoji="video-game" /> video game. I like
          it so much that I'm making some 2D/3D/VR games with Unity3D and C# by
          myself. So I would like to share some of my game development
          experience. I will write in both English and Chinese.
          <br />
          <br />
          If you want to know more about me, you can find me through the social
          media accounts on the left. Happy reading!{' '}
          <Twemoji emoji="clinking-beer-mugs" />
        </li>
      </ul>
      <span
        ref={el}
        className="tracking-tight text-neutral-900 dark:text-neutral-200"
      />
    </div>
  )
}
