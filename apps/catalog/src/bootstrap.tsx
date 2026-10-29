import { createRoot } from 'react-dom/client';
import Catalog from './Catalog';

// Modo standalone: permite desarrollar el remote sin la shell
createRoot(document.getElementById('root')!).render(<Catalog />);
