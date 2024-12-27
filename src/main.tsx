import { createRoot } from 'react-dom/client'
import RootLayout from './app/layout'
import Page from './app/page'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <RootLayout>
    <Page />
  </RootLayout>
);