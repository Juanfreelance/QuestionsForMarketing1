import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Heart, Trash2, Maximize2, Minimize2, Download, Users, TrendingUp, Clock, Shield } from 'lucide-react';

export default function ClassQnA() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [notification, setNotification] = useState('');
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [animateQuestion, setAnimateQuestion] = useState(false);

  const ADMIN_PASSWORD = 'xpemasaran1';

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const result = await window.storage.list('qa:');
      if (result && result.keys) {
        const loadedQuestions = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? JSON.parse(data.value) : null;
          })
        );
        setQuestions(loadedQuestions.filter(q => q !== null).sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.log('Memulai dengan data kosong');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    const question = {
      id: Date.now(),
      text: newQuestion,
      likes: 0,
      timestamp: Date.now(),
      answered: false,
      answer: '',
      color: getRandomColor()
    };

    try {
      await window.storage.set(`qa:${question.id}`, JSON.stringify(question));
      setQuestions([question, ...questions]);
      setNewQuestion('');
      setAnimateQuestion(true);
      setTimeout(() => setAnimateQuestion(false), 500);
      showNotification('✅ Pertanyaan berhasil dikirim!');
    } catch (error) {
      showNotification('❌ Gagal mengirim pertanyaan');
    }
  };

  const getRandomColor = () => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleLike = async (id) => {
    const updated = questions.map(q => 
      q.id === id ? { ...q, likes: q.likes + 1 } : q
    );
    setQuestions(updated);
    
    const question = updated.find(q => q.id === id);
    try {
      await window.storage.set(`qa:${id}`, JSON.stringify(question));
    } catch (error) {
      console.error('Gagal menyimpan like');
    }
  };

  const handleAnswer = async (id, answer) => {
    const updated = questions.map(q => 
      q.id === id ? { ...q, answer, answered: true } : q
    );
    setQuestions(updated);
    
    const question = updated.find(q => q.id === id);
    try {
      await window.storage.set(`qa:${id}`, JSON.stringify(question));
      showNotification('✅ Jawaban berhasil disimpan!');
    } catch (error) {
      showNotification('❌ Gagal menyimpan jawaban');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pertanyaan ini?')) return;
    
    try {
      await window.storage.delete(`qa:${id}`);
      setQuestions(questions.filter(q => q.id !== id));
      showNotification('✅ Pertanyaan berhasil dihapus!');
    } catch (error) {
      showNotification('❌ Gagal menghapus pertanyaan');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminMode(true);
      setShowPasswordInput(false);
      setAdminPassword('');
      showNotification('✅ Login admin berhasil!');
    } else {
      showNotification('❌ Password salah!');
      setAdminPassword('');
    }
  };

  const openFullscreen = (question) => {
    setSelectedQuestion(question);
    setFullscreenMode(true);
  };

  const closeFullscreen = () => {
    setFullscreenMode(false);
    setSelectedQuestion(null);
  };

  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.answered).length,
    totalLikes: questions.reduce((sum, q) => sum + q.likes, 0)
  };

  if (fullscreenMode && selectedQuestion) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center p-8 z-50">
        <button
          onClick={closeFullscreen}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
        >
          <Minimize2 size={32} />
        </button>

        <div className="max-w-4xl w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className={`inline-block bg-gradient-to-r ${selectedQuestion.color} p-4 rounded-2xl mb-6`}>
                <MessageSquare className="text-white" size={64} />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">X Pemasaran 1</h1>
              <p className="text-white/80 text-sm">Anonymous Question</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
              <p className="text-gray-800 text-2xl leading-relaxed text-center font-medium">
                "{selectedQuestion.text}"
              </p>
            </div>

            {selectedQuestion.answered && (
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <p className="text-white/90 text-sm font-semibold mb-2">💬 Jawaban:</p>
                <p className="text-white text-lg leading-relaxed">{selectedQuestion.answer}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-8 mt-8 text-white">
              <div className="flex items-center gap-2">
                <Heart size={24} fill="white" />
                <span className="text-2xl font-bold">{selectedQuestion.likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={24} />
                <span className="text-sm">{new Date(selectedQuestion.timestamp).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-white/60 text-sm">📸 Tekan screenshot untuk menyimpan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {notification && (
        <div className="fixed top-4 right-4 bg-white px-6 py-3 rounded-xl shadow-2xl z-50 border-l-4 border-purple-500 animate-bounce">
          <p className="font-semibold">{notification}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg">
                <MessageSquare className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Q&A Anonymous
                </h1>
                <p className="text-gray-600 font-medium">Kelas X Pemasaran 1</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (adminMode) {
                  setAdminMode(false);
                  showNotification('👋 Logout admin');
                } else {
                  setShowPasswordInput(!showPasswordInput);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {adminMode ? '🔓 Admin Mode' : '🔒 Admin Login'}
            </button>
          </div>

          {showPasswordInput && (
            <div className="mt-4 flex gap-2 animate-fadeIn">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Masukkan password admin"
                className="flex-1 px-6 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAdminLogin}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Login
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users size={24} />
                <span className="font-semibold">Total</span>
              </div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-white/80">Pertanyaan</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={24} />
                <span className="font-semibold">Dijawab</span>
              </div>
              <p className="text-3xl font-bold">{stats.answered}</p>
              <p className="text-sm text-white/80">Pertanyaan</p>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={24} />
                <span className="font-semibold">Total Like</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalLikes}</p>
              <p className="text-sm text-white/80">Likes</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-6 border border-white/50">
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Tulis pertanyaan atau pesan anonim di sini... 💭"
                className="w-full px-6 py-4 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg transition-all"
                rows="4"
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                {newQuestion.length} karakter
              </div>
            </div>
            <button
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform hover:scale-105"
            >
              <Send size={24} />
              Kirim Pertanyaan Anonim
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📋 Semua Pertanyaan
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-lg">
                {questions.length}
              </span>
            </h2>
          </div>
          
          {questions.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center border border-white/50">
              <MessageSquare className="mx-auto text-gray-300 mb-4" size={80} />
              <p className="text-gray-500 text-xl">Belum ada pertanyaan. Jadilah yang pertama! 🚀</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/50 hover:shadow-2xl transition-all transform hover:-translate-y-1 ${animateQuestion && index === 0 ? 'animate-slideIn' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${q.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <MessageSquare className="text-white" size={24} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Anonymous</p>
                          <p className="text-xs text-gray-400">
                            {new Date(q.timestamp).toLocaleString('id-ID', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-800 text-lg leading-relaxed">{q.text}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openFullscreen(q)}
                        className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Fullscreen untuk screenshot"
                      >
                        <Maximize2 size={20} />
                      </button>
                      {adminMode && (
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                  {q.answered && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 mt-4 rounded-xl">
                      <p className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
                        <Shield size={16} />
                        Jawaban Admin:
                      </p>
                      <p className="text-gray-700 leading-relaxed">{q.answer}</p>
                    </div>
                  )}

                  {adminMode && !q.answered && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Ketik jawaban dan tekan Enter..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            handleAnswer(q.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleLike(q.id)}
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors group"
                    >
                      <Heart 
                        size={22} 
                        fill={q.likes > 0 ? 'currentColor' : 'none'}
                        className="group-hover:scale-110 transition-transform"
                      />
                      <span className="font-bold text-lg">{q.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-gray-600">
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 inline-block shadow-lg">
            <p className="font-semibold text-lg mb-2">🔐 100% Anonim & Aman</p>
            <p className="text-sm">Made with 💜 for X Pemasaran 1</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}