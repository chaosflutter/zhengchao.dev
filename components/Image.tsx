import clsx from 'clsx'
import { BLUR_IMAGE_DATA_URL, LOGO_IMAGE_PATH } from 'constant'
import NextImage from 'next/image'
import { useState } from 'react'
import type { ImageProps } from 'types'
import { ImageLightbox } from './ImageLightbox'

export function Image({ shouldOpenLightbox = true, ...rest }: ImageProps) {
  let blurDataURL = ''
  if (rest.src !== LOGO_IMAGE_PATH) {
    blurDataURL = BLUR_IMAGE_DATA_URL
  }

  const [openLightbox, setOpenLightbox] = useState(false)
  const handleOpenLightbox = () => {
    if (!shouldOpenLightbox) return
    document.documentElement.classList.add('lightbox-loading')
    setOpenLightbox(true)
  }
  const className = clsx(
    `flex justify-center max-w-full`,
    shouldOpenLightbox && 'cursor-zoom-in'
  )

  return (
    <>
      <div className={className}>
        <NextImage
          {...rest}
          blurDataURL={blurDataURL}
          onClick={handleOpenLightbox}
        />
      </div>
      {openLightbox && (
        <ImageLightbox
          closeLightbox={() => setOpenLightbox(false)}
          src={rest.src}
        />
      )}
    </>
  )
}
