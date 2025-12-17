import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type CountryCode, COUNTRY_CONFIGS, getCountryList } from "@shared/countryConfig";

interface CountrySelectorProps {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
  label?: string;
  labelFr?: string;
  labelEn?: string;
  disabled?: boolean;
  showCurrency?: boolean;
  showPhone?: boolean;
  className?: string;
}

export function CountrySelector({
  value,
  onChange,
  label,
  labelFr = "Pays",
  labelEn = "Country",
  disabled = false,
  showCurrency = false,
  showPhone = false,
  className = ""
}: CountrySelectorProps) {
  const countries = getCountryList();
  const selectedConfig = COUNTRY_CONFIGS[value];

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || labelFr) && (
        <Label className="text-sm font-medium">
          {label || `${labelFr} / ${labelEn}`}
        </Label>
      )}
      
      <Select value={value} onValueChange={(v) => onChange(v as CountryCode)} disabled={disabled}>
        <SelectTrigger className="w-full" data-testid="country-selector">
          <SelectValue placeholder="Sélectionner un pays / Select a country">
            {selectedConfig && (
              <span className="flex items-center gap-2">
                <span className="text-xl">{selectedConfig.flag}</span>
                <span>{selectedConfig.name.fr}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {countries.map((country) => {
            const config = COUNTRY_CONFIGS[country.code];
            return (
              <SelectItem 
                key={country.code} 
                value={country.code}
                data-testid={`country-option-${country.code}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-500 text-sm">({config.name.en})</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {(showCurrency || showPhone) && selectedConfig && (
        <div className="text-xs text-gray-500 mt-1 space-y-1">
          {showCurrency && (
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span>{selectedConfig.currency.symbol} ({selectedConfig.currency.code})</span>
            </div>
          )}
          {showPhone && (
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>{selectedConfig.phone.prefix} ({selectedConfig.phone.format})</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CountryFlag({ code, size = "md" }: { code: CountryCode; size?: "sm" | "md" | "lg" }) {
  const config = COUNTRY_CONFIGS[code];
  if (!config) return null;

  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <span 
      className={sizeClasses[size]} 
      title={`${config.name.fr} / ${config.name.en}`}
      data-testid={`country-flag-${code}`}
    >
      {config.flag}
    </span>
  );
}

export function CountryBadge({ code }: { code: CountryCode }) {
  const config = COUNTRY_CONFIGS[code];
  if (!config) return null;

  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium"
      data-testid={`country-badge-${code}`}
    >
      <span>{config.flag}</span>
      <span>{code}</span>
    </span>
  );
}

export default CountrySelector;
