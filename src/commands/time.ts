import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("time")
    .setDescription("Mostra o horário atual na Coreia do Sul e em outro local (padrão: Brasil).")
    .addStringOption(option =>
      option
        .setName("local")
        .setDescription("Nome da cidade ou país para comparar com a Coreia.")
        .setRequired(false)
    ),
  aliases: ["horas"],

  async execute(interaction: ChatInputCommandInteraction) {
    const lang = getLang(interaction.locale);
    const localInput = interaction.options.getString("local");

    const fallbackLabel = {
      pt: "Brasil (Brasília)",
      en: "Brazil (Brasília)",
      ko: "브라질 (브라질리아)",
    };
    const localLabel = localInput ?? fallbackLabel[lang];

    const now = new Date();
    const koreaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );

    const localTimeZone = getTimeZoneFromInput(localInput ?? undefined);

    let localTime: Date;
    try {
      localTime = new Date(
        now.toLocaleString("en-US", { timeZone: localTimeZone })
      );
    } catch (e) {
      return interaction.reply({
        content: {
          pt: "❌ Não foi possível reconhecer esse local.",
          en: "❌ Couldn't recognize this location.",
          ko: "❌ 해당 위치를 인식할 수 없습니다.",
        }[lang],
        ephemeral: true,
      });
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeKR = koreaTime.toLocaleString(langMap[lang], options);
    const timeLocal = localTime.toLocaleString(langMap[lang], options);

    const diffHours = (koreaTime.getTime() - localTime.getTime()) / 3600000;
    const timeDiffText = getTimeDiffText(lang, diffHours);
    const labels = getFieldLabels(lang);

    const embed = new EmbedBuilder()
      .setTitle(getTitle(lang))
      .setColor(0xef6f82)
      .addFields(
        { name: `🇰🇷 ${labels.kr}`, value: `🕒 ${timeKR}`, inline: true },
        { name: `🌍 ${localLabel}`, value: `🕒 ${timeLocal}`, inline: true },
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
      ? `A Coreia está **${formatted} horas à frente** do local informado.`
      : `O local informado está **${formatted} horas à frente** da Coreia.`;
  }

  if (lang === "ko") {
    return isAhead
      ? `한국은 해당 위치보다 **${formatted}시간 빠릅니다.**`
      : `해당 위치는 한국보다 **${formatted}시간 빠릅니다.**`;
  }

  return isAhead
    ? `Korea is **${formatted} hours ahead** of the provided location.`
    : `The provided location is **${formatted} hours ahead** of Korea.`;
}

function getTimeZoneFromInput(input?: string): string {
  if (!input) return "America/Sao_Paulo";

  const normalized = input.toLowerCase().trim();

  const map: Record<string, string> = {
    "manaus": "America/Manaus",
    "sao paulo": "America/Sao_Paulo",
    "brasilia": "America/Sao_Paulo",
    "lisboa": "Europe/Lisbon",
    "new york": "America/New_York",
    "los angeles": "America/Los_Angeles",
    "london": "Europe/London",
    "tokyo": "Asia/Tokyo",
    "seoul": "Asia/Seoul",
    "coreia": "Asia/Seoul",
    "ho chi minh": "Asia/Ho_Chi_Minh",
    "vietnam": "Asia/Ho_Chi_Minh",
    "paris": "Europe/Paris",
    "mexico": "America/Mexico_City",
    "berlim": "Europe/Berlin",
    "roma": "Europe/Rome",
    "buenos aires": "America/Argentina/Buenos_Aires",
    "montevideo": "America/Montevideo",
  };

  return map[normalized] ?? "Invalid/Zone";
}
