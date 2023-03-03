export default function usePokeApi() {
  const pokemonColors = [
    {
      eng: "black",
      ch: "黑色",
    },
    {
      eng: "blue",
      ch: "藍色",
    },
    {
      eng: "brown",
      ch: "棕色",
    },
    {
      eng: "gray",
      ch: "灰色",
    },
    {
      eng: "green",
      ch: "綠色",
    },
    {
      eng: "pink",
      ch: "粉紅色",
    },
    {
      eng: "purple",
      ch: "紫色",
    },
    {
      eng: "red",
      ch: "紅色",
    },
    {
      eng: "white",
      ch: "白色",
    },
    {
      eng: "yellow",
      ch: "黃色",
    },
    ,
  ];

  function getColorChineseName(engName) {
    const color = pokemonColors.find((item) => {
      return item.eng === engName;
    });

    return color.ch;
  }

  function getLanguageContent(dataArr, language = "zh-Hant") {
    const data = dataArr.find((item) => {
      return item.language.name === language;
    });
    return data || {};
  }

  return { getLanguageContent, getColorChineseName };
}
