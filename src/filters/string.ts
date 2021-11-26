export function trimStartSlash(payload: string) {
  return payload.replace(/^[\/]/gm, "");
}
export function trimLastSlash(payload: string) {
  return payload.replace(/[\/]$/gm, "");
}
