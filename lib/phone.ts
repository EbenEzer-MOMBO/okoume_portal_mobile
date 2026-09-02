export type PhoneCountry = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  phoneLength: number;
  phonePattern: RegExp;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', phoneLength: 10, phonePattern: /^[0-9]{7,10}$/ },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', phoneLength: 10, phonePattern: /^[0-9]{9,10}$/ },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', phoneLength: 10, phonePattern: /^[0-9]{8,10}$/ },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', phoneLength: 10, phonePattern: /^[0-9]{8,10}$/ },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', phoneLength: 10, phonePattern: /^[0-9]{8,10}$/ },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦', phoneLength: 10, phonePattern: /^[0-9]{9,10}$/ },
];

const DIAL_CODES_DESC = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function parsePhone(value: string): { country: PhoneCountry; nationalNumber: string } {
  const trimmed = value.trim();
  const withPlus = trimmed.startsWith('+') ? trimmed : trimmed ? `+${digitsOnly(trimmed)}` : '';
  const matched = DIAL_CODES_DESC.find((country) => withPlus.startsWith(country.dialCode));
  if (matched) {
    return {
      country: matched,
      nationalNumber: digitsOnly(withPlus.slice(matched.dialCode.length)).slice(0, matched.phoneLength),
    };
  }
  return {
    country: DEFAULT_PHONE_COUNTRY,
    nationalNumber: digitsOnly(trimmed).slice(0, DEFAULT_PHONE_COUNTRY.phoneLength),
  };
}

export function composePhone(country: PhoneCountry, nationalNumber: string): string {
  const digits = digitsOnly(nationalNumber).slice(0, country.phoneLength);
  return `${country.dialCode}${digits}`;
}

export function isValidPhone(value: string): boolean {
  const { country, nationalNumber } = parsePhone(value);
  return country.phonePattern.test(nationalNumber);
}

export function formatForDisplay(value: string): string {
  const { country, nationalNumber } = parsePhone(value);
  if (!nationalNumber) return country.dialCode;
  return `${country.dialCode} ${nationalNumber}`;
}
