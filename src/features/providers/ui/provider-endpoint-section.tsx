import { FormSection, TextField } from '@/components/ui/form';

type ProviderEndpointSectionProps = {
  baseUrl: string;
  onChangeBaseUrl: (value: string) => void;
};

export function ProviderEndpointSection({
  baseUrl,
  onChangeBaseUrl,
}: ProviderEndpointSectionProps) {
  return (
    <FormSection title="端点">
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        label="Base URL"
        mono
        onChangeText={onChangeBaseUrl}
        placeholder="https://api.example.com/v1"
        value={baseUrl}
      />
    </FormSection>
  );
}
