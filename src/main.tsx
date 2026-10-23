import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// The storefront is intentionally light-first; no flash of the legacy dark palette.
document.documentElement.classList.add('theme-light');
document.documentElement.classList.remove('theme-dark');

createRoot(document.getElementById('root')!).render(<App />);
