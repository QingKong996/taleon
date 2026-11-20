import type { ReactNode } from 'react';

import { HStack } from '@/components/gluestack/hstack';
import { Text } from '@/components/gluestack/text';

type SectionHeaderProps = {
  action?: ReactNode;
  detail?: ReactNode;
  title: string;
};

export function SectionHeader({ action, detail, title }: SectionHeaderProps) {
  return (
    <HStack className="items-center justify-between gap-3">
      <HStack className="items-center gap-[7px]">
        <Text className="text-[13px] font-semibold leading-[18px] text-foreground">
          {title}
        </Text>
        {detail ? (
          <Text className="text-sm text-muted-foreground">{detail}</Text>
        ) : null}
      </HStack>
      {action}
    </HStack>
  );
}
