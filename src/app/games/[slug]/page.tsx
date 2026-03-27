import { GamePage } from "./game-page";

export default async function GameRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GamePage slug={slug} />;
}
