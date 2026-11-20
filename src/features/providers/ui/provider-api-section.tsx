import type { KnownApi } from '@earendil-works/pi-ai';
import { SymbolView } from 'expo-symbols';

import { Pressable } from '@/components/gluestack/pressable';
import { FormField, FormSection, TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { ProviderApiField } from '@/features/providers/ui/provider-api-field';
import { useTheme } from '@/hooks/use-theme';

type ProviderApiSectionProps = {
  api: KnownApi;
  apiKey: string;
  keyLoadError: boolean;
  onChangeApi: (value: KnownApi) => void;
  onChangeApiKey: (value: string) => void;
  onToggleApiKeyVisibility: () => void;
  showApiKey: boolean;
};

export function ProviderApiSection({
  api,
  apiKey,
  keyLoadError,
  onChangeApi,
  onChangeApiKey,
  onToggleApiKeyVisibility,
  showApiKey,
}: ProviderApiSectionProps) {
  const theme = useTheme();

  return (
    <FormSection title="API">
      <FormField label="API Key">
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          mono
          onChangeText={onChangeApiKey}
          placeholder="输入 API Key"
          secureTextEntry={!showApiKey}
          trailing={
            <Pressable
              accessibilityLabel={
                showApiKey ? '隐藏 API Key' : '显示 API Key'
              }
              accessibilityRole="button"
              hitSlop={8}
              onPress={onToggleApiKeyVisibility}>
              <SymbolView
                name={
                  showApiKey
                    ? {
                        ios: 'eye.slash.fill',
                        android: 'visibility_off',
                      }
                    : { ios: 'eye.fill', android: 'visibility' }
                }
                size={17}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          }
          value={apiKey}
        />
        {keyLoadError ? (
          <ThemedText type="small" themeColor="textSecondary">
            无法读取已保存的密钥
          </ThemedText>
        ) : null}
      </FormField>

      <ProviderApiField onChange={onChangeApi} value={api} />
    </FormSection>
  );
}
