import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter -mt-7">
        Gonza
      </h1>
      <p className="mb-12">
      ¡Hola! Soy un desarrollador apasionado por el bienestar,
        que está aprendiendo magia en{' '}
        <a
          href="https://goalritmo.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: '#59A8E7', 
            display: 'inline',
            float: 'none',
            width: 'auto',
            clear: 'none'
          }}
        >
          FAMAF
        </a>
        {' y llevandolá a la práctica mediante '}
        <a
          href="https://catsulecorp.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: '#59A8E7', 
            display: 'inline',
            float: 'none',
            width: 'auto',
            clear: 'none'
          }}
        >
          Catsule Corp
        </a>
        {' ✨'}
      </p>
      <div className="my-4">
        <BlogPosts />
      </div>
    </section>
  )
}
