import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import styles from './Testimonials.module.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  organization: string;
  program: string;
  before: string;
  experience: string;
  after: string;
  photo?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Chioma Okafor',
    role: 'Junior Data Analyst',
    organization: 'TechHub Nigeria',
    program: 'IEESP',
    before: 'I had a degree but couldn\'t get interviews because I didn\'t know how to present my skills effectively.',
    experience: 'IEESP taught me practical workplace skills, how to build a professional CV, and how to communicate my value to employers.',
    after: 'I landed my first job within 3 months of completing the program. I now work as a Data Analyst at TechHub Nigeria.',
    photo: 'https://images.unsplash.com/photo-1494790108373-be9c7b9f1f8a?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Emeka Nwosu',
    role: 'Product Manager',
    organization: 'AfriTech Solutions',
    program: 'Tech360',
    before: 'I wanted to transition into tech but didn\'t know where to start or what skills I needed.',
    experience: 'Tech360 gave me a comprehensive foundation in product and project management. The practical approach made all the difference.',
    after: 'I successfully transitioned into product management. The skills I learned helped me land a role at AfriTech Solutions.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Aisha Bello',
    role: 'Office Manager',
    organization: 'Green Energy Corp',
    program: 'AI Workshops',
    before: 'AI felt overwhelming and I worried about being left behind in my career.',
    experience: 'The AI Workshops made AI accessible. I learned practical tools I could use immediately in my daily work.',
    after: 'I now use AI daily to automate tasks and improve productivity. My team has noticed and I\'ve become more valuable to the organization.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Tunde Adeyemi',
    role: 'NYSC Corps Member',
    organization: 'Lagos State Government',
    program: 'CV Optimization',
    before: 'My CV was generic and I wasn\'t getting any callbacks after applying to jobs.',
    experience: 'The CV Optimization program helped me understand what employers are looking for and how to position myself effectively.',
    after: 'My CV now gets attention. I\'ve had multiple interview invitations and received two job offers during my service year.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
];

export const Testimonials: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // Continuous smooth scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const speed = 0.4; // Pixels per frame - smooth continuous movement

    const animate = () => {
      if (!isPaused) {
        // Move scroll position
        scrollPositionRef.current += speed;
        
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

  // Duplicate testimonials for seamless loop
  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>Alumni Stories</span>
          <h2 className={styles.title}>Hear From <span className="highlight-gold">Our Alumni</span></h2>
          <p className={styles.description}>
            Real stories from real people who transformed their careers through IQuire.
          </p>
        </div>
        <div 
          className={styles.scrollContainer} 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {allTestimonials.map((testimonial, index) => (
            <Card 
              key={`${testimonial.id}-${index}`} 
              hover 
              elevation="md" 
              className={styles.testimonialCard}
            >
              <div className={styles.testimonialContent}>
                <div className={styles.testimonialHeader}>
                  {testimonial.photo && (
                    <img src={testimonial.photo} alt={testimonial.name} className={styles.avatar} />
                  )}
                  <div>
                    <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                    <p className={styles.testimonialRole}>
                      {testimonial.role} • {testimonial.organization}
                    </p>
                    <span className={styles.programBadge}>{testimonial.program}</span>
                  </div>
                </div>
                <div className={styles.testimonialBody}>
                  <div className={styles.storyPart}>
                    <span className={styles.storyLabel}>Before IQuire</span>
                    <p>{testimonial.before}</p>
                  </div>
                  <div className={styles.storyPart}>
                    <span className={styles.storyLabel}>IQuire Experience</span>
                    <p>{testimonial.experience}</p>
                  </div>
                  <div className={styles.storyPart}>
                    <span className={styles.storyLabel}>After IQuire</span>
                    <p className={styles.afterText}>{testimonial.after}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className={styles.ctaWrapper}>
          <Button variant="secondary" color="gold" href="/about#alumni">
            Meet More of Our Alumni
          </Button>
        </div>
      </div>
    </section>
  );
};