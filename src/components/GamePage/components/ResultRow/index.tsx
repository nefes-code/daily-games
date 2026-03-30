"use client";

import { useRef, useState } from "react";
import {
  Circle,
  Flex,
  Text,
  Box,
  Portal,
  Avatar,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { getInitials, avatarColor } from "../../helpers";
import type { ResultReaction } from "@/services/types";
import { MedalRibbonStar, Star, StarAngle } from "@solar-icons/react";

export function ResultRow({
  rank,
  name,
  value,
  date,
  isLast,
  isFirst,
  reactions = [],
  currentUserId,
  image,
  onReact,
  onRemoveReaction,
  rounds,
}: {
  rank?: number;
  name: string;
  value: string;
  date?: string;
  isLast?: boolean;
  isFirst?: boolean;
  image?: string | null;
  reactions?: ResultReaction[];
  currentUserId?: string | null;
  onReact?: (emoji: string) => void;
  onRemoveReaction?: () => void;
  rounds?: Array<{ label: string; isLoss: boolean }>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  function openPicker() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPickerPos({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX,
      });
    }
    setPickerOpen(true);
  }

  const myReaction = currentUserId
    ? reactions.find((r) => r.userId === currentUserId)
    : undefined;

  function handleEmojiSelect(emoji: { native: string }) {
    setPickerOpen(false);
    if (myReaction && myReaction.emoji === emoji.native) {
      onRemoveReaction?.();
    } else {
      onReact?.(emoji.native);
    }
  }

  function handleMyReactionClick() {
    onRemoveReaction?.();
  }

  return (
    <Flex
      align="center"
      px={4}
      py={3}
      gap={3}
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="gray.50"
      transition="background 0.1s"
      position="relative"
      bgColor={isFirst ? "white" : "transparent"}
    >
      {rank !== undefined && (
        <Text
          fontSize="xs"
          fontWeight="700"
          color="gray.300"
          w={5}
          textAlign="center"
          fontFamily="mono"
          flexShrink={0}
        >
          {rank}
        </Text>
      )}
      <Flex position={"relative"}>
        {isFirst && (
          <Circle
            color={"white"}
            bgColor={"brand.solid"}
            size={5}
            zIndex={2}
            borderWidth={2}
            borderColor={"white"}
            position={"absolute"}
            top={-2}
            right={-2}
          >
            <Star size={12} weight="BoldDuotone" />
          </Circle>
        )}
        <Avatar.Root bg={avatarColor(name ?? "")} shape="full" size={"2xs"}>
          {image && <Avatar.Image src={image} />}
          <Avatar.Fallback>{getInitials(name ?? "")}</Avatar.Fallback>
        </Avatar.Root>
      </Flex>
      <HStack gap={2} flex={1} align="start" minW={0}>
        <Text fontSize="sm" fontWeight="600" truncate color="gray.700">
          {name}
        </Text>
        {rounds && rounds.length > 0 && (
          <Flex gap={2} flexWrap="wrap">
            {rounds.map((r, i) => (
              <Text
                key={i}
                fontSize="sm"
                fontWeight="600"
                color={r.isLoss ? "gray.400" : "green.600"}
              >
                {r.label}
              </Text>
            ))}
          </Flex>
        )}
      </HStack>

      {/* Reações existentes */}
      <Flex gap={1} align="center" flexShrink={0}>
        {reactions.map((r) => (
          <Flex
            key={r.id}
            align="center"
            cursor={r.userId === currentUserId ? "pointer" : "default"}
            onClick={
              r.userId === currentUserId ? handleMyReactionClick : undefined
            }
            title={r.user.name ?? ""}
            _hover={
              r.userId === currentUserId
                ? { bg: "red.50", borderColor: "red.200" }
                : {}
            }
            position={"relative"}
            transition="background 0.1s"
          >
            <Circle
              borderWidth={1}
              borderColor={
                r.userId === currentUserId ? "brand.muted" : "gray.100"
              }
              size={7}
              bg={r.userId === currentUserId ? "brand.subtle" : "gray.100"}
            >
              <Text fontSize="sm" lineHeight="1">
                {r.emoji}
              </Text>
            </Circle>
            <Avatar.Root
              bg={avatarColor(name ?? "")}
              shape="full"
              w={4}
              borderWidth={2}
              borderColor={"white"}
              h={4}
              position={"absolute"}
              bottom={-1}
              right={-1}
            >
              {r.user.image && <Avatar.Image src={r.user.image} />}
              <Avatar.Fallback>{getInitials(name ?? "")}</Avatar.Fallback>
            </Avatar.Root>
          </Flex>
        ))}

        {/* Botão de adicionar reação */}
        {currentUserId && !myReaction && (
          <Box position="relative">
            <Flex
              ref={triggerRef}
              align="center"
              justify="center"
              w="26px"
              h="26px"
              rounded="full"
              borderWidth={1}
              borderStyle="dashed"
              borderColor="gray.200"
              cursor="pointer"
              fontSize="sm"
              color="gray.300"
              _hover={{ borderColor: "gray.400", color: "gray.500" }}
              transition="all 0.1s"
              onClick={openPicker}
            >
              +
            </Flex>

            {pickerOpen && (
              <Portal>
                {/* Overlay para fechar ao clicar fora */}
                <Box
                  position="fixed"
                  inset={0}
                  zIndex={1000}
                  onClick={() => setPickerOpen(false)}
                />
                <Box
                  position="absolute"
                  top={`${pickerPos.top}px`}
                  left={`${pickerPos.left}px`}
                  zIndex={1001}
                  style={{ transform: "translate(-100%, -100%)" }}
                >
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    locale="pt"
                    theme="light"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </Box>
              </Portal>
            )}
          </Box>
        )}
      </Flex>

      {date && (
        <Text fontSize="xs" color="gray.300" fontWeight="500" flexShrink={0}>
          {date}
        </Text>
      )}
      <Text
        fontSize="sm"
        fontWeight="800"
        color="gray.600"
        fontFamily="mono"
        flexShrink={0}
      >
        {value}
      </Text>
    </Flex>
  );
}
