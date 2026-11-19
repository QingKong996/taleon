export const PARTIAL_PARSE_INTERVAL_MS = 200;

export function assertSuccessfulMessage(
  stopReason: string,
  errorMessage: string | undefined,
) {
  if (stopReason === 'error') {
    throw new Error(errorMessage ?? 'AI 请求失败');
  }
}
