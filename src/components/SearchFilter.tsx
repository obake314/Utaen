import type { SearchFilter as FilterType } from "../types";
import { REGIONS } from "../types";
import "./SearchFilter.css";

interface SearchFilterProps {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
  onClose: () => void;
}

export function SearchFilter({ filter, onChange, onClose }: SearchFilterProps) {
  return (
    <div className="filter-overlay">
      <div className="filter-panel">
        <h3 className="filter-title">検索条件</h3>

        <label className="filter-label">
          年齢
          <div className="filter-age-row">
            <input
              className="filter-input"
              type="number"
              min={18}
              max={99}
              value={filter.ageMin}
              onChange={(e) =>
                onChange({ ...filter, ageMin: parseInt(e.target.value, 10) || 18 })
              }
            />
            <span className="filter-sep">〜</span>
            <input
              className="filter-input"
              type="number"
              min={18}
              max={99}
              value={filter.ageMax}
              onChange={(e) =>
                onChange({ ...filter, ageMax: parseInt(e.target.value, 10) || 99 })
              }
            />
            <span className="filter-unit">歳</span>
          </div>
        </label>

        <label className="filter-label">
          地域
          <select
            className="filter-input filter-select"
            value={filter.region}
            onChange={(e) => onChange({ ...filter, region: e.target.value })}
          >
            <option value="">全地域</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <button className="filter-btn" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}
