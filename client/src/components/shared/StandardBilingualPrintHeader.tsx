import { useQuery } from '@tanstack/react-query';

interface SchoolInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  directorName?: string;
  regionaleMinisterielle?: string;
  delegationDepartementale?: string;
  officialInfo?: {
    regionaleMinisterielle?: string;
    delegationDepartementale?: string;
  };
}

interface StandardBilingualPrintHeaderProps {
  title: { fr: string; en: string };
  subtitle?: { fr: string; en: string };
  schoolOverride?: SchoolInfo;
  showLogo?: boolean;
}

export const StandardBilingualPrintHeader: React.FC<StandardBilingualPrintHeaderProps> = ({
  title,
  subtitle,
  schoolOverride,
  showLogo = true
}) => {
  const { data: schoolData } = useQuery({
    queryKey: ['/api/director/settings'],
    queryFn: async () => {
      const response = await fetch('/api/director/settings', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1
  });

  const school: SchoolInfo = schoolOverride || schoolData?.settings?.school || schoolData?.school || {};
  const regionaleRaw = school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '';
  const departementaleRaw = school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '';

  // Helper function to format delegation text - handles both FR and EN input
  const formatDelegation = (value: string, type: 'regional' | 'departmental', lang: 'fr' | 'en'): string => {
    if (!value) return lang === 'fr' ? '…' : '….';
    
    // Check if already contains prefix
    const hasPrefix = value.toUpperCase().startsWith('DÉLÉGATION') || 
                      value.toUpperCase().startsWith('DELEGATION') ||
                      value.toUpperCase().startsWith('REGIONAL') ||
                      value.toUpperCase().startsWith('DIVISIONAL');
    
    if (hasPrefix) {
      // Extract just the location name
      const match = value.match(/(?:DÉLÉGATION\s+(?:RÉGIONALE|DÉPARTEMENTALE)|REGIONAL\s+DELEGATION|DIVISIONAL\s+DELEGATION)\s*(?:DU|DE|OF)?\s*(.+)/i);
      const locationName = match ? match[1] : value;
      
      if (lang === 'fr') {
        return type === 'regional' 
          ? `DÉLÉGATION RÉGIONALE DU ${locationName}`
          : `DÉLÉGATION DÉPARTEMENTALE DU ${locationName}`;
      } else {
        return type === 'regional'
          ? `REGIONAL DELEGATION OF ${locationName}`
          : `DIVISIONAL DELEGATION OF ${locationName}`;
      }
    }
    
    // No prefix - just add appropriate prefix
    if (lang === 'fr') {
      return type === 'regional' 
        ? `DÉLÉGATION RÉGIONALE DU ${value}`
        : `DÉLÉGATION DÉPARTEMENTALE DU ${value}`;
    } else {
      return type === 'regional'
        ? `REGIONAL DELEGATION OF ${value}`
        : `DIVISIONAL DELEGATION OF ${value}`;
    }
  };

  return (
    <div className="hidden print:block p-4 border-b-2 border-black">
      <div className="text-center space-y-1">
        {showLogo && school?.logoUrl && (
          <div className="flex justify-center mb-3">
            <img 
              src={school.logoUrl} 
              alt="Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase">
          {/* French Column (Left) */}
          <div className="text-left">
            <div>RÉPUBLIQUE DU CAMEROUN</div>
            <div className="italic font-normal">Paix – Travail – Patrie</div>
            <div className="text-[10px] mt-1">***</div>
            <div className="mt-1">MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</div>
            <div className="text-[10px] mt-1">***</div>
            <div>{formatDelegation(regionaleRaw, 'regional', 'fr')}</div>
            <div>{formatDelegation(departementaleRaw, 'departmental', 'fr')}</div>
            <div className="mt-1 font-bold">{school?.name || 'ÉTABLISSEMENT'}</div>
          </div>
          
          <div className="flex items-center justify-center">
            {showLogo && !school?.logoUrl && (
              <div className="text-gray-400 text-sm">LOGO</div>
            )}
          </div>
          
          {/* English Column (Right) */}
          <div className="text-right">
            <div>REPUBLIC OF CAMEROON</div>
            <div className="italic font-normal">Peace – Work – Fatherland</div>
            <div className="text-[10px] mt-1">***</div>
            <div className="mt-1">MINISTRY OF SECONDARY EDUCATION</div>
            <div className="text-[10px] mt-1">***</div>
            <div>{formatDelegation(regionaleRaw, 'regional', 'en')}</div>
            <div>{formatDelegation(departementaleRaw, 'departmental', 'en')}</div>
            <div className="mt-1 font-bold">{school?.name || 'SCHOOL'}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t-2 border-black">
          <h1 className="text-lg font-bold uppercase">
            {title.fr} / {title.en}
          </h1>
          {subtitle && (
            <p className="text-sm font-semibold mt-2">
              {subtitle.fr} | {subtitle.en}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for HTML generation - same logic as React component
function formatDelegationHtml(value: string, type: 'regional' | 'departmental', lang: 'fr' | 'en'): string {
  if (!value) return lang === 'fr' ? '…' : '….';
  
  const hasPrefix = value.toUpperCase().startsWith('DÉLÉGATION') || 
                    value.toUpperCase().startsWith('DELEGATION') ||
                    value.toUpperCase().startsWith('REGIONAL') ||
                    value.toUpperCase().startsWith('DIVISIONAL');
  
  if (hasPrefix) {
    const match = value.match(/(?:DÉLÉGATION\s+(?:RÉGIONALE|DÉPARTEMENTALE)|REGIONAL\s+DELEGATION|DIVISIONAL\s+DELEGATION)\s*(?:DU|DE|OF)?\s*(.+)/i);
    const locationName = match ? match[1] : value;
    
    if (lang === 'fr') {
      return type === 'regional' 
        ? `DÉLÉGATION RÉGIONALE DU ${locationName}`
        : `DÉLÉGATION DÉPARTEMENTALE DU ${locationName}`;
    } else {
      return type === 'regional'
        ? `REGIONAL DELEGATION OF ${locationName}`
        : `DIVISIONAL DELEGATION OF ${locationName}`;
    }
  }
  
  if (lang === 'fr') {
    return type === 'regional' 
      ? `DÉLÉGATION RÉGIONALE DU ${value}`
      : `DÉLÉGATION DÉPARTEMENTALE DU ${value}`;
  } else {
    return type === 'regional'
      ? `REGIONAL DELEGATION OF ${value}`
      : `DIVISIONAL DELEGATION OF ${value}`;
  }
}

export function generateBilingualPrintHeaderHtml(
  school: SchoolInfo | null,
  title: { fr: string; en: string },
  subtitle?: { fr: string; en: string }
): string {
  const regionaleRaw = school?.regionaleMinisterielle || school?.officialInfo?.regionaleMinisterielle || '';
  const departementaleRaw = school?.delegationDepartementale || school?.officialInfo?.delegationDepartementale || '';
  const logoHtml = school?.logoUrl 
    ? `<img src="${school.logoUrl}" alt="Logo" style="width:70px;height:70px;object-fit:contain;">`
    : '<div style="color:#999;font-size:12px;">LOGO</div>';

  return `
    <div style="border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:20px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;text-transform:uppercase;">
        <tr>
          <td style="width:40%;text-align:left;vertical-align:top;font-weight:bold;">
            <div>RÉPUBLIQUE DU CAMEROUN</div>
            <div style="font-style:italic;font-weight:normal;">Paix – Travail – Patrie</div>
            <div style="font-size:9px;margin:3px 0;">***</div>
            <div>MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES</div>
            <div style="font-size:9px;margin:3px 0;">***</div>
            <div>${formatDelegationHtml(regionaleRaw, 'regional', 'fr')}</div>
            <div>${formatDelegationHtml(departementaleRaw, 'departmental', 'fr')}</div>
            <div style="margin-top:5px;font-weight:bold;">${school?.name || 'ÉTABLISSEMENT'}</div>
          </td>
          <td style="width:20%;text-align:center;vertical-align:middle;">
            ${logoHtml}
          </td>
          <td style="width:40%;text-align:right;vertical-align:top;font-weight:bold;">
            <div>REPUBLIC OF CAMEROON</div>
            <div style="font-style:italic;font-weight:normal;">Peace – Work – Fatherland</div>
            <div style="font-size:9px;margin:3px 0;">***</div>
            <div>MINISTRY OF SECONDARY EDUCATION</div>
            <div style="font-size:9px;margin:3px 0;">***</div>
            <div>${formatDelegationHtml(regionaleRaw, 'regional', 'en')}</div>
            <div>${formatDelegationHtml(departementaleRaw, 'departmental', 'en')}</div>
            <div style="margin-top:5px;font-weight:bold;">${school?.name || 'SCHOOL'}</div>
          </td>
        </tr>
      </table>
      <div style="text-align:center;margin-top:15px;padding-top:10px;border-top:2px solid #000;">
        <h1 style="font-size:16px;font-weight:bold;text-transform:uppercase;margin:0;">
          ${title.fr} / ${title.en}
        </h1>
        ${subtitle ? `<p style="font-size:12px;margin-top:8px;font-weight:600;">${subtitle.fr} | ${subtitle.en}</p>` : ''}
      </div>
    </div>
  `;
}

export default StandardBilingualPrintHeader;
