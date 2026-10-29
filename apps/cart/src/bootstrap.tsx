import { createRoot } from 'react-dom/client';
import Cart from './Cart';

// Modo standalone: permite desarrollar el remote sin la shell
createRoot(document.getElementById('root')!).render(<Cart />);
