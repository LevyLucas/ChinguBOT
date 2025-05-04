import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";
import axios from "axios";

type Language = "pt" | "en" | "ko";

const langMap: Record<Language, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR"
};

const locationGroups = [
  {
    region: "🇰🇷 Coreia do Sul",
    cities: [
      { city: "Seoul", label: "Seul" },
      { city: "Suwon", label: "Suwon" },
      { city: "Incheon", label: "Incheon" }
    ]
  },
  {
    region: "🇧🇷 Brasil",
    cities: [
      { city: "Curitiba", label: "Curitiba" },
      { city: "Sao Paulo", label: "São Paulo" },
      { city: "Rio de Janeiro", label: "Rio de Janeiro" }
    ]
  }
];

function getLang(locale: string): Language {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

export const command = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Check weather in Korea and Brazil"),
  aliases: ["clima"],

  async execute(interaction: ChatInputCommandInteraction) {
    const lang = getLang(interaction.locale);
    await interaction.deferReply();

    try {
      const allCities = locationGroups.flatMap(g => g.cities);

      const results = await Promise.all(
        allCities.map(({ city }) =>
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=${lang}`)
        )
      );

      const embed = new EmbedBuilder()
        .setTitle(lang === "pt" ? "Previsão do Tempo" : lang === "ko" ? "날씨" : "Weather Forecast")
        .setColor(0x2f69fb)
        .setTimestamp();

      let i = 0;
      for (const group of locationGroups) {
        for (const { city, label } of group.cities) {
          const res = results[i++];
          const temp = Math.round(res.data.main.temp);
          const weather = res.data.weather[0].description;

          embed.addFields({
            name: `${group.region} - ${label}`,
            value: `🌡️ ${temp} °C\n☁️ ${weather}`,
            inline: true
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao obter clima:", error);
      await interaction.editReply(
        lang === "pt"
          ? "❌ Não foi possível obter o clima."
          : lang === "ko"
          ? "❌ 날씨 정보를 가져올 수 없어요."
          : "❌ Unable to fetch weather info."
      );
    }
  }
};
