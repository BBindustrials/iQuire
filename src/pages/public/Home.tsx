// ============================================================================
// iQuire — Homepage
// ============================================================================

import React from 'react';
import { Hero } from '../../components/homepage/Hero';
import { Problem } from '../../components/homepage/Problem';
import { Programs } from '../../components/homepage/Programs';
import { HowItWorks } from '../../components/homepage/HowItWorks';
import { Impact } from '../../components/homepage/Impact';
import { RecruiterSection } from '../../components/homepage/RecruiterSection';
import { Opportunities } from '../../components/homepage/JobSeekerSection';
import { FAQ } from '../../components/homepage/FAQ';
import { BlogSection } from '../../components/homepage/BlogSection';
import { FinalCTA } from '../../components/homepage/FinalCTA';
import { Alumni } from '../../components/homepage/Alumni';


export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Problem />
      <Programs />
      <HowItWorks />
      <Impact />
      <Alumni />
      <Opportunities />      
      <RecruiterSection />
      <FAQ />
      <BlogSection />
      <FinalCTA />
    </>
  );
};