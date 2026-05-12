import { useEffect, useState } from 'react';
import { levels } from './data.js';
import { loadProgress, saveProgress } from './storage.js';

function App() {
  const [screen, setScreen] = useState('home');
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [lastScore, setLastScore] = useState(null);
  const [progress, setProgress] = useState(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const selectedLevel = levels.find((level) => level.id === selectedLevelId) ?? levels[0];
  const currentLesson = selectedLevel.lessons?.[lessonIndex];
  const currentQuestion = selectedLevel.quiz?.[quizIndex];
  const bestScore = progress.bestScores[selectedLevelId];
  const nextLevel = levels.find((level) => level.id === selectedLevelId + 1);

  function openLevel(levelId) {
    setSelectedLevelId(levelId);
    setLessonIndex(0);
    setQuizIndex(0);
    setSelectedAnswer('');
    setQuizAnswers([]);
    setLastScore(null);
    setScreen('level');
  }

  function startLessons() {
    setLessonIndex(0);
    setScreen('lesson');
  }

  function nextLesson() {
    if (lessonIndex < selectedLevel.lessons.length - 1) {
      setLessonIndex((value) => value + 1);
      return;
    }

    setQuizIndex(0);
    setSelectedAnswer('');
    setQuizAnswers([]);
    setScreen('quiz');
  }

  function submitAnswer() {
    if (!selectedAnswer) {
      return;
    }

    const nextAnswers = [
      ...quizAnswers,
      {
        questionId: currentQuestion.id,
        chosen: selectedAnswer,
        correct: currentQuestion.answer,
      },
    ];

    setQuizAnswers(nextAnswers);
    setSelectedAnswer('');

    if (quizIndex < selectedLevel.quiz.length - 1) {
      setQuizIndex((value) => value + 1);
      return;
    }

    const score = nextAnswers.filter((item) => item.chosen === item.correct).length;
    const passed = score >= selectedLevel.passingScore;

    setLastScore(score);
    setProgress((current) => {
      const completedLevels = passed && !current.completedLevels.includes(selectedLevelId)
        ? [...current.completedLevels, selectedLevelId]
        : current.completedLevels;

      return {
        completedLevels,
        bestScores: {
          ...current.bestScores,
          [selectedLevelId]: Math.max(score, current.bestScores[selectedLevelId] || 0),
        },
      };
    });
    setScreen('result');
  }

  function resetProgress() {
    const fresh = {
      completedLevels: [],
      bestScores: {},
    };

    setProgress(fresh);
    setSelectedLevelId(1);
    setLessonIndex(0);
    setQuizIndex(0);
    setSelectedAnswer('');
    setQuizAnswers([]);
    setLastScore(null);
    setScreen('home');
  }

  function goToNextLevel() {
    if (!nextLevel) {
      setScreen('home');
      return;
    }

    openLevel(nextLevel.id);
  }

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="hero">
          <div>
            <p className="eyebrow">Telugu Learning MVP</p>
            <h1>Telugu Steps</h1>
            <p className="hero-copy">
              A first mobile-friendly reading app for Telugu letters, words, quizzes, and simple
              reading practice.
            </p>
          </div>
          <div className="hero-card">
            <span className="hero-number">{levels.length}</span>
            <span className="hero-label">levels ready</span>
          </div>
        </header>

        <main>
          {screen === 'home' && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">Start Here</p>
                  <h2>Choose a level</h2>
                </div>
                <button className="secondary-button" onClick={resetProgress} type="button">
                  Reset
                </button>
              </div>

              <div className="level-grid">
                {levels.map((level) => {
                  const completed = progress.completedLevels.includes(level.id);

                  return (
                    <button
                      key={level.id}
                      className="level-card level-card-open"
                      onClick={() => openLevel(level.id)}
                      type="button"
                    >
                      <div className="level-badge">Level {level.id}</div>
                      <h3>{level.title}</h3>
                      <p className="level-subtitle">{level.subtitle}</p>
                      <p className="level-description">{level.description}</p>
                      <div className="level-footer">
                        <span>Open</span>
                        <span>{completed ? 'Passed' : 'Not passed'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {screen === 'level' && (
            <section className="panel">
              <button className="text-button" onClick={() => setScreen('home')} type="button">
                ← Back
              </button>
              <div className="level-overview">
                <div>
                  <p className="section-kicker">Level {selectedLevel.id}</p>
                  <h2>{selectedLevel.title}</h2>
                  <p>{selectedLevel.description}</p>
                </div>
                <div className="stats-card">
                  <span>Open</span>
                  <strong>{bestScore ?? 0}/{selectedLevel.quiz?.length ?? 0}</strong>
                  <small>best score</small>
                </div>
              </div>

              <div className="feature-list">
                <div className="feature-pill">{selectedLevel.lessons.length} lesson cards</div>
                <div className="feature-pill">{selectedLevel.quiz.length} quiz questions</div>
                <div className="feature-pill">
                  Pass score: {selectedLevel.passingScore}/{selectedLevel.quiz.length}
                </div>
              </div>

              <button className="primary-button" onClick={startLessons} type="button">
                Start level
              </button>
            </section>
          )}

          {screen === 'lesson' && currentLesson && (
            <section className="panel lesson-panel">
              <div className="progress-row">
                <span>Lesson {lessonIndex + 1} of {selectedLevel.lessons.length}</span>
                <button className="text-button" onClick={() => setScreen('level')} type="button">
                  Exit
                </button>
              </div>

              <div className="lesson-card">
                <span className="lesson-emoji">{currentLesson.emoji}</span>
                <div className="lesson-letter">{currentLesson.letter}</div>
                <p className="lesson-sound">Sound: {currentLesson.transliteration}</p>
                <div className="word-card">
                  <span className="word-label">Word</span>
                  <strong>{currentLesson.word}</strong>
                  <span>{currentLesson.meaning}</span>
                </div>
              </div>

              <button className="primary-button" onClick={nextLesson} type="button">
                {lessonIndex === selectedLevel.lessons.length - 1 ? 'Start quiz' : 'Next card'}
              </button>
            </section>
          )}

          {screen === 'quiz' && currentQuestion && (
            <section className="panel">
              <div className="progress-row">
                <span>Quiz {quizIndex + 1} of {selectedLevel.quiz.length}</span>
                <span>{quizAnswers.length} answered</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>

              <div className="options-grid">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={`option-card ${selectedAnswer === option ? 'option-card-active' : ''}`}
                    onClick={() => setSelectedAnswer(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <button
                className="primary-button"
                disabled={!selectedAnswer}
                onClick={submitAnswer}
                type="button"
              >
                {quizIndex === selectedLevel.quiz.length - 1 ? 'Finish quiz' : 'Next question'}
              </button>
            </section>
          )}

          {screen === 'result' && lastScore !== null && (
            <section className="panel result-panel">
              <p className="section-kicker">Level Result</p>
              <h2>
                Score {lastScore}/{selectedLevel.quiz.length}
              </h2>
              <p>
                {lastScore >= selectedLevel.passingScore
                  ? 'Level passed. Your score has been saved.'
                  : 'Level not passed yet. Review the cards and try again.'}
              </p>

              <div className="result-actions">
                <button className="primary-button" onClick={startLessons} type="button">
                  Retry level
                </button>
                <button className="secondary-button" onClick={goToNextLevel} type="button">
                  {nextLevel ? `Go to Level ${nextLevel.id}` : 'Back to levels'}
                </button>
                <button className="secondary-button" onClick={() => setScreen('home')} type="button">
                  Back to home
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
