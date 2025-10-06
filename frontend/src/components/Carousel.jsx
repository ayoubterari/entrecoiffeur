import React, { useState, useEffect } from 'react'

const Carousel = ({ items, title, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (autoPlay && items.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === items.length - 1 ? 0 : prevIndex + 1
        )
      }, interval)

      return () => clearInterval(timer)
    }
  }, [autoPlay, interval, items.length])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  if (!items || items.length === 0) return null

  return (
    <div className="carousel-container">
      {title && <h3 className="carousel-title">{title}</h3>}
      
      <div className="carousel">
        <div className="carousel-wrapper">
          <div 
            className="carousel-content"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="carousel-slide">
                {item.type === 'product' ? (
                  <div className="product-slide">
                    <div className="product-image">
                      {item.images && item.images[0] ? (
                        // Vérifier si c'est une URL d'image ou un emoji
                        item.images[0].startsWith('blob:') || item.images[0].startsWith('http') || item.images[0].startsWith('data:') ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.name}
                            className="carousel-product-image"
                            onError={(e) => {
                              // Fallback en cas d'erreur de chargement
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : (
                          <span className="product-emoji">{item.images[0]}</span>
                        )
                      ) : (
                        <div className="product-placeholder">🛍️</div>
                      )}
                      {/* Fallback emoji caché par défaut */}
                      <div className="product-placeholder" style={{ display: 'none' }}>🛍️</div>
                    </div>
                    <div className="product-info">
                      <h4>{item.name}</h4>
                      <p className="product-description">{item.description}</p>
                      <div className="product-price">
                        {item.originalPrice && (
                          <span className="original-price">{item.originalPrice}€</span>
                        )}
                        <span className="current-price">{item.price}€</span>
                      </div>
                      <button className="add-to-cart-btn">Ajouter au panier</button>
                    </div>
                  </div>
                ) : (
                  <div className="banner-slide" style={{ backgroundColor: item.color }}>
                    <div className="banner-content">
                      <h2>{item.title}</h2>
                      <p>{item.description}</p>
                      {item.buttonText && (
                        <button className="banner-btn">{item.buttonText}</button>
                      )}
                    </div>
                    <div className="banner-image">
                      {item.image}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn-prev" onClick={goToPrevious}>
              ‹
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
              ›
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {items.length > 1 && (
          <div className="carousel-dots">
            {items.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Carousel
