import React, { useState, useEffect } from "react";
import "../../../shared.css";
import "./kuis.css";
import Sidebar from "../../../Sidebar";
import { useSidebar } from "../../../useSidebar";
import Navbar from "../../../Navbar";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLlRblArhYvkrSWfEx3UWaIaP5bdg8OpReWzF-sc4sB_2K3sC4IYv7Q4-lWy6VUtGhc5esYpVi12_HYjLZdjx6ILoT60xad1GfsEtHStVQIigk44gnAXnpEAjWrPWVYNa_AKdaDPqXQwdlJDbcccdQ96CZrZ6btx50rBBy3LvfY-eINJ1MtiJWLJpWBAo2nnbaNr3i-_Yn3B_BsVkOxpG3hVSKt38J2-NxnAah9LFYcNLvZARv4lzr86P24cdV4haCMW80Nudw5Lku";

const TIME_LIMIT = 30 * 60; // 30 minutes in seconds

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

import { apiClient } from "../../../utils/apiClient";

export default function QuizKuis({ onNavigate, onLogout, idKuis = 1 }) {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizTitle, setQuizTitle] = useState("Kuis");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await apiClient.get(`/api/kuis/${idKuis}/soal`);
        const payload = res?.data || res;
        const list = payload?.questions || [];
        setQuizTitle(payload?.judul || "Kuis");
        setQuestions(list);
        setAnswers(Array(list.length).fill(null));
      } catch (error) {
        console.error("Gagal memuat kuis", error);
        setError("Kuis belum tersedia untuk mata kuliah ini.");
        setQuestions([]);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [idKuis]);

  useEffect(() => {
    if (isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleAnswerSelect = (questionIndex, optionId) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionId;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const payloadAnswers = questions
        .map((q, index) => ({
          questionId: q.id,
          selectedOptionId: answers[index],
        }))
        .filter((item) => item.selectedOptionId !== null);

      const res = await apiClient.post(`/api/kuis/${idKuis}/submit`, {
        answers: payloadAnswers,
      });
      const apiResult = res?.data || res;
      setResult(apiResult);
      setScore(apiResult?.score || 0);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || "Gagal mengirim jawaban kuis");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const answeredCount = answers.filter((a) => a !== null).length;

  if (isSubmitted) {
    return (
      <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
        <Sidebar
          onNavigate={onNavigate}
          onLogout={onLogout}
          activePage="daftarTugas"
          mobileOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
          <Navbar role="Mahasiswa" onOpenSidebar={openSidebar} onNavigate={typeof nav !== "undefined" ? nav : (typeof onNavigate !== "undefined" ? onNavigate : undefined)} />

          <div className="page-content">
            <div className="quiz-result-container">
              <div className="quiz-result-card">
                <div className="quiz-result-icon">
                  <span className="material-symbols-outlined">{score >= 70 ? "emoji_events" : "school"}</span>
                </div>
                <h2 className="quiz-result-title">Kuis Selesai!</h2>
                <p className="quiz-result-subtitle">Berikut adalah hasil kuis Anda</p>

                <div className="quiz-score-display">
                  <div className={`quiz-score-circle ${score >= 70 ? "quiz-score-circle--pass" : "quiz-score-circle--fail"}`}>
                    <span className="quiz-score-number">{score}</span>
                    <span className="quiz-score-label">SKOR</span>
                  </div>
                </div>

                <div className="quiz-stats-grid">
                  <div className="quiz-stat quiz-stat--green">
                    <p className="quiz-stat-num">{result?.correctCount || 0}</p>
                    <p className="quiz-stat-lbl">BENAR</p>
                  </div>
                  <div className="quiz-stat quiz-stat--red">
                    <p className="quiz-stat-num">{result?.wrongCount || 0}</p>
                    <p className="quiz-stat-lbl">SALAH</p>
                  </div>
                  <div className="quiz-stat quiz-stat--blue">
                    <p className="quiz-stat-num">{result?.totalQuestions || questions.length}</p>
                    <p className="quiz-stat-lbl">TOTAL SOAL</p>
                  </div>
                </div>

                <button
                  className="quiz-back-btn"
                  onClick={() => onNavigate && onNavigate("daftarTugas")}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali ke Daftar Tugas
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return <div className="page-shell"><main className="page-main"><div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Memuat kuis...</div></main></div>;
  }

  if (!questions.length) {
    return (
      <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
        <Sidebar onNavigate={onNavigate} onLogout={onLogout} activePage="daftarTugas" mobileOpen={sidebarOpen} onClose={closeSidebar} />
        <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
          <Navbar role="Mahasiswa" onOpenSidebar={openSidebar} onNavigate={onNavigate} />
          <div className="page-content">
            <div className="quiz-result-container">
              <div className="quiz-result-card">
                <h2 className="quiz-result-title">Kuis Belum Tersedia</h2>
                <p className="quiz-result-subtitle">{error || "Tidak ada soal yang dapat ditampilkan."}</p>
                <button className="quiz-back-btn" onClick={() => onNavigate && onNavigate("daftarTugas")}>
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali ke Daftar Tugas
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell" style={{ backgroundColor: "var(--color-background)" }}>
      <Sidebar
        onNavigate={onNavigate}
        onLogout={onLogout}
        activePage="daftarTugas"
        mobileOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <main className="page-main" style={{ backgroundColor: "var(--color-background)" }}>
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar__left">
            <button className="navbar__hamburger" onClick={openSidebar}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="navbar__title">{quizTitle}</span>
          </div>
          <div className="navbar__right">
            <button className="navbar__bell">
              <span className="material-symbols-outlined">notifications</span>
              <span className="navbar__bell-dot"></span>
            </button>
            <div className="navbar__divider"></div>
            <div className="navbar__profile" style={{ cursor: "pointer" }} onClick={() => onNavigate && onNavigate("profile")}>
              <div className="navbar__profile-info">
                <p className="navbar__profile-name">Halo, Firman</p>
                <p className="navbar__profile-role">Mahasiswa</p>
              </div>
              <div className="navbar__avatar">
                <img alt="Foto profil" src={AVATAR} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {/* Quiz Header */}
          <div className="quiz-header">
            <div className="quiz-header-left">
              <button className="quiz-back-btn-small" onClick={() => onNavigate && onNavigate("daftarTugas")}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="quiz-title">{quizTitle}</h2>
                <p className="quiz-subtitle">Jawab seluruh pertanyaan berikut dengan benar</p>
              </div>
            </div>
            <div className={`quiz-timer ${timeLeft < 300 ? "quiz-timer--urgent" : ""}`}>
              <span className="material-symbols-outlined">timer</span>
              <span className="quiz-timer-text">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress */}
          <div className="quiz-progress">
            <div className="quiz-progress-info">
              <span>Soal {currentQuestion + 1} dari {questions.length}</span>
              <span>{answeredCount} dari {questions.length} dijawab</span>
            </div>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="quiz-question-card">
            <h3 className="quiz-question-text">{questions[currentQuestion]?.question}</h3>

            <div className="quiz-options">
              {questions[currentQuestion]?.options.map((option, idx) => (
                <button
                  key={option.id}
                  className={`quiz-option ${answers[currentQuestion] === option.id ? "quiz-option--selected" : ""}`}
                  onClick={() => handleAnswerSelect(currentQuestion, option.id)}
                >
                  <span className="quiz-option-letter">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="quiz-option-text">{option.text}</span>
                  {answers[currentQuestion] === option.id && (
                    <span className="material-symbols-outlined quiz-option-check">check_circle</span>
                  )}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="quiz-nav">
              <button
                className="quiz-nav-btn quiz-nav-btn--outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Sebelumnya
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  className="quiz-nav-btn quiz-nav-btn--submit"
                  onClick={handleSubmit}
                >
                  Kumpulkan Jawaban
                  <span className="material-symbols-outlined">check</span>
                </button>
              ) : (
                <button
                  className="quiz-nav-btn quiz-nav-btn--primary"
                  onClick={handleNextQuestion}
                >
                  Selanjutnya
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="quiz-question-nav">
            <p className="quiz-question-nav-title">Navigasi Soal</p>
            <div className="quiz-question-dots">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  className={`quiz-question-dot ${idx === currentQuestion ? "quiz-question-dot--active" : ""} ${answers[idx] !== null ? "quiz-question-dot--answered" : ""}`}
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
