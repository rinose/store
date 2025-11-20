"use client";

import React, { useState, useEffect } from 'react';

const AdminLandingPage = () => {
  const [landingContent, setLandingContent] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    featuresSection: {
      title: '',
      features: []
    },
    aboutSection: {
      title: '',
      content: ''
    },
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // For now, we'll simulate loading and saving until we implement the API
  useEffect(() => {
    // Simulate loading existing content
    setTimeout(() => {
      setLandingContent({
        heroTitle: 'Benvenuto nel nostro Store',
        heroSubtitle: 'La migliore qualità a portata di mano',
        heroDescription: 'Scopri la nostra collezione di prodotti artigianali e di alta qualità.',
        featuresSection: {
          title: 'Perché scegliere noi',
          features: [
            { title: 'Qualità Premium', description: 'Solo i migliori prodotti selezionati' },
            { title: 'Consegna Rapida', description: 'Spediamo in 24-48 ore' },
            { title: 'Assistenza Clienti', description: 'Supporto dedicato sempre disponibile' }
          ]
        },
        aboutSection: {
          title: 'Chi Siamo',
          content: 'Siamo un\'azienda italiana che si dedica alla produzione e vendita di prodotti di alta qualità.'
        },
        contactInfo: {
          phone: '+39 123 456 7890',
          email: 'info@store.com',
          address: 'Via Roma 123, Milano, Italia'
        }
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleHeroChange = (field, value) => {
    setLandingContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeaturesSectionChange = (field, value) => {
    setLandingContent(prev => ({
      ...prev,
      featuresSection: {
        ...prev.featuresSection,
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    setLandingContent(prev => ({
      ...prev,
      featuresSection: {
        ...prev.featuresSection,
        features: prev.featuresSection.features.map((feature, i) =>
          i === index ? { ...feature, [field]: value } : feature
        )
      }
    }));
  };

  const addFeature = () => {
    setLandingContent(prev => ({
      ...prev,
      featuresSection: {
        ...prev.featuresSection,
        features: [...prev.featuresSection.features, { title: '', description: '' }]
      }
    }));
  };

  const removeFeature = (index) => {
    setLandingContent(prev => ({
      ...prev,
      featuresSection: {
        ...prev.featuresSection,
        features: prev.featuresSection.features.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAboutChange = (field, value) => {
    setLandingContent(prev => ({
      ...prev,
      aboutSection: {
        ...prev.aboutSection,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field, value) => {
    setLandingContent(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Simulate API call - replace with actual API call when implemented
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      console.log('Landing content to save:', landingContent);
    } catch (err) {
      setError('Errore durante il salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-lg text-gray-600">Caricamento contenuti...</div>
      </div>
    );
  }

  return (
    <div className="dark:text-gray-500">
      <h1 className="text-3xl font-bold mb-8">Gestione Landing Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Errore:</strong> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>Successo:</strong> Contenuti della landing page aggiornati con successo!
        </div>
      )}

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sezione Hero</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo Principale
              </label>
              <input
                type="text"
                value={landingContent.heroTitle}
                onChange={(e) => handleHeroChange('heroTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci il titolo principale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sottotitolo
              </label>
              <input
                type="text"
                value={landingContent.heroSubtitle}
                onChange={(e) => handleHeroChange('heroSubtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci il sottotitolo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                rows={3}
                value={landingContent.heroDescription}
                onChange={(e) => handleHeroChange('heroDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci la descrizione"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sezione Caratteristiche</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Sezione
            </label>
            <input
              type="text"
              value={landingContent.featuresSection.title}
              onChange={(e) => handleFeaturesSectionChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Inserisci il titolo della sezione"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Caratteristiche</h3>
              <button
                onClick={addFeature}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
              >
                + Aggiungi Caratteristica
              </button>
            </div>

            {landingContent.featuresSection.features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Titolo Caratteristica
                    </label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Titolo della caratteristica"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Descrizione
                    </label>
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrizione della caratteristica"
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  🗑️ Rimuovi
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sezione Chi Siamo</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo Sezione
              </label>
              <input
                type="text"
                value={landingContent.aboutSection.title}
                onChange={(e) => handleAboutChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci il titolo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenuto
              </label>
              <textarea
                rows={4}
                value={landingContent.aboutSection.content}
                onChange={(e) => handleAboutChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Inserisci il contenuto della sezione"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Informazioni Contatto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefono
              </label>
              <input
                type="text"
                value={landingContent.contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={landingContent.contactInfo.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="info@store.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo
              </label>
              <input
                type="text"
                value={landingContent.contactInfo.address}
                onChange={(e) => handleContactChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Via Roma 123, Milano"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Anteprima</h2>
          <div className="bg-gray-50 p-6 rounded-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{landingContent.heroTitle}</h1>
              <h2 className="text-2xl text-blue-600 mb-4">{landingContent.heroSubtitle}</h2>
              <p className="text-gray-600">{landingContent.heroDescription}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{landingContent.featuresSection.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {landingContent.featuresSection.features.map((feature, index) => (
                  <div key={index} className="bg-white p-4 rounded-md shadow">
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{landingContent.aboutSection.title}</h3>
              <p className="text-gray-600">{landingContent.aboutSection.content}</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contatti</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Telefono:</span> {landingContent.contactInfo.phone}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {landingContent.contactInfo.email}
                </div>
                <div>
                  <span className="font-medium">Indirizzo:</span> {landingContent.contactInfo.address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;