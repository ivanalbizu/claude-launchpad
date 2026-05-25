import './styles/tokens.css';
import './styles/reset.css';
import { applyTheme, loadTheme } from './services/theme.service.ts';
import './components/ui/app-shell.ts';

applyTheme(loadTheme());
