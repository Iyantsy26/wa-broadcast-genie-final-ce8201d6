
export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

// List of languages supported by Google for WhatsApp Business messaging
export const languages: Language[] = [
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'zh_CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh_TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'en_GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'en_US', name: 'English (US)', nativeName: 'English (US)' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'nb', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'es_AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)' },
  { code: 'es_ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'es_MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'uz', name: 'Uzbek', nativeName: 'O'zbek' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' }
];
