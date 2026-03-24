import type { WeatherRow } from '../types/weather';
import { cardinalDirection, wmoDescription } from '../lib/wmo';

type Props = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  row: WeatherRow | null;
  darkText: boolean;
};

export function ConditionsPanel({
  open,
  onToggle,
  onClose,
  row,
  darkText,
}: Props) {
  const btnClass = darkText ? 'conditions-btn--dark' : 'conditions-btn--light';

  return (
    <>
      <button
        type="button"
        className={`conditions-btn ${btnClass}`}
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Conditions"
      >
        [i]
      </button>
      <div
        className={`conditions-panel ${open ? 'conditions-panel--open' : ''} ${darkText ? 'conditions-panel--dark' : 'conditions-panel--light'}`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="conditions-panel__inner">
          <div className="conditions-panel__header">
            <h2>Conditions at Sunset</h2>
            <button type="button" className="conditions-panel__close" onClick={onClose}>
              ×
            </button>
          </div>
          {!row ? (
            <p className="conditions-panel__loading">Loading…</p>
          ) : (
            <table className="conditions-panel__table">
              <tbody>
                <tr>
                  <td>Low clouds</td>
                  <td>{row.cloudLow.toFixed(0)} %</td>
                </tr>
                <tr>
                  <td>Low clouds (west)</td>
                  <td>{row.cloudLowWest.toFixed(0)} %</td>
                </tr>
                <tr>
                  <td>Mid clouds</td>
                  <td>{row.cloudMid.toFixed(0)} %</td>
                </tr>
                <tr>
                  <td>Mid clouds (west)</td>
                  <td>{row.cloudMidWest.toFixed(0)} %</td>
                </tr>
                <tr>
                  <td>High clouds</td>
                  <td>{row.cloudHigh.toFixed(0)} %</td>
                </tr>
                <tr>
                  <td>Visibility</td>
                  <td>{(row.visibility / 1000).toFixed(1)} km</td>
                </tr>
                <tr>
                  <td>Wind speed</td>
                  <td>{row.windspeed.toFixed(1)} km/h</td>
                </tr>
                <tr>
                  <td>Wind direction</td>
                  <td>
                    {row.winddirection.toFixed(0)}° {cardinalDirection(row.winddirection)}
                  </td>
                </tr>
                <tr>
                  <td>Dew point spread</td>
                  <td>{(row.temperature - row.dewpoint).toFixed(1)} °C</td>
                </tr>
                <tr>
                  <td>PM2.5</td>
                  <td>{row.pm25.toFixed(1)} μg/m³</td>
                </tr>
                <tr>
                  <td>Precipitation</td>
                  <td>{row.precipitation.toFixed(2)} mm/h</td>
                </tr>
                <tr>
                  <td>Snowfall</td>
                  <td>{row.snowfall.toFixed(2)} cm/h</td>
                </tr>
                <tr>
                  <td>Weather code</td>
                  <td>
                    {row.weathercode} ({wmoDescription(row.weathercode)})
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
      {open ? (
        <button
          type="button"
          className="conditions-panel__backdrop"
          aria-label="Close"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
