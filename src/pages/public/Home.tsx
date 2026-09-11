import React from 'react';
import { Hero } from '../../components/homepage/Hero';
import { Problem } from '../../components/homepage/Problem';
import { Programs } from '../../components/homepage/Programs';
import { HowItWorks } from '../../components/homepage/HowItWorks';
import { Impact } from '../../components/homepage/Impact';
import { Testimonials } from '../../components/homepage/Testimonials';
import { RecruiterSection } from '../../components/homepage/RecruiterSection';
import { JobSeekerSection } from '../../components/homepage/JobSeekerSection';
import { FAQ } from '../../components/homepage/FAQ';
import { BlogSection } from '../../components/homepage/BlogSection';
import { FinalCTA } from '../../components/homepage/FinalCTA';

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Problem />
      <Programs />
      <HowItWorks />
      <Impact />
      <Testimonials />
      <RecruiterSection />
      <JobSeekerSection />
      <FAQ />
      <BlogSection />
      <FinalCTA />
    </>
  );
};