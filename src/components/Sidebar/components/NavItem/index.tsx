"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { Icon as SolarIcon } from "@/utils/game-icon";
import { NavBadge, type BadgeType } from "@/utils/nav-badge";

export function NavItem({
  href,
  Icon,
  label,
  active,
  disabled = false,
  badge,
}: {
  href: string;
  Icon: SolarIcon;
  label: string;
  active: boolean;
  disabled?: boolean;
  badge?: BadgeType;
}) {
  return (
    <Box asChild w="full">
      <Link href={href}>
        <Button
          _hover={{
            bgColor: "brand.solid",
            color: "white",
          }}
          bgColor={active ? "brand.solid/10" : "transparent"}
          borderRadius={"lg"}
          width={"100%"}
          height={10}
          justifyContent={"start"}
          position={"relative"}
          variant={"ghost"}
          color={active ? "brand.solid" : undefined}
          disabled={disabled}
        >
          <Icon weight="BoldDuotone" />
          <Text>{label}</Text>
          {badge && <NavBadge type={badge} />}
        </Button>
      </Link>
    </Box>
  );
}
