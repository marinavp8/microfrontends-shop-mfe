import { createRoot } from 'react-dom/client';
import Home from './Home';

// Modo standalone: permite desarrollar el remote sin la shell
createRoot(document.getElementById('root')!).render(<Home />);
