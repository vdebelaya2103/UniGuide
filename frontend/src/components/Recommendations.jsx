
import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

function Recommendations() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [favoriteIds, setFavoriteIds] = useState([])
  const [favoriteError, setFavoriteError] = useState('')

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const [data, favorites] = await Promise.all([
          apiRequest('/recommendations/'),
          apiRequest('/favorites/'),
        ])

        setActivities(data)
        setFavoriteIds(favorites.map((item) => item.id))
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [])

    async function toggleFavorite(activityId) {
      setFavoriteError('')

      const isFavorite = favoriteIds.includes(activityId)

      try {
        await apiRequest(`/favorites/${activityId}`, {
          method: isFavorite ? 'DELETE' : 'POST',
        })

        setFavoriteIds((previous) =>
          isFavorite
            ? previous.filter((id) => id !== activityId)
            : [...previous, activityId]
        )
      } catch (error) {
        setFavoriteError(error.message)
      }
    }

  if (loading) {
    return <p>Загрузка рекомендаций...</p>
  }

  return (
    <section className="recommendations-section">
      <h2>Рекомендации для вас</h2>
      <p>Университетские активности, подобранные по вашим интересам.</p>

      {error && <p className="form-message">{error}</p>}

      {!error && activities.length === 0 && (
        <p>Подходящих активностей пока нет. Выберите интересы.</p>
      )}

      {favoriteError && <p className="form-message">{favoriteError}</p>}

      <div className="activities-list">
        {activities.map((activity) => (
          <article key={activity.id} className="activity-card">
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
              <p>
                <strong>Место:</strong> {activity.location || 'Не указано'}
              </p>

              <button
                className="details-button"
                onClick={() =>
                  setSelectedActivity(
                    selectedActivity?.id === activity.id ? null : activity
                  )
                }
              >
                {selectedActivity?.id === activity.id
                  ? 'Скрыть подробности'
                  : 'Подробнее'}
              </button>
              <button
                  className="favorite-button"
                  onClick={() => toggleFavorite(activity.id)}
                >
                  {favoriteIds.includes(activity.id)
                    ? 'Удалить из избранного'
                    : 'В избранное'}
                </button>
              {selectedActivity?.id === activity.id && (
                <div className="activity-details">
                  <p>
                    <strong>Дата:</strong>{' '}
                    {activity.event_date
                      ? new Date(activity.event_date).toLocaleString('ru-RU')
                      : 'Не указана'}
                  </p>

                  <p>
                    <strong>Условия участия:</strong>{' '}
                    {activity.participation_info || 'Не указаны'}
                  </p>

                  {activity.registration_url && (
                    <a
                      href={activity.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Перейти к регистрации
                    </a>
                  )}
                </div>
              )}
            </article>
        ))}
      </div>
    </section>
  )
}

export default Recommendations
