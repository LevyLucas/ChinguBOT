import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";

export const command = {
  data: new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Converte valores entre Wons (₩) e Reais (R$).")
    .addStringOption((option) =>
      option
        .setName("direcao")
        .setDescription("Direção da conversão")
        .setRequired(true)
        .addChoices(
          { name: "₩ Won → R$ Real", value: "krw_to_brl" },
          { name: "R$ Real → ₩ Won", value: "brl_to_krw" }
        )
    )
    .addNumberOption((option) =>
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

    console.log("🟡 Iniciando /converter");
    await interaction.deferReply();
    console.log("🟢 deferReply enviado com sucesso");

    const from = direction === "krw_to_brl" ? "KRW" : "BRL";
    const to = direction === "krw_to_brl" ? "BRL" : "KRW";

    try {
      const res = await fetch(
        `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
      );
      const data = await res.json();

      if (!data.result) throw new Error("Invalid conversion");

      const converted = data.result.toFixed(to === "KRW" ? 0 : 2);
      const response = getTranslation(lang, direction, amount, converted);

      return interaction.editReply(response);
    } catch (err) {
      console.error("Erro ao converter moeda:", err);
      return interaction.editReply(getErrorMessage(lang));
    }
  },
};

function getLang(locale: string): "pt" | "en" | "ko" {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

function getTranslation(
  lang: string,
  direction: string,
  amount: number,
  result: string
): string {
  if (lang === "pt") {
    return direction === "krw_to_brl"
      ? `₩ ${amount.toLocaleString(
          "pt-BR"
        )} Wons equivalem a **R$ ${result}** Reais.`
      : `R$ ${amount.toLocaleString(
          "pt-BR"
        )} Reais equivalem a **₩ ${result}** Wons.`;
  }
  if (lang === "ko") {
    return direction === "krw_to_brl"
      ? `₩ ${amount.toLocaleString(
          "ko-KR"
        )} 원은 **R$ ${result}** 브라질 헤알입니다.`
      : `R$ ${amount.toLocaleString("ko-KR")}는 **₩ ${result}** 원입니다.`;
  }
  return direction === "krw_to_brl"
    ? `₩ ${amount.toLocaleString("en-US")} Won equals **R$ ${result}** BRL.`
    : `R$ ${amount.toLocaleString("en-US")} equals **₩ ${result}** Won.`;
}

function getErrorMessage(lang: string): string {
  return (
    {
      pt: "❌ Erro ao buscar a taxa de câmbio.",
      en: "❌ Error fetching exchange rate.",
      ko: "❌ 환율 정보를 불러오지 못했습니다.",
    }[lang] || "❌ Error fetching exchange rate."
  );
}
