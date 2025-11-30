import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import StudyScreen from './screens/StudyScreen';
import TestScreen from './screens/TestScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/study/:sessionId" element={<StudyScreen />} />
        <Route path="/test/:sessionId" element={<TestScreen />} />
      </Routes>
    </Router>
  );
}

export default App;