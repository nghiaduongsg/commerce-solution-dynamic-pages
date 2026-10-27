export interface UserSettings {
  selectedLanguage: string;
  changeLanguage: (language: string) => void;
  saveLanguagePreference: (language: string) => void;
  userPreferences: Record<string, any>;
  fetchUserPreferences: (...args: any[]) => void;
}

export interface CodeLists {
  api: string;
  lists: string[];
}

export interface LanguageProps {
  codelists: CodeLists;
}
