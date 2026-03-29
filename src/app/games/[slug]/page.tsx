import { GamePage } from "@/components/GamePage";

export default async function GameRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GamePage slug={slug} />;
}
