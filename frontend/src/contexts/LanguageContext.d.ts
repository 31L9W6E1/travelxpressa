import { ReactNode } from 'react';
type Language = 'en' | 'mn';
interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}
declare const LanguageContext: import("react").Context<LanguageContextType | undefined>;
export declare const LanguageProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useLanguage: () => LanguageContextType;
export default LanguageContext;
