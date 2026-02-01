import { jsx as _jsx } from "react/jsx-runtime";
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    return (_jsx(Button, { variant: "ghost", size: "icon", onClick: toggleTheme, className: className, "aria-label": `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, title: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, children: theme === 'dark' ? (_jsx(Sun, { className: "h-5 w-5" })) : (_jsx(Moon, { className: "h-5 w-5" })) }));
};
export default ThemeToggle;
