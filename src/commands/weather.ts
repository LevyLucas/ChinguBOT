import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import axios from "axios";
import { Agent } from "https";

type Language = "pt" | "en" | "ko";

interface LocationGroup {
  region: string;
  cities: { city: string; label: string }[];
}

const langMap: Record<Language, string> = {
  pt: "pt-BR",
  en: "en-US",
  ko: "ko-KR",
};

const weatherLabels: Record<Language, string> = {
  pt: "Previsão do Tempo",
  en: "Weather Forecast",
  ko: "날씨 예보",
};

const locationGroups: Record<Language, LocationGroup[]> = {
  pt: [
    {
      region: "🇰🇷 Coreia do Sul",
      cities: [
        { city: "Seoul", label: "Seul" },
        { city: "Suwon", label: "Suwon" },
        { city: "Incheon", label: "Incheon" },
      ],
    },
    {
      region: "🇧🇷 Brasil",
      cities: [
        { city: "Curitiba", label: "Curitiba" },
        { city: "Sao Paulo", label: "São Paulo" },
        { city: "Rio de Janeiro", label: "Rio de Janeiro" },
      ],
    },
  ],
  en: [
    {
      region: "🇰🇷 South Korea",
      cities: [
        { city: "Seoul", label: "Seoul" },
        { city: "Suwon", label: "Suwon" },
        { city: "Incheon", label: "Incheon" },
      ],
    },
    {
      region: "🇧🇷 Brazil",
      cities: [
        { city: "Curitiba", label: "Curitiba" },
        { city: "Sao Paulo", label: "São Paulo" },
        { city: "Rio de Janeiro", label: "Rio de Janeiro" },
      ],
    },
  ],
  ko: [
    {
      region: "🇰🇷 대한민국",
      cities: [
        { city: "Seoul", label: "서울" },
        { city: "Suwon", label: "수원" },
        { city: "Incheon", label: "인천" },
      ],
    },
    {
      region: "🇧🇷 브라질",
      cities: [
        { city: "Curitiba", label: "쿠리치바" },
        { city: "Sao Paulo", label: "상파울루" },
        { city: "Rio de Janeiro", label: "리우데자네이루" },
      ],
    },
  ],
};

function getLang(locale: string): Language {
  if (locale.startsWith("pt")) return "pt";
  if (locale.startsWith("ko")) return "ko";
  return "en";
}

function getWeatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "🌤️",
    "02n": "🌤️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "🌩️",
    "11n": "🌩️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };
  return map[icon] || "☁️";
}

export const command = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Check weather in Korea and Brazil"),
  aliases: ["clima"],

  async execute(interaction: ChatInputCommandInteraction) {
    const agent = new Agent({ family: 4 });
    const lang = getLang(interaction.locale);
    const userLocale = langMap[lang];
    await interaction.deferReply();

    try {
      const groups = locationGroups[lang];
      const allCities = groups.flatMap((g) => g.cities);

      const results = await Promise.all(
        allCities.map(({ city }) =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=${lang}`,
            { httpsAgent: agent, timeout: 5000 }
          )
        )
      );

      const embed = new EmbedBuilder()
        .setTitle(weatherLabels[lang])
        .setColor(0xef6f82)
        .setTimestamp();

      let i = 0;
      for (const group of groups) {
        for (const { city, label } of group.cities) {
          const res = results[i++];
          const temp = Math.round(res.data.main.temp);
          const weather = res.data.weather[0].description;
          const icon = res.data.weather[0].icon;
          const emoji = getWeatherEmoji(icon);

          embed.addFields({
            name: `${group.region} - ${label}`,
            value: `🌡️ ${temp} °C\n${emoji} ${weather}`,
            inline: true,
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao obter clima:", error);
      const fallback = {
        pt: "❌ Não foi possível obter o clima.",
        en: "❌ Unable to fetch weather info.",
        ko: "❌ 날씨 정보를 가져올 수 없어요.",
      };
      await interaction.editReply(fallback[lang]);
    }
  },
};
