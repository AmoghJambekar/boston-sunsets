export const BOSTON_LAT = 42.3601;
export const BOSTON_LON = -71.0589;
export const TIMEZONE = 'America/New_York';

/** Open-Meteo v1 forecast hourly variables (west-sector clouds not on this API — mapped in rowAt) */
export const OPEN_METEO_HOURLY =
  'cloud_cover_low,cloud_cover_mid,cloud_cover_high,' +
  'visibility,precipitation,snowfall,wind_speed_10m,' +
  'wind_direction_10m,weather_code,dew_point_2m,temperature_2m,' +
  'apparent_temperature,shortwave_radiation,pm10,pm2_5';
