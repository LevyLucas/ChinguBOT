import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";

export const command = {
  data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Converte valores entre Wons (₩) e Reais (R$).")
    .addStringOption(option =>
      option
        .setName("direcao")
        .setDescription("Direção da conversão")
        .setRequired(true)
        .addChoices(
          { name: "₩ Won → R$ Real", value: "krw_to_brl" },
          { name: "R$ Real → ₩ Won", value: "brl_to_krw" }
        )
    )
    .addNumberOption(option =>
      option
        .setName("valor")
        .setDescription("Valor a ser convertido")
        .setRequired(true)
    ),
  aliases: ["converter"],

  async execute(interaction: ChatInputCommandInteraction) {
    const direction = interaction.options.getString("direcao")!;
    const amount = interaction.options.getNumber("valor")!;
    const lang = getLang(interaction.locale);

    await interaction.deferReply();

    const from = direction === "krw_to_brl" ? "KRW" : "BRL";
    const to = direction === "krw_to_brl" ? "BRL" : "KRW";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`,
        {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; NanaBot/1.0)"
          }
        }
      );
      clearTimeout(timeout);

      const data = await res.json();
      const converted = data.rates[to];
      if (typeof converted !== "number") {
        throw new Error("Invalid conversion response");
      }

      const embed = buildEmbed(lang, from, to, amount, converted);
      return interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      clearTimeout(timeout);

      console.error("❌ Erro ao converter moeda:", err);
      return interaction.editReply(getErrorMessage(lang));
    }
  }
};

function getLang(locale: string): "pt" | "en" | "ko" {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

function buildEmbed(
  lang: "pt" | "en" | "ko",
  from: "BRL" | "KRW",
  to: "BRL" | "KRW",
  amount: number,
  result: number
): EmbedBuilder {
  const format = (v: number, currency: string) => {
    const locales = { pt: "pt-BR", en: "en-US", ko: "ko-KR" };
    const digits = currency === "KRW" ? 0 : 2;
    return new Intl.NumberFormat(locales[lang], {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(v);
  };

  const formattedFrom = format(amount, from);
  const formattedTo = format(result, to);

  const directionText = {
    pt: `${formattedFrom} equivalem a ${formattedTo}.`,
    en: `${formattedFrom} equals ${formattedTo}.`,
    ko: `${formattedFrom}는 ${formattedTo}입니다.`,
  }[lang];

  const title = {
    pt: "💱 Conversão de Moeda",
    en: "💱 Currency Conversion",
    ko: "💱 환율 변환",
  }[lang];

  const fieldName = {
    pt: "Resultado",
    en: "Result",
    ko: "결과",
  }[lang];

  return new EmbedBuilder()
    .setTitle(title)
    .setColor(0x2f69fb)
    .addFields({
      name: fieldName,
      value: directionText,
    });
}

function getErrorMessage(lang: string): string {
  return {
    pt: "❌ Erro ao buscar a taxa de câmbio.",
    en: "❌ Error fetching exchange rate.",
    ko: "❌ 환율 정보를 불러오지 못했습니다.",
  }[lang] || "❌ Error fetching exchange rate.";
}
