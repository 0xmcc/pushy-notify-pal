import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './app/layout';
import Page from './app/page';
import ArenaPage from './app/arena/page';
import MultiplayerPage from './app/multiplayer/page';
import './index.css';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <RootLayout>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/arena" element={<ArenaPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
      </Routes>
    </RootLayout>
  </BrowserRouter>
);