
import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

function ActivityCatalog() {
  const [activities, setActivities] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiRequest('/categories')
        setCategories(data)
      } catch (error) {
        setError(error.message)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadActivities() {
      setLoading(true)
      setError('')

      try {
        const endpoint = categoryId
          ? `/activities?category_id=${categoryId}`
          : '/activities'

        const data = await apiRequest(endpoint)

        if (!cancelled) {
          setActivities(data)
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadActivities()

    return () => {
      cancelled = true
    }
  }, [categoryId])

  return (
    <section className="recommendations-section">
      <h2>Каталог активностей</h2>
      <p>Все доступные университетские активности.</p>

      <div className="catalog-filter">
        <label htmlFor="category-filter">Категория</label>
        <select
          id="category-filter"
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value)
            setSelectedActivity(null)
          }}
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-message">{error}</p>}

      {loading ? (
        <p>Загрузка активностей...</p>
      ) : !error && activities.length === 0 ? (
        <p>Активности не найдены.</p>
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
                className="details-button"
                onClick={() =>
                  setSelectedActivity(
                    selectedActivity === activity.id ? null : activity.id
                  )
                }
              >
                {selectedActivity === activity.id
                  ? 'Скрыть подробности'
                  : 'Подробнее'}
              </button>

              {selectedActivity === activity.id && (
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
      )}
    </section>
  )
}

export default ActivityCatalog
