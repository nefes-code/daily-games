"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  HStack,
  Portal,
  Separator,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  CloseCircle,
  Snowflake,
  CalendarMark,
  Gamepad,
  Refresh,
  DangerTriangle,
} from "@solar-icons/react";

function InfoRow({
  icon,
  title,
  description,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "warning";
}) {
  const isWarning = variant === "warning";
  return (
    <Flex
      gap={3}
      p={4}
      borderRadius="xl"
      bg={isWarning ? "red.500/10" : "gray.50"}
      borderWidth={1}
      borderColor={isWarning ? "red.200" : "gray.100"}
      align="flex-start"
    >
      <Flex
        w={8}
        h={8}
        rounded="lg"
        bg={isWarning ? "red.500" : "gray.200"}
        color={isWarning ? "white" : "gray.500"}
        align="center"
        justify="center"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box>
        <Text fontSize="sm" fontWeight="800" color="gray.800" mb={0.5}>
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" fontWeight="500" lineHeight="1.5">
          {description}
        </Text>
      </Box>
    </Flex>
  );
}

export function GraceDaysModal({
  open,
  onClose,
  graceDays,
  graceDaysUsed,
}: {
  open: boolean;
  onClose: () => void;
  graceDays: number;
  graceDaysUsed: number;
}) {
  const remaining = graceDays - graceDaysUsed;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => !d.open && onClose()}
      scrollBehavior="inside"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            rounded="2xl"
            mx={4}
            w="full"
            boxShadow="xl"
          >
            <Dialog.CloseTrigger color="gray.300" cursor="pointer">
              <CloseCircle size={24} weight="BoldDuotone" />
            </Dialog.CloseTrigger>

            <Dialog.Body px={8} pt={10} pb={4}>
              <VStack gap={6}>
                {/* Header */}
                <VStack gap={3} textAlign="center">
                  {/* Status atual */}
                  <Flex
                    w="full"
                    gap={4}
                    p={4}
                    borderRadius="xl"
                    align="center"
                    justify="center"
                  >
                    {Array.from({ length: graceDays }).map((_, i) => (
                      <Flex
                        key={i}
                        w={12}
                        h={12}
                        rounded="full"
                        bg={i < remaining ? "blue.400" : "gray.200"}
                        color={i < remaining ? "white" : "gray.400"}
                        align="center"
                        justify="center"
                        shadow={i < remaining ? "md" : "none"}
                      >
                        <Snowflake size={22} weight="BoldDuotone" />
                      </Flex>
                    ))}
                  </Flex>
                  <Stack gap={1}>
                    <Text fontSize="2xl" fontWeight="800" color="gray.800">
                      Dias de graça
                    </Text>
                    <Text fontSize="sm" color="gray.500" fontWeight="600">
                      Uma proteção contra imprevistos
                    </Text>
                  </Stack>
                </VStack>

                <Separator width="100%" borderColor="gray.100" />

                {/* Rules */}
                <VStack gap={2} align="stretch" w="full">
                  <InfoRow
                    icon={<Snowflake size={16} weight="BoldDuotone" />}
                    title="O que são dias de graça?"
                    description={`Esses dias protegem contra imprevistos, como esquecer de registrar um resultado ou ter um dia ruim — eles descartam automaticamente os piores dias de penalidade na média do ranking.`}
                  />
                  <InfoRow
                    icon={<Gamepad size={16} weight="BoldDuotone" />}
                    title="Proteção é por jogo"
                    description="Cada jogo tem suas próprias proteções independentes. Se você faltar em um jogo, só vai usar a proteção daquele jogo — os outros continuam intactos."
                  />
                  <InfoRow
                    icon={<Refresh size={16} weight="BoldDuotone" />}
                    title="Como recuperar proteções"
                    description="O ranking considera os últimos 30 dias. Conforme os dias de falta vão saindo da janela de 30 dias, as proteções voltam automaticamente — sem precisar fazer nada."
                  />
                  {remaining === 0 && (
                    <InfoRow
                      icon={<DangerTriangle size={16} weight="BoldDuotone" />}
                      title="Sem proteção restante"
                      description="Todas as proteções deste período foram usadas. Todo dia sem registro agora conta diretamente como penalidade na sua média."
                      variant="warning"
                    />
                  )}
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer px={8} pt={4} pb={8}>
              <Button
                w="full"
                size="lg"
                bg="blue.400"
                color="white"
                rounded="xl"
                fontWeight="800"
                fontSize="md"
                py={6}
                _hover={{ bg: "blue.500" }}
                boxShadow="0 4px 0 0 var(--chakra-colors-blue-500)"
                _active={{ boxShadow: "none", transform: "translateY(4px)" }}
                transition="all 0.1s"
                onClick={onClose}
              >
                Entendido!
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
