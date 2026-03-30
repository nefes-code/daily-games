"use client";

import { Gamepad } from "@solar-icons/react/ssr";
import { getGameIcon } from "@/utils/game-icon";
import type { Game } from "@/services/types";
import { NavItem } from "../NavItem";

export function GameNavItem({
  game,
  active,
  playedToday,
}: {
  game: Game;
  active: boolean;
  playedToday?: boolean;
}) {
  return (
    <NavItem
      href={`/games/${game.slug ?? game.id}`}
      Icon={game.icon ? getGameIcon(game.icon) : Gamepad}
      label={game.name}
      active={active}
      badge={playedToday === false ? "notPlayed" : undefined}
    />
  );
}
