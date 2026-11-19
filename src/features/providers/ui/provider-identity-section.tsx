import { FormSection, TextField } from '@/components/ui/form';

type ProviderIdentitySectionProps = {
  custom: boolean;
  name: string;
  onChangeName: (value: string) => void;
  onChangeProviderId: (value: string) => void;
  providerId: string;
};

export function ProviderIdentitySection({
  custom,
  name,
  onChangeName,
  onChangeProviderId,
  providerId,
}: ProviderIdentitySectionProps) {
  return (
    <FormSection title="供应商">
      <TextField
        autoCapitalize="none"
        autoCorrect={false}
        label="名称"
        onChangeText={onChangeName}
        placeholder="供应商名称"
        value={name}
      />

      {custom ? (
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          label="供应商 ID"
          mono
          onChangeText={onChangeProviderId}
          placeholder="provider-id"
          value={providerId}
        />
      ) : null}
    </FormSection>
  );
}
