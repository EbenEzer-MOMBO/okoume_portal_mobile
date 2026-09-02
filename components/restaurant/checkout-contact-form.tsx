import { View } from 'react-native';

import { TextInputField } from '@/components/ui/text-input-field';
import { Spacing } from '@/constants/theme';

type Props = {
  nom: string;
  telephone: string;
  email: string;
  setNom: (v: string) => void;
  setTelephone: (v: string) => void;
  setEmail: (v: string) => void;
};

export function CheckoutContactForm({ nom, telephone, email, setNom, setTelephone, setEmail }: Props) {
  return (
    <View style={{ gap: Spacing.md }}>
      <TextInputField label="Nom Complet *" value={nom} onChangeText={setNom} placeholder="Jean Dupont" />
      <TextInputField
        label="Téléphone *"
        value={telephone}
        onChangeText={setTelephone}
        placeholder="+241 XX XX XX"
        keyboardType="phone-pad"
      />
      <TextInputField
        label="E-mail *"
        value={email}
        onChangeText={setEmail}
        placeholder="client@exemple.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
  );
}
