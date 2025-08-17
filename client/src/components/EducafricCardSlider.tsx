import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description: string;
  image?: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

interface EducafricCardSliderProps {
  cards: Card[];
  title?: string;
  subtitle?: string;
}

export function EducafricCardSlider({ cards, title, subtitle }: EducafricCardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollToCard = (index: number) => {
    if (sliderRef.current) {
      const cardWidth = sliderRef?.current?.children[0]?.clientWidth || 0;
      const gap = 24; // 6 * 4px (gap-6)
      const scrollLeft = (cardWidth + gap) * index;
      sliderRef?.current?.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      setCurrentIndex(index);
    }
  };

  const scrollPrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : (Array.isArray(cards) ? cards.length : 0) - 1;
    scrollToCard(newIndex);
  };

  const scrollNext = () => {
    const newIndex = currentIndex < (Array.isArray(cards) ? cards.length : 0) - 1 ? currentIndex + 1 : 0;
    scrollToCard(newIndex);
  };

  return (
    <section className="educafric-section">
      <div className="educafric-container">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div 
          ref={sliderRef}
          className="educafric-slider"
          onScroll={(e) => {
            const scrollLeft = e?.currentTarget?.scrollLeft;
            const cardWidth = e?.currentTarget?.children[0]?.clientWidth || 0;
            const gap = 24;
            const newIndex = Math.round(scrollLeft / (cardWidth + gap));
            setCurrentIndex(newIndex);
          }}
        >
          {(Array.isArray(cards) ? cards : []).map((card, index) => (
            <div key={card.id} className="educafric-card group">
              {card.image && (
                <div className="educafric-card-visual">
                  <img
                    src={card.image}
                    alt={card.title || ''}
                    className="educafric-card-img"
                    width={400}
                    height={200}
                  />
                </div>
              )}
              
              <div className="educafric-card-content">
                <div className="educafric-card-meta">
                  <h3 className="educafric-card-title">{card.title || ''}</h3>
                  <p className="educafric-card-desc">{card.description || ''}</p>
                </div>

                <div className="educafric-card-actions">
                  <a 
                    href={card?.primaryAction?.href}
                    className="educafric-btn educafric-btn-primary"
                  >
                    {card?.primaryAction?.label}
                  </a>
                  
                  {card.secondaryAction && (
                    <a 
                      href={card?.secondaryAction?.href}
                      className="educafric-btn educafric-btn-secondary"
                    >
                      {card?.secondaryAction?.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(Array.isArray(cards) ? cards.length : 0) > 1 && (
          <>
            <div className="educafric-slider-controls">
              <button
                onClick={scrollPrev}
                className="educafric-control-button"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={scrollNext}
                className="educafric-control-button"
                aria-label="Next card"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="educafric-pagination">
              <div className="flex">
                {(Array.isArray(cards) ? cards : []).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCard(index)}
                    className={`educafric-marker ${
                      index === currentIndex ? 'educafric-marker-active' : ''
                    }`}
                    aria-label={`Go to card ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// Example usage data for the component
export const educafricFeatureCards: Card[] = [
  {
    id: 'grades',
    title: 'Grade Management',
    description: 'Comprehensive grading system with African-style report cards and automatic parent notifications.',
    image: '/api/placeholder/400/200',
    primaryAction: {
      label: 'Manage Grades',
      href: '/grades'
    },
    secondaryAction: {
      label: 'View Reports',
      href: '/reports'
    }
  },
  {
    id: 'attendance',
    title: 'Attendance Tracking',
    description: 'Real-time attendance monitoring with SMS notifications to parents via mobile networks.',
    image: '/api/placeholder/400/200',
    primaryAction: {
      label: 'Track Attendance',
      href: '/attendance'
    },
    secondaryAction: {
      label: 'View Analytics',
      href: '/analytics'
    }
  },
  {
    id: 'communication',
    title: 'Communication Hub',
    description: 'Connect with parents and students through SMS, WhatsApp, and email in their preferred language.',
    image: '/api/placeholder/400/200',
    primaryAction: {
      label: 'Send Messages',
      href: '/communications'
    },
    secondaryAction: {
      label: 'Message History',
      href: '/communications/history'
    }
  }
];