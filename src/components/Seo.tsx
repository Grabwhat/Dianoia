import { useEffect } from 'react'

type SeoProps = {
  title: string
  description: string
}

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title

    let metaDescription = document.querySelector(
      'meta[name="description"]',
    ) as HTMLMetaElement | null

    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }

    metaDescription.content = description
  }, [title, description])

  return null
}
