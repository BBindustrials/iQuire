import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import styles from './Hero.module.css';

// Import local images
import hero1 from '../../assets/images/hero/hero-1.png';
import hero2 from '../../assets/images/hero/hero-2.png';
import hero3 from '../../assets/images/hero/hero-3.png';
import hero4 from '../../assets/images/hero/hero-4.png';

const heroImages = [
  {
    id: 1,
    src: hero1,
    alt: 'NYSC Orientation Camp - Skills for Your Service Year and Beyond',
  },
  {
    id: 2,
    src: hero2,
    alt: 'African graduates and young professionals',
  },
  {
    id: 3,
    src: hero3,
    alt: 'NYSC corps members in professional environment',
  },
  {
    id: 4,
    src: hero4,
    alt: 'Young African professionals collaborating',
  },
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  return (
    <section className={styles.hero}>
      {/* Background Image Carousel */}
      <div className={styles.heroBackground}>
        {heroImages.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.bgSlide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `url(${image.src})` }}
          />
        ))}
        <div className={styles.overlay}></div>
      </div>

      {/* Content Overlay */}
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            We Train <span className={styles.highlight}>African Talent</span>{' '}
            That Global Companies <span className={styles.highlight}>Hire.</span>
          </h1>
          <p className={styles.subtitle}>
            Empowering African graduates with work readiness skills.
          </p>
          <div className={styles.ctaGroup}>
            {/* Get Trained - Green Button */}
            <Button 
              variant="primary" 
              color="green" 
              size="lg" 
              href="/get-started" 
              className={`${styles.ctaButton} ${styles.greenButton}`}
            >
              Get Trained
            </Button>
            
            {/* Hire Our Talent - Gold Button */}
            <Button 
              variant="primary" 
              color="gold" 
              size="lg" 
              href="/hire-talent" 
              className={`${styles.ctaButton} ${styles.goldButton}`}
            >
              Hire Our Talent
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className={styles.scrollIndicator}>
        <span className={styles.scrollText}>SCROLL</span>
        <span className={styles.scrollArrow}>↓</span>
      </div>

      {/* Carousel Controls */}
      <button
        className={`${styles.carouselButton} ${styles.prev}`}
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className={`${styles.carouselButton} ${styles.next}`}
        onClick={goToNext}
        aria-label="Next slide"
      >
        ›
      </button>
      <div className={styles.dots}>
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};