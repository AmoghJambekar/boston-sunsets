declare module 'suncalc' {
  export interface SunTimesResult {
    solarNoon: Date;
    nadir: Date;
    sunrise: Date;
    sunset: Date;
    sunriseEnd: Date;
    sunsetStart: Date;
    dawn: Date;
    dusk: Date;
    nauticalDawn: Date;
    nauticalDusk: Date;
    nightEnd: Date;
    night: Date;
    goldenHourEnd: Date;
    /** Evening: sun at 6° above horizon, start of warm pre-sunset light */
    goldenHour: Date;
  }

  const SunCalc: {
    getTimes(
      date: Date,
      lat: number,
      lng: number,
      height?: number
    ): SunTimesResult;
  };
  export default SunCalc;
}
