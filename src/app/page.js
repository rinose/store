"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const videoTitles = [
  "Cantuccini Senza Glutine",
  "Chiacchiere Fritte", 
  "Dubai Chocolate"
  ];

  useEffect(() => {
    // Load YouTube videos from JSON file
    fetch('/videos/youtube_videos.json')
      .then(response => response.json())
      .then(data => {
        setVideos(data.videos || []);
        setVideosLoading(false);
      })
      .catch(error => {
        console.error('Error loading videos:', error);
        setVideosLoading(false);
      });
  }, []);

  // Function to convert YouTube URL to embed URL
  // Function to convert YouTube URL to embed URL
// Function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  // Handle different YouTube URL formats
  let videoId = '';
  
  if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('youtube.com/watch?v=')[1].split('&')[0];
  }
  
  // Use YouTube nocookie domain with minimal parameters
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
};
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
              src="/images/logo_black_white.jpg"
              alt="Logo"
              width={150}
              height={150}
              style={{ width: "auto", height: "auto" }}
              className="mx-auto rounded-full shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Benvenuti da <span className="text-brand-gold">Cristofaro</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            L'arte della pasticceria artigianale dove dolcezza e maestria creano emozioni uniche
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/products"
              className="bg-brand-gold hover:bg-brand-gold-light text-brand-black px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Scopri le Nostre Creazioni
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-brand-gold text-lg font-medium">Seguici su:</p>
            <div className="flex gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/1SLW2MUzeF/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-brand-gold hover:text-brand-black text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/cristofaro_pastrychef?igsh=aDNqeTFmaGk2ejQ0&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-brand-gold hover:text-brand-black text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@cristofaropastrychef"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-brand-gold hover:text-brand-black text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
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
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                La Nostra <span className="text-brand-gold">Storia</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Con anni di esperienza e una passione innata per l'arte dolciaria, 
                Chef Cristofaro crea dolci che incantano i sensi e conquistano il cuore, 
                portando nelle vostre case il meglio della pasticceria artigianale italiana.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Ogni ingrediente è selezionato con cura, ogni ricetta è un capolavoro 
                di dolcezza e dedizione, un perfetto equilibrio tra tradizione e innovazione.
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

      {/* YouTube Videos Section */}
      <section className="py-24 bg-gradient-to-b from-zinc-900 to-brand-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-6">
            Le Nostre <span className="text-brand-gold">Creazioni in Video</span>
          </h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Scopri l'arte della pasticceria attraverso i nostri video, dove ogni dolce prende vita 
            con maestria e passione.
          </p>
          
          {videosLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-300">Caricamento video...</div>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {videos.map((videoUrl, index) => (
                <div key={index} className="bg-brand-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-brand-gold/20">
                  <div className="relative aspect-video">
                    <iframe
                      src={getYouTubeEmbedUrl(videoUrl)}
                      title={`Video ${index + 1} - Cristofaro Pastry Chef`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      {videoTitles[index] || `Video ${index + 1}`}
                    </h3>
                    <p className="text-gray-300 text-sm">
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-300">
              <p>Nessun video disponibile al momento.</p>
            </div>
          )}

          {/* Call to action for social media */}
          <div className="text-center mt-16">
            <p className="text-brand-gold text-lg font-medium mb-4">
              Vuoi vedere altri video? Seguici sui nostri social!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.tiktok.com/@cristofaropastrychef"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-black px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Seguici su TikTok
              </a>
              <a
                href="https://www.instagram.com/cristofaro_pastrychef?igsh=aDNqeTFmaGk2ejQ0&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-black px-6 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Seguici su Instagram
              </a>
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
              <div className="text-brand-gold text-5xl mb-4">🍰</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ingredienti Premium</h3>
              <p className="text-gray-300 leading-relaxed">
                Solo i migliori ingredienti selezionati per creare dolci di eccellenza, dal sapore autentico e indimenticabile.
              </p>
            </div>
            <div className="bg-brand-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-brand-gold/20">
              <div className="text-brand-gold text-5xl mb-4">👨‍🍳</div>
              <h3 className="text-2xl font-bold text-white mb-4">Maestria Artigianale</h3>
              <p className="text-gray-300 leading-relaxed">
                Ricette della tradizione pasticcera italiana, perfezionate con tecnica e creatività per dolci unici.
              </p>
            </div>
            <div className="bg-brand-black p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow border border-brand-gold/20">
              <div className="text-brand-gold text-5xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-white mb-4">Creazioni Uniche</h3>
              <p className="text-gray-300 leading-relaxed">
                Ogni dolce è una creazione artigianale preparata con amore e dedizione per regalare momenti di pura dolcezza.
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
            Scopri le nostre delizie dolciarie e ordina le tue prelibatezze preferite. La dolcezza ti aspetta!
          </p>
          <Link
            href="/products"
            className="inline-block bg-brand-gold hover:bg-brand-gold-light text-brand-black px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-brand-gold/50 transform hover:scale-105"
          >
            Ordina Ora
          </Link>
        </div>
      </section>

      {/* Footer Section with Contact Information */}
      <footer className="py-12 bg-brand-black text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl font-bold mb-4">Contattaci</p>
          <p className="text-lg">Email: cristofaropastrychef@gmail.com</p>
          <p className="text-lg">Telefono: +39 348 374 1295</p>
        </div>
      </footer>
    </div>
  );
}
