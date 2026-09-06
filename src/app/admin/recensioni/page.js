"use client";

import React, { useEffect, useState } from "react";
import { setRecensioneStatus, subscribeRecensioni } from "../../../lib/recensioni";

const formatReviewDate = (value) => {
  if (!value) return "N/A";
  try {
    const date = value.seconds ? new Date(value.seconds * 1000) : new Date(typeof value === "number" ? value : value);
    if (isNaN(date.getTime())) return "Data non valida";
    return date.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Errore data";
  }
};

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  disapproved: "bg-red-100 text-red-800",
};

const statusLabels = {
  pending: "In attesa",
  approved: "Approvata",
  disapproved: "Non approvata",
};

const AdminRecensioniPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeRecensioni(
      (list) => {
        setReviews(list);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setError("Errore nel caricamento delle recensioni: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const setStatus = async (reviewId, status) => {
    try {
      setUpdatingId(reviewId);
      await setRecensioneStatus(reviewId, status);
    } catch (err) {
      console.error("Error updating review:", err);
      alert("Errore nell'aggiornamento della recensione: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const pending = reviews.filter((review) => review.status === "pending");
  const approved = reviews.filter((review) => review.status === "approved");
  const disapproved = reviews.filter((review) => review.status === "disapproved");

  const renderReviewCard = (review) => (
    <article key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-900">{review.name || "Senza nome"}</p>
          <p className="text-sm text-gray-500">{formatReviewDate(review.createdAt)}</p>
          <p className="text-sm text-[#aa8510] mt-1">
            {"★".repeat(review.rating || 0)}
            {"☆".repeat(5 - (review.rating || 0))}
          </p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[review.status] || "bg-gray-100 text-gray-800"}`}>
          {statusLabels[review.status] || review.status}
        </span>
      </div>
      <p className="text-gray-700 whitespace-pre-line mb-4">{review.text}</p>
      <div className="flex flex-wrap gap-2">
        {review.status !== "approved" && (
          <button
            type="button"
            disabled={updatingId === review.id}
            onClick={() => setStatus(review.id, "approved")}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-sm"
          >
            Approva
          </button>
        )}
        {review.status !== "disapproved" && (
          <button
            type="button"
            disabled={updatingId === review.id}
            onClick={() => setStatus(review.id, "disapproved")}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-sm"
          >
            Non approvare
          </button>
        )}
      </div>
    </article>
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Gestione Recensioni</h1>
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Caricamento recensioni...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Gestione Recensioni</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Errore:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Gestione Recensioni</h1>

      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-900 px-4 py-3 rounded mb-6">
          Hai {pending.length} recension{pending.length === 1 ? "e" : "i"} in attesa di approvazione.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">In attesa</h3>
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Approvate</h3>
          <p className="text-2xl font-bold text-green-600">{approved.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Non approvate</h3>
          <p className="text-2xl font-bold text-red-600">{disapproved.length}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">In attesa</h2>
        {pending.length === 0 ? (
          <p className="text-gray-500 bg-white rounded-lg p-4 shadow-sm">Nessuna recensione in attesa.</p>
        ) : (
          <div className="space-y-3">{pending.map(renderReviewCard)}</div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Approvate</h2>
        {approved.length === 0 ? (
          <p className="text-gray-500 bg-white rounded-lg p-4 shadow-sm">Nessuna recensione approvata.</p>
        ) : (
          <div className="space-y-3">{approved.map(renderReviewCard)}</div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Non approvate</h2>
        {disapproved.length === 0 ? (
          <p className="text-gray-500 bg-white rounded-lg p-4 shadow-sm">Nessuna recensione rifiutata.</p>
        ) : (
          <div className="space-y-3">{disapproved.map(renderReviewCard)}</div>
        )}
      </section>
    </div>
  );
};

export default AdminRecensioniPage;
