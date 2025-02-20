import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './app/layout';
import Page from './app/page';
import ArenaPage from './app/arena/page';
import MultiplayerPage from './app/multiplayer/page';
import TestPage from './app/test/page';
import SignupPage from './app/signup/page';
import LandingPage from './app/(landing)/page';
import VideoBackgroundPage from './app/video-background/page';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootLayout>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/arena" element={<ArenaPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/invite" element={<LandingPage />} />
        <Route path="/video-background" element={<VideoBackgroundPage />} />
      </Routes>
    </RootLayout>
  </BrowserRouter>
);