
import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

function Favorites() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await apiRequest('/favorites/')
        setActivities(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  async function removeFavorite(activityId) {
    try {
      await apiRequest(`/favorites/${activityId}`, {
        method: 'DELETE',
      })

      setActivities((previous) =>
        previous.filter((activity) => activity.id !== activityId)
      )
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) {
    return <p>Загрузка избранного...</p>
  }

  return (
    <section className="favorites-section">
      <h2>Избранные активности</h2>
      <p>Здесь находятся сохранённые вами активности.</p>

      {error && <p className="form-message">{error}</p>}

      {activities.length === 0 ? (
        <p>Вы пока ничего не добавили в избранное.</p>
      ) : (
        <div className="activities-list">
          {activities.map((activity) => (
            <article key={activity.id} className="activity-card">
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <p>
                <strong>Место:</strong> {activity.location || 'Не указано'}
              </p>

              <button
                className="favorite-button"
                onClick={() => removeFavorite(activity.id)}
              >
                Удалить из избранного
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Favorites
