import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/convex'
import { X, Search, Filter, Tag, DollarSign, MapPin, Star, Package, Sparkles, TrendingUp } from 'lucide-react'
import ConvexImage from './ConvexImage'
import './AdvancedSearchModal.css'

const AdvancedSearchModal = ({ isOpen, onClose, onSearch, userType }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const suggestionsRef = useRef(null)
  const inputRef = useRef(null)
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    marque: '',
    typeProduit: '',
    typePublic: '',
    genre: '',
    onSale: false,
    featured: false,
    inStock: true
  })

  // Récupérer les catégories
  const categories = useQuery(api.products.getCategories)
  
  // Récupérer les valeurs uniques pour les filtres (depuis les produits existants)
  const allProducts = useQuery(api.products.getProducts, { limit: 1000 })

  // Extraire les valeurs uniques
  const uniqueMarques = allProducts ? [...new Set(allProducts.filter(p => p.marque).map(p => p.marque))].sort() : []
  const uniqueTypeProduits = allProducts ? [...new Set(allProducts.filter(p => p.typeProduit).map(p => p.typeProduit))].sort() : []
  const uniqueTypePublics = allProducts ? [...new Set(allProducts.filter(p => p.typePublic).map(p => p.typePublic))].sort() : []
  const uniqueGenres = allProducts ? [...new Set(allProducts.filter(p => p.genre).map(p => p.genre))].sort() : []
  const uniqueLocations = allProducts ? [...new Set(allProducts.filter(p => p.location).map(p => p.location))].sort() : []

  // Générer les suggestions basées sur la recherche
  const suggestions = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 2 || !allProducts) return []
    
    const searchLower = searchTerm.toLowerCase()
    const results = []
    
    // Recherche dans les produits
    allProducts.forEach(product => {
      const nameMatch = product.name.toLowerCase().includes(searchLower)
      const marqueMatch = product.marque?.toLowerCase().includes(searchLower)
      const descMatch = product.description?.toLowerCase().includes(searchLower)
      
      if (nameMatch || marqueMatch || descMatch) {
        results.push({
          type: 'product',
          id: product._id,
          name: product.name,
          marque: product.marque,
          price: product.price,
          image: product.images?.[0],
          category: product.categoryName || product.category
        })
      }
    })
    
    // Recherche dans les marques
    uniqueMarques.forEach(marque => {
      if (marque.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'marque',
          name: marque,
          icon: '🏷️'
        })
      }
    })
    
    // Recherche dans les catégories
    categories?.forEach(cat => {
      if (cat.name.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'category',
          id: cat._id,
          name: cat.name,
          icon: cat.icon
        })
      }
    })
    
    // Limiter à 8 suggestions
    return results.slice(0, 8)
  }, [searchTerm, allProducts, uniqueMarques, categories])

  useEffect(() => {
    if (!isOpen) {
      // Reset filters when modal closes
      setSearchTerm('')
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
      setFilters({
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        location: '',
        marque: '',
        typeProduit: '',
        typePublic: '',
        genre: '',
        onSale: false,
        featured: false,
        inStock: true
      })
    }
  }, [isOpen])

  // Gérer les clics en dehors des suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const searchParams = {
      searchTerm: searchTerm.trim(),
      ...filters
    }
    onSearch(searchParams)
    onClose()
  }

  const handleReset = () => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      marque: '',
      typeProduit: '',
      typePublic: '',
      genre: '',
      onSale: false,
      featured: false,
      inStock: true
    })
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'product') {
      // Redirection directe vers la page produit
      onClose()
      navigate(`/product/${suggestion.id}`)
    } else if (suggestion.type === 'marque') {
      // Appliquer le filtre marque et rechercher
      setFilters(prev => ({ ...prev, marque: suggestion.name }))
      setSearchTerm(suggestion.name)
      setShowSuggestions(false)
    } else if (suggestion.type === 'category') {
      // Appliquer le filtre catégorie et rechercher
      setFilters(prev => ({ ...prev, categoryId: suggestion.id }))
      setSearchTerm(suggestion.name)
      setShowSuggestions(false)
    }
  }

  const handleSearchTermChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSuggestions(value.length >= 2)
    setSelectedSuggestionIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
      default:
        break
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="search-modal-header">
          <div className="search-modal-title-group">
            <div className="search-icon-wrapper">
              <Search className="search-icon-main" />
              <Sparkles className="search-icon-sparkle" />
            </div>
            <div>
              <h2 className="search-modal-title">Recherche Avancée</h2>
              <p className="search-modal-subtitle">Trouvez exactement ce que vous cherchez</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Input */}
        <div className="search-input-section">
          <div className="search-input-wrapper">
            <Search className="search-input-icon" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un produit, une marque..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              className="search-input"
              autoComplete="off"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('')
                  setShowSuggestions(false)
                  setSelectedSuggestionIndex(-1)
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-dropdown">
              <div className="suggestions-header">
                <TrendingUp size={14} />
                <span>Suggestions ({suggestions.length})</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.id || suggestion.name}-${index}`}
                  className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {suggestion.type === 'product' ? (
                    <>
                      <div className="suggestion-icon product-icon">
                        {suggestion.image ? (
                          <ConvexImage 
                            storageId={suggestion.image} 
                            alt={suggestion.name}
                            fallback={<Package size={20} />}
                          />
                        ) : (
                          <Package size={20} />
                        )}
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-meta">
                          {suggestion.marque && <span className="suggestion-marque">{suggestion.marque}</span>}
                          <span className="suggestion-price">{suggestion.price.toFixed(2)}€</span>
                        </div>
                      </div>
                      <div className="suggestion-arrow">→</div>
                    </>
                  ) : suggestion.type === 'marque' ? (
                    <>
                      <div className="suggestion-icon marque-icon">
                        {suggestion.icon}
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-meta">Marque</div>
                      </div>
                      <div className="suggestion-arrow">→</div>
                    </>
                  ) : (
                    <>
                      <div className="suggestion-icon category-icon">
                        {suggestion.icon}
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-meta">Catégorie</div>
                      </div>
                      <div className="suggestion-arrow">→</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters Grid */}
        <div className="filters-container">
          <div className="filters-section-title">
            <Filter size={18} />
            <span>Filtres de recherche</span>
          </div>

          <div className="filters-grid">
            {/* Catégorie */}
            <div className="filter-group">
              <label className="filter-label">
                <Tag size={16} />
                Catégorie
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="filter-select"
              >
                <option value="">Toutes les catégories</option>
                {categories?.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix Min */}
            <div className="filter-group">
              <label className="filter-label">
                <DollarSign size={16} />
                Prix minimum
              </label>
              <input
                type="number"
                placeholder="0 €"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="filter-input"
                min="0"
              />
            </div>

            {/* Prix Max */}
            <div className="filter-group">
              <label className="filter-label">
                <DollarSign size={16} />
                Prix maximum
              </label>
              <input
                type="number"
                placeholder="1000 €"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="filter-input"
                min="0"
              />
            </div>

            {/* Localisation */}
            <div className="filter-group">
              <label className="filter-label">
                <MapPin size={16} />
                Ville
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-select"
              >
                <option value="">Toutes les villes</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Marque */}
            <div className="filter-group">
              <label className="filter-label">
                <Star size={16} />
                Marque
              </label>
              <select
                value={filters.marque}
                onChange={(e) => handleFilterChange('marque', e.target.value)}
                className="filter-select"
              >
                <option value="">Toutes les marques</option>
                {uniqueMarques.map(marque => (
                  <option key={marque} value={marque}>{marque}</option>
                ))}
              </select>
            </div>

            {/* Type de Produit */}
            <div className="filter-group">
              <label className="filter-label">
                <Package size={16} />
                Type de produit
              </label>
              <select
                value={filters.typeProduit}
                onChange={(e) => handleFilterChange('typeProduit', e.target.value)}
                className="filter-select"
              >
                <option value="">Tous les types</option>
                {uniqueTypeProduits.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Type de Public */}
            <div className="filter-group">
              <label className="filter-label">
                👥 Type de public
              </label>
              <select
                value={filters.typePublic}
                onChange={(e) => handleFilterChange('typePublic', e.target.value)}
                className="filter-select"
              >
                <option value="">Tous les publics</option>
                {uniqueTypePublics.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Genre */}
            <div className="filter-group">
              <label className="filter-label">
                💆 Genre
              </label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select"
              >
                <option value="">Tous les genres</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="toggle-filters">
            <label className="toggle-filter-item">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
              />
              <span className="toggle-label">
                <span className="toggle-icon">🔥</span>
                En promotion
              </span>
            </label>

            <label className="toggle-filter-item">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
              />
              <span className="toggle-label">
                <span className="toggle-icon">⭐</span>
                Produits vedettes
              </span>
            </label>

            <label className="toggle-filter-item">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              />
              <span className="toggle-label">
                <span className="toggle-icon">✓</span>
                En stock uniquement
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="search-modal-actions">
          <button className="reset-btn" onClick={handleReset}>
            Réinitialiser
          </button>
          <button className="search-btn-primary" onClick={handleSearch}>
            <Search size={18} />
            Rechercher
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearchModal
