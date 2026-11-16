
import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'

function InterestSelector({ onSave }) {
  const [categories, setCategories] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadInterests() {
      try {
        const [allCategories, userInterests] = await Promise.all([
          apiRequest('/categories'),
          apiRequest('/interests/'),
        ])

        setCategories(allCategories)
        setSelectedIds(userInterests.map((item) => item.id))
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadInterests()
  }, [])

  function toggleCategory(categoryId) {
    setSelectedIds((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId]
    )
  }

  async function saveInterests() {
    setSaving(true)
    setMessage('')

    try {
      await apiRequest('/interests/', {
        method: 'PUT',
        body: JSON.stringify({
          category_ids: selectedIds,
        }),
      })

      setMessage('Интересы успешно сохранены')
      onSave?.()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Загрузка интересов...</p>
  }

  return (
    <section className="interests-section">
      <h2>Выберите свои интересы</h2>
      <p>Укажите направления, которые вам интересны.</p>

      <div className="interests-list">
        {categories.map((category) => (
          <label key={category.id} className="interest-item">
            <input
              type="checkbox"
              checked={selectedIds.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>

      <button onClick={saveInterests} disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить интересы'}
      </button>

      {message && <p className="form-message">{message}</p>}
    </section>
  )
}

export default InterestSelector
