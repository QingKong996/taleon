import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Modal,
  ModalBackdrop,
  ModalContent,
} from '@/components/gluestack/modal';
import { VStack } from '@/components/gluestack/vstack';

type BottomSheetModalProps = PropsWithChildren<{
  accessibilityLabel: string;
  isOpen: boolean;
  onClose: () => void;
  preventClose?: boolean;
}>;

export function BottomSheetModal({
  accessibilityLabel,
  children,
  isOpen,
  onClose,
  preventClose = false,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationPreset="fade"
      className="justify-end"
      closeOnOverlayClick={!preventClose}
      isOpen={isOpen}
      onClose={() => {
        if (!preventClose) {
          onClose();
        }
      }}
      useRNModal>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardRoot}>
        <ModalBackdrop
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          disabled={preventClose}
        />
        <ModalContent className="max-h-[88%] w-[92%] max-w-[560px] rounded-sheet border border-border bg-card p-0">
          <VStack
            className="gap-3.5 px-4 pt-4"
            style={{
              flexShrink: 1,
              paddingBottom: insets.bottom + 16,
            }}>
            {children}
          </VStack>
        </ModalContent>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
