
import { useState } from 'react'
import { apiRequest } from './api/client'
import InterestSelector from './components/InterestSelector'
import Recommendations from './components/Recommendations'
import ActivityCatalog from './components/ActivityCatalog'
import Favorites from './components/Favorites'
import './App.css'

function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [recommendationsVersion, setRecommendationsVersion] = useState(0)
  const [activeTab, setActiveTab] = useState('recommendations')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        setMessage('Регистрация прошла успешно. Теперь войдите в систему.')
        setMode('login')
        setPassword('')
      } else {
        const result = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })

        sessionStorage.setItem('access_token', result.access_token)

        const profile = await apiRequest('/auth/me')

        setUser(profile)
        setPassword('')
        setActiveTab('recommendations')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('access_token')
    setUser(null)
    setPassword('')
    setMessage('')
    setActiveTab('recommendations')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>UniGuide</h1>
        <p>Твой навигатор по университетской жизни</p>
      </header>

      <main className="main">
        {user ? (
          <div className="user-dashboard">
            <section className="auth-card">
              <h2>Добро пожаловать!</h2>
              <p>Вы вошли как {user.email}</p>

              <button onClick={handleLogout}>
                Выйти
              </button>
            </section>

            <InterestSelector
              onSave={() =>
                setRecommendationsVersion((version) => version + 1)
              }
            />

            <nav className="dashboard-nav">
              <button
                type="button"
                className={activeTab === 'recommendations' ? 'active' : ''}
                onClick={() => setActiveTab('recommendations')}
              >
                Рекомендации
              </button>

              <button
                type="button"
                className={activeTab === 'catalog' ? 'active' : ''}
                onClick={() => setActiveTab('catalog')}
              >
                Каталог
              </button>

              <button
                type="button"
                className={activeTab === 'favorites' ? 'active' : ''}
                onClick={() => setActiveTab('favorites')}
              >
                Избранное
              </button>
            </nav>

            {activeTab === 'recommendations' ? (
              <Recommendations key={recommendationsVersion} />
            ) : activeTab === 'catalog' ? (
              <ActivityCatalog />
            ) : (
              <Favorites />
            )}
          </div>
        ) : (
          <section className="auth-card">
            <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Электронная почта</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={mode === 'register' ? 8 : undefined}
                required
              />

              <button type="submit" disabled={loading}>
                {loading
                  ? 'Подождите...'
                  : mode === 'login'
                    ? 'Войти'
                    : 'Зарегистрироваться'}
              </button>
            </form>

            {message && <p className="form-message">{message}</p>}

            <button
              type="button"
              className="switch-button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setMessage('')
              }}
            >
              {mode === 'login'
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
