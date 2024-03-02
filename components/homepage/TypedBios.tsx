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
          I am a programmer living in China <Twemoji emoji="flag-china" /> who
          loves coding and writing. I started programming in 2014 and excel in
          front-end development. I also do Flutter client development, as well
          as server-side development based on Go and Node. I use Python for
          various tasks as well. Recently, I've been learning Rust and C#, and
          I'm particularly interested in frontend toolchains, editor
          development, and game development.
          <br />
          Enjoy reading!
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
