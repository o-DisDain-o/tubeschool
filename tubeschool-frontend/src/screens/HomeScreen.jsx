import React from 'react';
import Hero from '../components/home/Hero';
import VideoUrlForm from '../components/home/VideoUrlForm';

export const HomeScreen = () => {
  return (
    <Hero>
      <VideoUrlForm />
    </Hero>
  );
};

export default HomeScreen;