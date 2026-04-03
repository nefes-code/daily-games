export type ReleaseFeature = {
  emoji: string;
  text: string;
};

export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  features: ReleaseFeature[];
};

export const releaseNotes: ReleaseNote[] = [
  {
    version: "0.4.0",
    date: "Abril 2026",
    title: "Release notes",
    features: [
      { emoji: "⌨️", text: "Modal com notas de atualização" },
      {
        emoji: "⌨️",
        text: "Para abrir o modal novamente clique na versão abaixo do perfil",
      },
    ],
  },
  {
    version: "0.3.1",
    date: "Abril 2026",
    title: "Refinamentos",
    features: [
      { emoji: "⌨️", text: "Enter salva o resultado direto no modal de jogo" },
      {
        emoji: "🐛",
        text: "Correções de layout e pequenos ajustes de UX",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "Março 2026",
    title: "Streak &Múltiplas rodadas",
    features: [
      {
        emoji: "🔁",
        text: "Jogos agora suportam múltiplas rodadas por sessão",
      },
      {
        emoji: "✅",
        text: "Status de vitória e derrota por rodada",
      },
      {
        emoji: "🔥",
        text: "Streak de dias jogados com histórico de recorde",
      },
    ],
  },
  {
    version: "0.2.0",
    date: "Março 2026",
    title: "Reações & ícones",
    features: [
      {
        emoji: "😄",
        text: "Reações com emojis nos resultados dos outros jogadores",
      },
      {
        emoji: "🎨",
        text: "Ícones personalizados para cada jogo cadastrado",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "Março 2026",
    title: "Lançamento inicial",
    features: [
      { emoji: "🎮", text: "Plataforma de jogos diários" },
      { emoji: "🔐", text: "Login com Google" },
      {
        emoji: "🏆",
        text: "Jogos competitivos com placar e leaderboard",
      },
      { emoji: "🤝", text: "Jogos cooperativos para jogar em grupo" },
      {
        emoji: "⏱️",
        text: "Suporte a resultados por pontuação ou por tempo",
      },
      { emoji: "🛠️", text: "Painel administrativo para gerenciar jogos" },
    ],
  },
];

/** Versão mais recente (primeira da lista) */
export const latestRelease = releaseNotes[0];
