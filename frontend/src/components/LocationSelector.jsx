import React, { useState, useMemo } from 'react'
import { frenchRegions, getAllCities, searchCity } from '../data/frenchLocations'

const LocationSelector = ({ value, onChange }) => {
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Départements de la région sélectionnée
  const departments = useMemo(() => {
    if (!selectedRegion) return []
    const region = frenchRegions.find(r => r.id === selectedRegion)
    return region ? region.departments : []
  }, [selectedRegion])

  // Villes du département sélectionné
  const cities = useMemo(() => {
    if (!selectedDepartment) return []
    const dept = departments.find(d => d.id === selectedDepartment)
    return dept ? dept.cities : []
  }, [selectedDepartment, departments])

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    return searchCity(searchQuery).slice(0, 10)
  }, [searchQuery])

  const handleCitySelect = (city, deptName, regionName) => {
    onChange(`${city}, ${deptName}, ${regionName}`)
    setSearchQuery('')
    setShowSearch(false)
  }

  const handleManualSelect = (city) => {
    const dept = departments.find(d => d.id === selectedDepartment)
    const region = frenchRegions.find(r => r.id === selectedRegion)
    if (dept && region) {
      onChange(`${city}, ${dept.name}, ${region.name}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Recherche rapide */}
      <div style={{ position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
          🔍 Recherche rapide
        </label>
        <input
          type="text"
          placeholder="Rechercher une ville, département ou région..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowSearch(true)
          }}
          onFocus={() => setShowSearch(true)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e5e5e5',
            borderRadius: '8px',
            fontSize: '0.9rem',
            transition: 'border-color 0.2s'
          }}
        />
        
        {/* Résultats de recherche */}
        {showSearch && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '2px solid #e5e5e5',
            borderRadius: '8px',
            marginTop: '0.5rem',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleCitySelect(result.city, result.department, result.region)}
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8f8f8'}
                onMouseOut={(e) => e.target.style.background = 'white'}
              >
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{result.city}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {result.department} • {result.region}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        color: '#999',
        fontSize: '0.85rem'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
        <span>OU</span>
        <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
      </div>

      {/* Sélection manuelle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Région */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
            🗺️ Région
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value)
              setSelectedDepartment('')
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">Sélectionner une région</option>
            {frenchRegions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>

        {/* Département */}
        {selectedRegion && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              📍 Département
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Sélectionner un département</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Ville */}
        {selectedDepartment && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>
              🏙️ Ville
            </label>
            <select
              value={value ? value.split(',')[0].trim() : ''}
              onChange={(e) => handleManualSelect(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #C0B4A5',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <option value="">Sélectionner une ville</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Affichage de la sélection */}
      {value && (
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(192, 180, 165, 0.1) 0%, rgba(212, 201, 188, 0.1) 100%)',
          borderRadius: '8px',
          border: '2px solid #C0B4A5'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2d2d2d' }}>
            📌 Localisation sélectionnée :
          </div>
          <div style={{ fontSize: '0.95rem', color: '#666' }}>
            {value}
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSelector
