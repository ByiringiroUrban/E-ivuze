import React from 'react';
import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import AppointmentSection from '../components/home/AppointmentSection';
import AboutUsSection from '../components/home/AboutUsSection';
import CallActionSection from '../components/home/CallActionSection';
import AchievementSection from '../components/home/AchievementSection';
import DoctorsSection from '../components/home/DoctorsSection';

const Home = () => {
  return (
    <>
      <SEO
        title="e-Ivuze Connect — Trusted Digital Healthcare in Rwanda"
        description="Find and book appointments with Rwanda's top doctors. Telemedicine, digital health records, lab results and AI-powered care — all in one platform."
        keywords="e-ivuze, Rwanda telemedicine, book doctor online, health Rwanda, digital health"
      />
      <HeroSection />
      <AppointmentSection />
      <AboutUsSection />
      <AchievementSection />
      <DoctorsSection />
      <CallActionSection />
    </>
  );
};

export default Home;
