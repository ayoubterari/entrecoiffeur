import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../lib/convex'
import './SmartSearch.css'

const SmartSearch = ({ onSearch, onProductSelect, placeholder = "Rechercher des produits..." }) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  // Queries Convex
  const searchResults = useQuery(
    api.functions.queries.search.searchProducts,
    query.length >= 2 ? { query, limit: 8 } : "skip"
  )
  
  const suggestions = useQuery(
    api.functions.queries.search.getSearchSuggestions,
    query.length >= 1 ? { query, limit: 5 } : "skip"
  )
  
  const trendingSearches = useQuery(api.functions.queries.search.getTrendingSearches)

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return

      const totalItems = (searchResults?.length || 0) + (suggestions?.length || 0)
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => (prev + 1) % totalItems)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1)
          break
        case 'Enter':
          event.preventDefault()
          handleSelectItem(selectedIndex)
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, selectedIndex, searchResults, suggestions])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setSelectedIndex(-1)
    
    // Déclencher la recherche parent si nécessaire
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSelectItem = (index) => {
    const totalProducts = searchResults?.length || 0
    
    if (index < totalProducts && searchResults) {
      // Sélection d'un produit
      const product = searchResults[index]
      if (onProductSelect) {
        onProductSelect(product)
      }
      setQuery(product.name)
    } else {
      // Sélection d'une suggestion
      const suggestionIndex = index - totalProducts
      if (suggestions && suggestions[suggestionIndex]) {
        const suggestion = suggestions[suggestionIndex]
        setQuery(suggestion)
        if (onSearch) {
          onSearch(suggestion)
        }
      }
    }
    
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
    setIsOpen(false)
    if (onSearch) {
      onSearch(suggestion)
    }
  }

  const handleProductClick = (product) => {
    if (onProductSelect) {
      onProductSelect(product)
    }
    setQuery(product.name)
    setIsOpen(false)
  }

  const handleTrendingClick = (term) => {
    setQuery(term)
    setIsOpen(false)
    if (onSearch) {
      onSearch(term)
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      }
      setIsOpen(false)
    }
  }

  const highlightMatch = (text, query) => {
    if (!query) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">{part}</span>
      ) : part
    )
  }

  return (
    <div className="smart-search" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </div>
      </form>

      {isOpen && (
        <div className="search-results" ref={resultsRef}>
          {/* Résultats de produits */}
          {searchResults && searchResults.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title">Produits</span>
                <span className="search-section-count">{searchResults.length}</span>
              </div>
              {searchResults.map((product, index) => (
                <div
                  key={product._id}
                  className={`search-item product-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <span className="product-placeholder">🛍️</span>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-name">
                      {highlightMatch(product.name, query)}
                    </div>
                    <div className="product-price">{product.price}€</div>
                    {product.stock <= 0 && (
                      <span className="out-of-stock">Rupture de stock</span>
                    )}
                  </div>
                  <div className="product-score">
                    {product.featured && <span className="featured-badge">⭐</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title">Suggestions</span>
              </div>
              {suggestions.map((suggestion, index) => {
                const globalIndex = (searchResults?.length || 0) + index
                return (
                  <div
                    key={suggestion}
                    className={`search-item suggestion-item ${selectedIndex === globalIndex ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-text">
                      {highlightMatch(suggestion, query)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Recherches tendances (quand pas de query) */}
          {(!query || query.length < 2) && trendingSearches && (
            <div className="search-section">
              <div className="search-section-header">
                <span className="search-section-title">Recherches populaires</span>
              </div>
              {trendingSearches.slice(0, 6).map((trending) => (
                <div
                  key={trending.term}
                  className="search-item trending-item"
                  onClick={() => handleTrendingClick(trending.term)}
                >
                  <span className="trending-icon">🔥</span>
                  <span className="trending-text">{trending.term}</span>
                  <span className="trending-count">{trending.count}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message si pas de résultats */}
          {query.length >= 2 && (!searchResults || searchResults.length === 0) && (
            <div className="search-section">
              <div className="no-results">
                <span className="no-results-icon">😔</span>
                <span className="no-results-text">
                  Aucun produit trouvé pour "{query}"
                </span>
                <div className="no-results-suggestions">
                  <p>Essayez avec :</p>
                  <ul>
                    <li>Des mots-clés plus généraux</li>
                    <li>Vérifiez l'orthographe</li>
                    <li>Utilisez des synonymes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartSearch
