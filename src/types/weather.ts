export type Urgency = 'early' | 'soon' | 'now' | 'during' | 'passed';

/** Hourly row aligned to sunset for scoring & visualization */
export type WeatherRow = {
  cloudLow: number;
  cloudMid: number;
  cloudHigh: number;
  cloudLowWest: number;
  cloudMidWest: number;
  visibility: number;
  precipitation: number;
  snowfall: number;
  dewpoint: number;
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  pm25: number;
  shortwave: number;
  /** ISO time string for the hour (Open-Meteo, America/New_York) */
  time: string;
};

export type WeatherData = {
  dateKey: string;
  row: WeatherRow;
  hourlyTimes: string[];
};
