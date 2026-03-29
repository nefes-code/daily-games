"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { Icon as SolarIcon } from "@/utils/game-icon";

export function NavItem({
  href,
  Icon,
  label,
  active,
}: {
  href: string;
  Icon: SolarIcon;
  label: string;
  active: boolean;
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
          variant={"ghost"}
          color={active ? "brand.solid" : undefined}
        >
          <Icon weight="BoldDuotone" />
          <Text>{label}</Text>
        </Button>
      </Link>
    </Box>
  );
}
