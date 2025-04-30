import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Mostra o horário atual na Coreia do Sul e no Brasil."),
  aliases: ["horas"],

  async execute(interaction: ChatInputCommandInteraction) {
    const lang = getLang(interaction.locale);

    const now = new Date();
    const koreaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
    const brazilTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeKR = koreaTime.toLocaleString(langMap[lang], options);
    const timeBR = brazilTime.toLocaleString(langMap[lang], options);

    const diffHours = (koreaTime.getTime() - brazilTime.getTime()) / 3600000;
    const timeDiffText = getTimeDiffText(lang, diffHours);
    const labels = getFieldLabels(lang);

    const embed = new EmbedBuilder()
      .setTitle(getTitle(lang))
      .setColor(0x2f69fb)
      .addFields(
        { name: `🇰🇷 ${labels.kr}`, value: `🕒 ${timeKR}`, inline: true },
        { name: `🇧🇷 ${labels.br}`, value: `🕒 ${timeBR}`, inline: true },
        { name: "🧭 " + labels.diff, value: timeDiffText }
      );

    return interaction.reply({ embeds: [embed] });
  },
};

function getLang(locale: string): "pt" | "en" | "ko" {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

const langMap: Record<"pt" | "en" | "ko", string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

function getTitle(lang: "pt" | "en" | "ko"): string {
  const titles: Record<"pt" | "en" | "ko", string> = {
    pt: "🕒 Horário Atual",
    en: "🕒 Current Time",
    ko: "🕒 현재 시간",
  };
  return titles[lang];
}

function getFieldLabels(lang: "pt" | "en" | "ko") {
  const labels = {
    pt: {
      kr: "Coreia do Sul",
      br: "Brasil (Brasília)",
      diff: "Diferença",
    },
    en: {
      kr: "South Korea",
      br: "Brazil (Brasília)",
      diff: "Time Difference",
    },
    ko: {
      kr: "대한민국",
      br: "브라질 (브라질리아)",
      diff: "시간 차이",
    },
  };
  return labels[lang];
}

function getTimeDiffText(lang: "pt" | "en" | "ko", diff: number): string {
  const formatted = Math.abs(diff).toFixed(0);
  const isAhead = diff > 0;

  if (lang === "pt") {
    return isAhead
      ? `A Coreia está **${formatted} horas à frente** do Brasil.`
      : `O Brasil está **${formatted} horas à frente** da Coreia.`;
  }

  if (lang === "ko") {
    return isAhead
      ? `한국은 브라질보다 **${formatted}시간 빠릅니다.**`
      : `브라질은 한국보다 **${formatted}시간 빠릅니다.**`;
  }

  return isAhead
    ? `Korea is **${formatted} hours ahead** of Brazil.`
    : `Brazil is **${formatted} hours ahead** of Korea.`;
}
