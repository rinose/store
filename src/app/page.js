import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cristofaro.jpeg"
            alt="Cristofaro"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/50 to-brand-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <Image
              src="/images/logo_gold.jpg"
              alt="Logo"
              width={150}
              height={150}
              className="mx-auto rounded-full shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Benvenuti da <span className="text-brand-gold">Cristofaro</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Un viaggio culinario autentico dove tradizione e passione si incontrano in ogni piatto
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/products"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Scopri i Nostri Prodotti
            </Link>
            <Link
              href="/categories"
              className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Esplora le Categorie
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-brand-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-24 bg-gradient-to-b from-brand-black to-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1">
              <Image
                src="/images/cristofaro_chef.jpg"
                alt="Chef Cristofaro"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                La Nostra <span className="text-brand-gold">Storia</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Con anni di esperienza e una passione innata per l'arte culinaria, 
                Chef Cristofaro porta sulle vostre tavole il meglio della tradizione 
                gastronomica italiana.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Ogni prodotto è selezionato con cura, ogni ricetta è un omaggio 
                alla qualità e all'autenticità dei sapori che rendono unica la nostra cucina.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center text-brand-gold hover:text-brand-gold-light font-semibold text-lg transition-colors group"
              >
                Scopri di più
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Perché Scegliere <span className="text-brand-gold">Cristofaro</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-brand-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-brand-gold/20">
              <div className="text-brand-gold text-5xl mb-4">🍝</div>
              <h3 className="text-2xl font-bold text-white mb-4">Qualità Superiore</h3>
              <p className="text-gray-300 leading-relaxed">
                Ingredienti selezionati con cura per garantire il massimo della qualità e del gusto in ogni prodotto.
              </p>
            </div>
            <div className="bg-brand-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-brand-gold/20">
              <div className="text-brand-gold text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-2xl font-bold text-white mb-4">Tradizione Autentica</h3>
              <p className="text-gray-300 leading-relaxed">
                Ricette tramandate e perfezionate nel tempo, per portare in tavola il vero sapore della tradizione.
              </p>
            </div>
            <div className="bg-brand-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-brand-gold/20">
              <div className="text-brand-gold text-5xl mb-4">💝</div>
              <h3 className="text-2xl font-bold text-white mb-4">Passione Artigianale</h3>
              <p className="text-gray-300 leading-relaxed">
                Ogni piatto è preparato con dedizione e amore, come si fa nelle migliori cucine italiane.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-brand-black to-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto a <span className="text-brand-gold">Gustare</span> l'Eccellenza?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Esplora il nostro menu e ordina i tuoi piatti preferiti. La qualità ti aspetta!
          </p>
          <Link
            href="/products"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-black px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-brand-gold/50 transform hover:scale-105"
          >
            Ordina Ora
          </Link>
        </div>
      </section>
    </div>
  );
}
