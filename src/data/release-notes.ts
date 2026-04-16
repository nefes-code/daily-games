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
    version: "0.6.1",
    date: "Abril 2026",
    title: "Modo escuro",
    features: [
      {
        emoji: "🌙",
        text: "Switch de tema claro/escuro disponível na barra lateral",
      },
      {
        emoji: "🎨",
        text: "Todos os componentes usam tokens semânticos de cor — nada hardcoded",
      },
      {
        emoji: "💾",
        text: "Preferência de tema salva automaticamente entre sessões",
      },
      {
        emoji: "🖥️",
        text: "Segue o tema do sistema operacional por padrão",
      },
    ],
  },
  {
    version: "0.6.0",
    date: "Abril 2026",
    title: "Explorador de estatísticas",
    features: [
      {
        emoji: "📊",
        text: "Novo explorador de estatísticas acessível na página de cada jogo",
      },
      {
        emoji: "📅",
        text: "Filtre por período: últimos 7, 10, 20, 30, 60 dias ou histórico completo",
      },
      {
        emoji: "🎯",
        text: "Escolha a métrica: média, melhor resultado, pior resultado ou total de dias jogados",
      },
      {
        emoji: "👤",
        text: "Filtre para ver apenas os dias em que um jogador específico participou",
      },
      {
        emoji: "🔍",
        text: "Consulte os resultados de um dia específico pelo seletor de data",
      },
    ],
  },
  {
    version: "0.5.1",
    date: "Abril 2026",
    title: "Dias de graça",
    features: [
      {
        emoji: "❄️",
        text: "3 dias de graça por período — os piores dias de penalidade são descartados automaticamente",
      },
      {
        emoji: "🛡️",
        text: "Badge de proteção no pódio mostra quantos dias de graça você ainda tem",
      },
      {
        emoji: "ℹ️",
        text: "Regra dos dias de graça explicada no modal de informações do ranking",
      },
    ],
  },
  {
    version: "0.5.0",
    date: "Abril 2026",
    title: "Ranking de consistência",
    features: [
      {
        emoji: "⚖️",
        text: "Dias sem registro agora contam como pior resultado na média do ranking",
      },
      {
        emoji: "📅",
        text: "Contador X/Y dias no pódio mostra quantos dias você participou no período",
      },
      {
        emoji: "🔥",
        text: "Badge de streak por jogo exibido diretamente no card do pódio",
      },
      {
        emoji: "🎉",
        text: "Tela de sucesso ao registrar resultado mostra sua sequência atual",
      },
      {
        emoji: "ℹ️",
        text: "Botão de informação no ranking explica as regras de forma simples",
      },
    ],
  },
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
      {
        emoji: "⌨️",
        text: "Resolvido scroll do modal de salvar resultado",
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
