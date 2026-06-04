import { useState, useEffect } from 'react'
import DashboardScreen  from './screens/DashboardScreen'
import PracticeScreen   from './screens/PracticeScreen'
import DiagnosticScreen from './screens/DiagnosticScreen'
import MockExamScreen   from './screens/MockExamScreen'
import QuickDrillScreen from './screens/QuickDrillScreen'
import { loadAllAttempts } from './lib/db'
import { computeStreak, computePoints, LEVELS, computeLevel } from './lib/mastery'
import './App.css'

export default function App() {
  const [screen, setScreen]               = useState('home')
  const [attempts, setAttempts]           = useState([])
  const [practiceSkill, setPracticeSkill] = useState(null)

  useEffect(() => {
    loadAllAttempts().then(setAttempts).catch(() => {})
  }, [])

  const refreshAttempts = () => {
    loadAllAttempts().then(setAttempts).catch(() => {})
  }

  const handleDashboardSelect = (mode, skill = null) => {
    if (skill) setPracticeSkill(skill)
    setScreen(mode)
  }

  const handleDiagnosticStartPractice = (skill) => {
    setPracticeSkill(skill)
    setScreen('practice')
  }

  const streak = computeStreak(attempts)
  const points = computePoints(attempts)
  const level  = LEVELS[computeLevel(points)]

  return (
    <div className="app">
      <header className="app-topbar">
        <button className="app-logo" onClick={() => setScreen('home')}>
          SQL Dry Run
        </button>
        <div className="app-stats">
          {streak > 0 && <span className="stat">🔥 {streak}</span>}
          <span className="stat">{points} pts</span>
          <span className="stat level">{level}</span>
        </div>
      </header>

      <div className="app-body">
        {screen === 'home' && (
          <DashboardScreen
            attempts={attempts}
            onSelect={handleDashboardSelect}
          />
        )}
        {screen === 'quick-drill' && (
          <QuickDrillScreen
            onBack={() => { refreshAttempts(); setScreen('home') }}
            onAttemptLogged={refreshAttempts}
          />
        )}
        {screen === 'practice' && (
          <PracticeScreen
            initialSkill={practiceSkill}
            onBack={() => { setPracticeSkill(null); setScreen('home') }}
            onAttemptLogged={refreshAttempts}
          />
        )}
        {screen === 'diagnostic' && (
          <DiagnosticScreen
            onBack={() => setScreen('home')}
            onAttemptLogged={refreshAttempts}
            onStartPractice={handleDiagnosticStartPractice}
          />
        )}
        {screen === 'mock' && (
          <MockExamScreen
            onBack={() => setScreen('home')}
            onAttemptLogged={refreshAttempts}
          />
        )}
      </div>
    </div>
  )
}
