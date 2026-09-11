import React from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import styles from './BlogSection.module.css';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
}

const posts: BlogPost[] = [
  {
    id: 1,
    title: '5 Skills Every Entry-Level Professional Needs in 2026',
    excerpt: 'Discover the essential skills that employers are looking for in today\'s competitive job market.',
    category: 'Career Tips',
    date: 'March 15, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop',
  },
  {
    id: 2,
    title: 'How AI is Transforming the African Workplace',
    excerpt: 'Explore how artificial intelligence is creating new opportunities and changing how we work in Africa.',
    category: 'AI & Work',
    date: 'March 10, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
  },
  {
    id: 3,
    title: 'From Graduate to Professional: My Journey Through IEESP',
    excerpt: 'A graduate shares how the IQuire Entry-Level Employability Skills Program transformed their career.',
    category: 'Alumni Stories',
    date: 'March 5, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
  },
];

export const BlogSection: React.FC = () => {
  return (
    <section className={styles.blog}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>Insights</span>
          <h2 className={styles.title}>
            Insights for the <span className="highlight-gold">Modern African Workforce</span>
          </h2>
          <p className={styles.description}>
            Career tips, industry insights, and stories from the IQuire community.
          </p>
        </div>
        <div className={styles.grid}>
          {posts.map((post) => (
            <Card key={post.id} hover className={styles.blogCard}>
              <div className={styles.blogImage}>
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className={styles.categoryBadge}>{post.category}</span>
              </div>
              <div className={styles.blogContent}>
                <div className={styles.blogMeta}>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className={styles.blogTitle}>{post.title}</h3>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <Button variant="ghost" color="green" size="sm">
                  Read More →
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className={styles.ctaWrapper}>
          <Button variant="secondary" color="gold" href="/blog">
            Read More Insights
          </Button>
        </div>
      </div>
    </section>
  );
};