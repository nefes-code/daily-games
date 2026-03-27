"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  NativeSelect,
  Portal,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCreateGame } from "@/services/games/hooks";
import type { CreateGameInput } from "@/services/types";

const initialForm: CreateGameInput = {
  name: "",
  url: "",
  type: "COMPETITIVE",
  resultType: "SCORE",
  lowerIsBetter: false,
  resultSuffix: "",
  resultMax: undefined,
};

export function CreateGameModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateGameInput>(initialForm);
  const createGame = useCreateGame();

  function set<K extends keyof CreateGameInput>(
    key: K,
    value: CreateGameInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.url.trim()) return;

    const payload: CreateGameInput = {
      ...form,
      name: form.name.trim(),
      url: form.url.trim(),
      resultSuffix: form.resultSuffix?.trim() || undefined,
      resultMax: form.resultMax || undefined,
    };

    await createGame.mutateAsync(payload);
    setForm(initialForm);
    onClose();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            maxW="480px"
            w="full"
            boxShadow="xl"
          >
            <Dialog.Header
              borderBottomWidth={1}
              borderColor="gray.100"
              px={6}
              py={4}
            >
              <Dialog.Title fontSize="lg" fontWeight="800" color="brand.fg">
                🎮 Novo Jogo
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body px={6} py={5}>
              <VStack gap={4} align="stretch">
                {/* Nome */}
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Nome do jogo
                  </Field.Label>
                  <Input
                    placeholder="ex: Wordle"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    rounded="xl"
                    borderWidth={2}
                    borderColor="gray.200"
                    _focus={{ borderColor: "brand.solid", boxShadow: "none" }}
                  />
                </Field.Root>

                {/* URL */}
                <Field.Root required>
                  <Field.Label fontWeight="700" fontSize="sm">
                    Link do jogo
                  </Field.Label>
                  <Input
                    placeholder="https://www.nytimes.com/games/wordle"
                    value={form.url}
                    onChange={(e) => set("url", e.target.value)}
                    rounded="xl"
                    borderWidth={2}
                    borderColor="gray.200"
                    _focus={{ borderColor: "brand.solid", boxShadow: "none" }}
                  />
                </Field.Root>

                {/* Tipo + Resultado lado a lado */}
                <Flex gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Tipo
                    </Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={form.type}
                        onChange={(e) =>
                          set("type", e.target.value as CreateGameInput["type"])
                        }
                        rounded="xl"
                        borderWidth={2}
                        borderColor="gray.200"
                      >
                        <option value="COMPETITIVE">⚔️ Competitivo</option>
                        <option value="COOPERATIVE">🤝 Cooperativo</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Resultado
                    </Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={form.resultType}
                        onChange={(e) =>
                          set(
                            "resultType",
                            e.target.value as CreateGameInput["resultType"],
                          )
                        }
                        rounded="xl"
                        borderWidth={2}
                        borderColor="gray.200"
                      >
                        <option value="SCORE">🏆 Pontuação</option>
                        <option value="TIME">⏱️ Tempo</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Flex>

                {/* Sufixo + Máximo */}
                <Flex gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Sufixo (opcional)
                    </Field.Label>
                    <Input
                      placeholder="ex: pts, ⭐"
                      value={form.resultSuffix ?? ""}
                      onChange={(e) => set("resultSuffix", e.target.value)}
                      rounded="xl"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "brand.solid", boxShadow: "none" }}
                    />
                  </Field.Root>

                  <Field.Root flex={1}>
                    <Field.Label fontWeight="700" fontSize="sm">
                      Valor máximo (opcional)
                    </Field.Label>
                    <Input
                      type="number"
                      placeholder="ex: 6"
                      value={form.resultMax ?? ""}
                      onChange={(e) =>
                        set(
                          "resultMax",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      rounded="xl"
                      borderWidth={2}
                      borderColor="gray.200"
                      _focus={{ borderColor: "brand.solid", boxShadow: "none" }}
                    />
                  </Field.Root>
                </Flex>

                {/* Menor é melhor */}
                <Box
                  bg="gray.50"
                  rounded="xl"
                  px={4}
                  py={3}
                  borderWidth={1}
                  borderColor="gray.200"
                >
                  <Flex align="center" justify="space-between">
                    <Box>
                      <Text fontWeight="700" fontSize="sm">
                        Menor é melhor?
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Ex: Wordle (menos tentativas = melhor)
                      </Text>
                    </Box>
                    <Switch.Root
                      checked={form.lowerIsBetter}
                      onCheckedChange={(e) => set("lowerIsBetter", e.checked)}
                      colorPalette="green"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                  </Flex>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              borderTopWidth={1}
              borderColor="gray.100"
              px={6}
              py={4}
              gap={3}
            >
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="ghost"
                  rounded="xl"
                  fontWeight="700"
                  color="gray.500"
                >
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bg="brand.solid"
                color="white"
                rounded="xl"
                fontWeight="800"
                px={6}
                _hover={{ bg: "brand.emphasized" }}
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.url.trim()}
                loading={createGame.isPending}
              >
                Criar Jogo 🎯
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger
              position="absolute"
              top={3}
              right={3}
              fontSize="lg"
              color="gray.400"
              _hover={{ color: "gray.600" }}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
