import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("social")
    .setDescription("Envia os links das redes sociais da influencer."),
  aliases: ["redes", "sns"],

  async execute(interaction: ChatInputCommandInteraction) {
    const lang = getLang(interaction.locale);
    const t = getTranslations(lang);

    const embed = new EmbedBuilder()
      .setTitle(t.title)
      .setColor(0x2f69fb)
      .setDescription(t.description)
      .addFields(
        {
          name: "📸 Instagram",
          value: `> [@nana.oii](https://www.instagram.com/nana.oii/)`,
          inline: true,
        },
        {
          name: "🎥 YouTube (Canal Principal)",
          value: `> [@coreananana](https://www.youtube.com/@coreananana)`,
          inline: true,
        },
        {
          name: "✂️ YouTube (Cortes)",
          value: `> [@CortesdaNana](https://www.youtube.com/@CortesdaNana)`,
          inline: true,
        },
        {
          name: "🟣 Twitch",
          value: `> [nanacoreaninha](https://www.twitch.tv/nanacoreaninha)`,
          inline: true,
        },
        {
          name: "📱 TikTok",
          value: `> [@coreananana](https://www.tiktok.com/@coreananana)`,
          inline: true,
        },
        {
          name: "📱 Kwai",
          value: `> [@coreananana](https://www.kwai.com/@coreananana)`,
          inline: true,
        }
      )
      .setFooter({ text: t.footer });

    await interaction.reply({ embeds: [embed] });
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
      title: "🌐 Redes Sociais da Nana",
      description: "Confira todas as redes sociais oficiais da influencer Nana:",
      footer: "Siga a Nana para não perder nenhuma novidade!",
    },
    en: {
      title: "🌐 Nana's Social Media",
      description: "Check out all official social media links of influencer Nana:",
      footer: "Follow Nana and stay updated!",
    },
    ko: {
      title: "🌐 나나의 SNS 목록",
      description: "인플루언서 나나의 공식 SNS를 확인해보세요:",
      footer: "팔로우하고 소식을 받아보세요!",
    },
  };

  return translations[lang];
}
