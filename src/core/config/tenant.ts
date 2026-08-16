export interface MunicipalityConfig {
  name: string;
  state: string;
  stateAbbr: string;
  secretariatName: string;
  abbreviation: string;
  logoUrl?: string;
  coatOfArmsUrl?: string;
  portalDomain: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export const CURRENT_TENANT: MunicipalityConfig = {
  name: "Baraúna",
  state: "Rio Grande do Norte",
  stateAbbr: "RN",
  secretariatName: "Secretaria Municipal de Educação",
  abbreviation: "SME Baraúna",
  portalDomain: "smebaraunarn.com",
  contactEmail: "secretaria@barauna.rn.gov.br",
  contactPhone: "(84) 3324-0000",
  address: "Centro Administrativo Municipal — Baraúna/RN",
  theme: {
    primaryColor: "#0F766E",
    secondaryColor: "#2563EB",
  },
};
