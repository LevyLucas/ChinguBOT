import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("Lista todos os comandos disponíveis do bot."),
  aliases: [],

  async execute(interaction: ChatInputCommandInteraction) {
    const lang = getLang(interaction.locale);
    const t = getTranslations(lang);

    const embed = new EmbedBuilder()
      .setTitle(t.title)
      .setColor(0x2f69fb)
      .setDescription(t.subtitle)
      .addFields(
        {
          name: "🏓 /ping",
          value: `> ${t.commands.ping.description}`,
        },
        {
          name: "🧠 /summarize",
          value: `> ${t.commands.summarize.description}\n${t.commands.summarize.aliases}`,
        },
        {
          name: "💱 /convert",
          value: `> ${t.commands.convert.description}\n${t.commands.convert.aliases}`,
        },
        {
          name: "🕒 /time",
          value: `> ${t.commands.time.description}\n${t.commands.time.aliases}`,
        },
        {
          name: "📋 /commands",
          value: `> ${t.commands.commands.description}`,
        }
      )
      .setFooter({ text: t.footer });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

function getLang(locale: string): "pt" | "en" | "ko" {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

function getTranslations(lang: "pt" | "en" | "ko") {
  const translations = {
    pt: {
      title: "📚 Lista de Comandos",
      subtitle: "Abaixo estão todos os comandos disponíveis atualmente:",
      footer: "Utilize um comando digitando / seguido do nome",
      commands: {
        ping: {
          description: "Verifica o tempo de resposta do bot.",
        },
        summarize: {
          description: "Resume as últimas mensagens do canal.",
          aliases: "_Também pode ser usado como:_ `/resumir`",
        },
        convert: {
          description: "Converte valores entre Wons (₩) e Reais (R$).",
          aliases: "_Também pode ser usado como:_ `/converter`",
        },
        time: {
          description: "Mostra o horário atual na Coreia e no Brasil.",
          aliases: "_Também pode ser usado como:_ `/horas`",
        },
        commands: {
          description: "Exibe esta lista de comandos com descrições.",
        },
      },
    },
    en: {
      title: "📚 Command List",
      subtitle: "Here are all the available bot commands:",
      footer: "Use a command by typing / followed by the name",
      commands: {
        ping: {
          description: "Checks the bot's response time.",
        },
        summarize: {
          description: "Summarizes the latest messages in the channel.",
          aliases: "_Also available as:_ `/resumir`",
        },
        convert: {
          description: "Converts values between Wons (₩) and Reais (R$).",
          aliases: "_Also available as:_ `/converter`",
        },
        time: {
          description: "Shows the current time in Korea and Brazil.",
          aliases: "_Also available as:_ `/horas`",
        },
        commands: {
          description: "Displays this list of available commands.",
        },
      },
    },
    ko: {
      title: "📚 사용 가능한 명령어",
      subtitle: "아래는 현재 사용 가능한 모든 명령어입니다:",
      footer: "/명령어 형식으로 사용하세요",
      commands: {
        ping: {
          description: "봇의 응답 속도를 확인합니다.",
        },
        summarize: {
          description: "최근 채널 메시지를 요약합니다.",
          aliases: "_/resumir 명령어로도 사용할 수 있습니다_",
        },
        convert: {
          description: "원(₩)과 브라질 헤알(R$) 간의 환율을 변환합니다.",
          aliases: "_/converter 명령어로도 사용할 수 있습니다_",
        },
        time: {
          description: "한국과 브라질의 현재 시간을 확인합니다.",
          aliases: "_/horas 명령어로도 사용할 수 있습니다_",
        },
        commands: {
          description: "사용 가능한 모든 명령어를 보여줍니다.",
        },
      },
    },
  };

  return translations[lang];
}
