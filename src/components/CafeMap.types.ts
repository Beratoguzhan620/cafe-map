import type { Camera, Cafe } from "../lib/cafes";

export type CafeMapProps = {
  cafes: readonly Cafe[];
  initialCamera: Camera;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
};
