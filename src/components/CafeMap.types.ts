import type { Camera, Cafe } from "../lib/cafes";

export type CafeMapProps = {
  cafes: readonly Cafe[];
  /** Where the map opens. */
  initialCamera: Camera;
  /** Where the map should be; the map animates whenever this changes. */
  camera: Camera;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
};
