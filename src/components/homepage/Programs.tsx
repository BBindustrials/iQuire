import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import styles from './Programs.module.css';

// Import course images
import ieespImage from '../../assets/images/courses/ieesp.jpg';
import tech360Image from '../../assets/images/courses/tech360.jpg';
import aiWorkshopsImage from '../../assets/images/courses/ai-workshops.jpg';
import cvOptimizationImage from '../../assets/images/courses/cv-optimization.jpg';
import linkedinOptimizationImage from '../../assets/images/courses/linkedin-optimization.jpg';
import mentorshipImage from '../../assets/images/courses/mentorship.jpg';

interface Course {
  id: string;
  title: string;
  description: string;
  audience: string[];
  image: string;
  color: string;
  rating: number;
  duration: string;
  level: string;
  free: boolean;
}

const courses: Course[] = [
  {
    id: 'ieesp',
    title: 'IEESP',
    description: 'IQuire Entry-Level Employability Skills Program — practical training designed to develop the digital, professional and workplace skills required for entry-level opportunities.',
    audience: ['Students', 'Graduates', 'Job Seekers'],
    image: ieespImage,
    color: 'green',
    rating: 4.8,
    duration: '6 Weeks',
    level: 'Beginner',
    free: true,
  },
  {
    id: 'tech360',
    title: 'Tech360',
    description: 'Comprehensive no-code technology training covering areas such as product management and project management for individuals pursuing careers in technology.',
    audience: ['Students', 'Graduates', 'Career Switchers'],
    image: tech360Image,
    color: 'green',
    rating: 4.9,
    duration: '8 Weeks',
    level: 'Intermediate',
    free: false,
  },
  {
    id: 'ai-workshops',
    title: 'AI Workshops',
    description: 'Practical AI training designed to help professionals and office workers understand and apply AI tools in their daily work.',
    audience: ['Professionals', 'Employees', 'Entrepreneurs'],
    image: aiWorkshopsImage,
    color: 'gold',
    rating: 4.7,
    duration: '4 Weeks',
    level: 'Beginner',
    free: true,
  },
  {
    id: 'cv-optimization',
    title: 'CV Optimization',
    description: 'Professional CV development and optimization designed to improve how candidates present their skills, experience and qualifications.',
    audience: ['Job Seekers'],
    image: cvOptimizationImage,
    color: 'green',
    rating: 4.6,
    duration: '2 Weeks',
    level: 'Beginner',
    free: false,
  },
  {
    id: 'linkedin-optimization',
    title: 'LinkedIn Optimization',
    description: 'Build a professional LinkedIn presence that communicates expertise, experience and career direction.',
    audience: ['Job Seekers', 'Professionals'],
    image: linkedinOptimizationImage,
    color: 'green',
    rating: 4.5,
    duration: '2 Weeks',
    level: 'Beginner',
    free: false,
  },
  {
    id: 'mentorship',
    title: 'Mentorship',
    description: 'Career guidance, professional mentorship and exposure to experienced practitioners.',
    audience: ['Students', 'Graduates', 'Young Professionals'],
    image: mentorshipImage,
    color: 'gold',
    rating: 4.9,
    duration: 'Ongoing',
    level: 'All Levels',
    free: true,
  },
];

export const Programs: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '⭐';
    }
    if (hasHalfStar) {
      stars += '⭐';
    }
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }
    return stars;
  };

  // Continuous smooth scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const speed = 0.8; // Pixels per frame - adjust for speed (higher = faster)
    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused) {
        // Move scroll position
        scrollPositionRef.current += speed * (delta / 16); // Normalize to 60fps
        
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Reset when reaching the end (for seamless loop)
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0;
        }
        
        scrollContainer.scrollLeft = scrollPositionRef.current;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPaused]);

  // Handle pause on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Manual scroll controls
  const scrollLeft = () => {
    const container = scrollRef.current;
    if (container) {
      scrollPositionRef.current = Math.max(0, scrollPositionRef.current - 300);
      container.scrollLeft = scrollPositionRef.current;
    }
  };

  const scrollRight = () => {
    const container = scrollRef.current;
    if (container) {
      const maxScroll = container.scrollWidth - container.clientWidth;
      scrollPositionRef.current = Math.min(maxScroll, scrollPositionRef.current + 300);
      container.scrollLeft = scrollPositionRef.current;
    }
  };

  return (
    <section className={styles.programs}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>Our Courses</span>
          <h2 className={styles.title}>Courses Built for the <span className="highlight-gold">Modern African Workforce</span></h2>
          <p className={styles.description}>
            Discover our comprehensive courses designed to develop practical skills and career readiness.
          </p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className={styles.scrollWrapper}>
          <div 
            className={styles.scrollContainer} 
            ref={scrollRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* First set of cards */}
            {courses.map((course) => (
              <Card key={course.id} hover elevation="md" className={styles.programCard}>
                <div className={styles.cardImageWrapper}>
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className={styles.cardImage}
                    loading="lazy"
                  />
                  <div className={styles.cardBadge}>
                    <span className={`${styles.levelBadge} ${styles[course.color]}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.programTitle}>{course.title}</h3>
                  <p className={styles.programDescription}>{course.description}</p>
                  <div className={styles.courseMeta}>
                    <div className={styles.rating}>
                      <span className={styles.stars}>{renderStars(course.rating)}</span>
                      <span className={styles.ratingValue}>{course.rating.toFixed(1)}</span>
                    </div>
                    <div className={styles.duration}>
                      <span className={styles.durationIcon}>⏱</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className={styles.programAudience}>
                    {course.audience.slice(0, 2).map((group) => (
                      <span key={group} className={`${styles.audienceTag} ${styles[course.color]}`}>
                        {group}
                      </span>
                    ))}
                    {course.audience.length > 2 && (
                      <span className={`${styles.audienceTag} ${styles.more}`}>
                        +{course.audience.length - 2}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      {course.free ? (
                        <span className={styles.free}>Free</span>
                      ) : (
                        <span className={styles.paid}>Paid</span>
                      )}
                    </div>
                    <Button variant="primary" color="green" size="sm" className={styles.viewButton}>
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Duplicate cards for seamless loop */}
            {courses.map((course) => (
              <Card key={`${course.id}-clone`} hover elevation="md" className={styles.programCard}>
                <div className={styles.cardImageWrapper}>
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className={styles.cardImage}
                    loading="lazy"
                  />
                  <div className={styles.cardBadge}>
                    <span className={`${styles.levelBadge} ${styles[course.color]}`}>
                      {course.level}
                    </span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.programTitle}>{course.title}</h3>
                  <p className={styles.programDescription}>{course.description}</p>
                  <div className={styles.courseMeta}>
                    <div className={styles.rating}>
                      <span className={styles.stars}>{renderStars(course.rating)}</span>
                      <span className={styles.ratingValue}>{course.rating.toFixed(1)}</span>
                    </div>
                    <div className={styles.duration}>
                      <span className={styles.durationIcon}>⏱</span>
                      <span>{course.duration}</span>
                    </div>
                  </div>
                  <div className={styles.programAudience}>
                    {course.audience.slice(0, 2).map((group) => (
                      <span key={group} className={`${styles.audienceTag} ${styles[course.color]}`}>
                        {group}
                      </span>
                    ))}
                    {course.audience.length > 2 && (
                      <span className={`${styles.audienceTag} ${styles.more}`}>
                        +{course.audience.length - 2}
                      </span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      {course.free ? (
                        <span className={styles.free}>Free</span>
                      ) : (
                        <span className={styles.paid}>Paid</span>
                      )}
                    </div>
                    <Button variant="primary" color="green" size="sm" className={styles.viewButton}>
                      View Course
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        <div className={styles.scrollIndicators}>
          <button 
            className={styles.scrollArrow}
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button 
            className={styles.scrollArrow}
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>

        <div className={styles.ctaWrapper}>
          <Button variant="primary" color="green" size="lg" href="/programs">
            Explore All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};