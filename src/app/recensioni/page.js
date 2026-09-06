"use client";

import React, { useEffect, useState } from "react";
import { addRecensione, seedRecensioniIfEmpty, subscribeRecensioni } from "../../lib/recensioni";

const StarRating = ({ value, onChange, readOnly = false, size = "md" }) => {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "lg" ? "w-8 h-8" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1" role={readOnly ? "img" : "radiogroup"} aria-label="Valutazione">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (onChange ? (hovered || value) : value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            className={readOnly ? "cursor-default" : "cursor-pointer"}
            aria-label={`${star} stell${star === 1 ? "a" : "e"}`}
          >
            <svg
              className={`${sizeClass} ${active ? "text-[#aa8510]" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

const formatReviewDate = (value) => {
  if (!value) return "";
  try {
    const date = value.seconds ? new Date(value.seconds * 1000) : new Date(typeof value === "number" ? value : value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const RecensioniPage = () => {
  const [activeTab, setActiveTab] = useState("lista");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ name: "", text: "", rating: 0 });

  useEffect(() => {
    const unsubscribe = subscribeRecensioni(
      (allReviews) => {
        if (allReviews.length === 0) {
          seedRecensioniIfEmpty(allReviews).catch((err) => {
            console.error("Error seeding reviews:", err);
          });
        }
        setReviews(allReviews.filter((review) => review.status === "approved"));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setError("Si è verificato un errore nel caricamento delle recensioni.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess(false);

    const name = form.name.trim();
    const text = form.text.trim();

    if (name.length < 2) {
      setFormError("Inserisci il tuo nome.");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setFormError("Seleziona una valutazione da 1 a 5 stelle.");
      return;
    }
    if (text.length < 10) {
      setFormError("La recensione deve contenere almeno 10 caratteri.");
      return;
    }

    try {
      setSubmitting(true);
      await addRecensione({
        name,
        text,
        rating: form.rating,
      });
      setForm({ name: "", text: "", rating: 0 });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting review:", err);
      setFormError("Non è stato possibile inviare la recensione. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: "lista", label: "Recensioni" },
    { id: "scrivi", label: "Scrivi recensione" },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Recensioni</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-[#aa8510] text-[#aa8510] bg-[#aa8510]/5"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "lista" && (
            <>
              {loading && (
                <div className="flex justify-center items-center h-32">
                  <div className="text-lg text-gray-600">Caricamento recensioni...</div>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>Errore:</strong> {error}
                </div>
              )}

              {!loading && !error && reviews.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-4">Non ci sono ancora recensioni approvate.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scrivi")}
                    className="bg-[#aa8510] hover:bg-[#8a6a00] text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Scrivi la prima recensione
                  </button>
                </div>
              )}

              {!loading && !error && reviews.length > 0 && (
                <ul className="space-y-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="border border-gray-200 rounded-lg p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <p className="text-sm text-gray-500">{formatReviewDate(review.createdAt)}</p>
                        </div>
                        <StarRating value={review.rating || 0} readOnly />
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activeTab === "scrivi" && (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
              <p className="text-sm text-gray-600">
                Non serve registrarsi. La recensione verrà pubblicata dopo l&apos;approvazione dello staff.
              </p>

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
                  Grazie! La tua recensione è stata inviata e sarà visibile dopo l&apos;approvazione.
                </div>
              )}

              {formError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#aa8510]"
                  placeholder="Il tuo nome"
                  maxLength={80}
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Valutazione</span>
                <StarRating
                  value={form.rating}
                  onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
                  size="lg"
                />
              </div>

              <div>
                <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-1">
                  Recensione
                </label>
                <textarea
                  id="review-text"
                  value={form.text}
                  onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#aa8510]"
                  placeholder="Racconta la tua esperienza..."
                  maxLength={1000}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-md text-sm font-medium text-white ${
                  submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#aa8510] hover:bg-[#8a6a00]"
                }`}
              >
                {submitting ? "Invio in corso..." : "Invia recensione"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecensioniPage;
