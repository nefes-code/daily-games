"use client";

import { Box, Circle } from "@chakra-ui/react";
import { Star, ClockCircle } from "@solar-icons/react";
import { Tooltip } from "@/components/Tooltip";

export type BadgeType = "new" | "soon" | "notPlayed";

type BadgeConfig = {
  icon: React.ReactNode;
  label: string;
  color: string;
};

const BADGE_CONFIG: Record<BadgeType, BadgeConfig> = {
  new: {
    icon: <Star size={10} weight="BoldDuotone" />,
    label: "Novo",
    color: "green.500",
  },
  soon: {
    icon: <ClockCircle size={10} weight="BoldDuotone" />,
    label: "Em breve",
    color: "brand.solid",
  },
  notPlayed: {
    icon: <Circle size={1.5} bgColor={"red.500"} />,
    label: "Não jogado hoje",
    color: "red.500",
  },
};

export function NavBadge({ type }: { type: BadgeType }) {
  const { icon, label, color } = BADGE_CONFIG[type];
  return (
    <Tooltip content={label} showArrow openDelay={200}>
      <Box
        position={"absolute"}
        right={2}
        color={color}
        display="flex"
        alignItems="center"
        lineHeight={1}
        flexShrink={0}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}
