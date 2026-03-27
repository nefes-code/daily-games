import { GamePage } from "./game-page";

export default async function GameRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GamePage gameId={id} />;
}
