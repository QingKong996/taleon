import { TabScrollView } from '@/components/tab-scroll-view';
import { ThemedText } from '@/components/themed-text';

export default function WorkspaceScreen() {
  return (
    <TabScrollView>
      <ThemedText type="title">工作台</ThemedText>
    </TabScrollView>
  );
}
