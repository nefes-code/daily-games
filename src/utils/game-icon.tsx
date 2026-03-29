import {
  Gamepad,
  Crown,
  Star,
  Fire,
  CupStar,
  MedalStar,
  Bolt,
  Confetti,
} from "@solar-icons/react";
import type { Icon } from "@solar-icons/react/lib/types";
import type { GameIcon } from "@/services/types";

export type { Icon };

const iconMap: Record<GameIcon, Icon> = {
  GAMEPAD: Gamepad,
  CROWN: Crown,
  STAR: Star,
  FIRE: Fire,
  CUP: CupStar,
  MEDAL: MedalStar,
  BOLT: Bolt,
  CONFETTI: Confetti,
};

export const GAME_ICON_OPTIONS: { value: GameIcon; label: string }[] = [
  { value: "GAMEPAD", label: "Controle" },
  { value: "CROWN", label: "Coroa" },
  { value: "STAR", label: "Estrela" },
  { value: "FIRE", label: "Fogo" },
  { value: "CUP", label: "Troféu" },
  { value: "MEDAL", label: "Medalha" },
  { value: "BOLT", label: "Raio" },
  { value: "CONFETTI", label: "Confete" },
];

export function getGameIcon(icon: GameIcon | null | undefined): Icon {
  if (!icon) return Gamepad;
  return iconMap[icon] ?? Gamepad;
}

export function GameIconDisplay({
  icon,
  size = 20,
  weight = "BoldDuotone",
}: {
  icon: GameIcon | null | undefined;
  size?: number;
  weight?: "Linear" | "Bold" | "Outline" | "BoldDuotone" | "LineDuotone";
}) {
  const Icon = iconMap[icon!] ?? Gamepad;
  return <Icon size={size} weight={weight} />;
}
