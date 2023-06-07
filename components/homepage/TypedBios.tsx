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
      <ul id="bios" className="hidden">
        <li>
          I'm a <Twemoji emoji="man-technologist" /> software engineer, living
          in <Twemoji emoji="flag-china" /> China. I'm enthusiastic about coding
          and writing. I have been developing web applications with JavaScript,
          TypeScript, React, Vue, Node.js, and more since 2014.
          <br />
          <br />
          Also, I'm a fan of <Twemoji emoji="video-game" /> video game, and "The
          Legend of Zelda" is my favorite. Recently I decided to become a game
          developer. So I work hard to be suffficent in this field. I have
          learned C#, Unity, game mechanics and many other necessary knowledge.
          <br />
          <br />
          If you have the idea to hire me, you can contact me through the social
          media account on the left. Enjoy reading!
          <Twemoji emoji="clinking-beer-mugs" />
          <span className="hidden">
            And I'm working on the famous game 'GenShin Impact' now. It's a
            amazing experience.
          </span>
        </li>
      </ul>
      <span
        ref={el}
        className="text-neutral-900 dark:text-neutral-200 tracking-tight"
      />
    </div>
  )
}
