import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/button';
import { useWorkspaceStory } from '@/features/workspace/ui/use-workspace-story';
import { WorkbenchEditor } from '@/features/workspace/ui/workbench-editor';
import { WorkspaceState } from '@/features/workspace/ui/workspace-state';

export function WorkspaceScreen() {
  const params = useLocalSearchParams<{
    storyId?: string | string[];
  }>();
  const routeStoryId = Array.isArray(params.storyId)
    ? params.storyId[0]
    : params.storyId;

  return (
    <WorkspaceStory
      key={routeStoryId ?? 'latest'}
      routeStoryId={routeStoryId}
    />
  );
}

function WorkspaceStory({ routeStoryId }: { routeStoryId?: string }) {
  const workspace = useWorkspaceStory(routeStoryId);

  if (workspace.isLoading) {
    return <WorkspaceState loading title="正在打开故事" />;
  }

  if (!workspace.story) {
    return (
      <WorkspaceState
        action={
          <Button
            label={workspace.loadError ? '返回故事列表' : '创建故事'}
            loading={workspace.isCreating}
            onPress={() => {
              if (workspace.loadError) {
                router.navigate('/');
                return;
              }

              void workspace.createNewStory();
            }}
          />
        }
        description={
          workspace.loadError
            ? '请返回故事列表重新选择。'
            : '从故事页创建故事后，可以在这里继续创作。'
        }
        title={workspace.loadError ?? '还没有故事'}
      />
    );
  }

  return <WorkbenchEditor key={workspace.story.id} story={workspace.story} />;
}
