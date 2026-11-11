// Configurations for verified Indian government disaster intelligence sources

export const officialSourcesConfig = {
  ASDMA_FLOOD_ATLAS: {
    sourceName: "ASDMA",
    sourceURL: "https://asdma.assam.gov.in/portlets/flood-hazard-atlas",
    publishedDate: "2023-09-12",
    retrievedDate: "2026-08-15",
    dataType: "GIS Vector Boundary / Zonal Inundation Map"
  },
  ASDMA_FLOOD_REPORT: {
    sourceName: "ASDMA",
    sourceURL: "https://asdma.assam.gov.in/documents-detail/daily-flood-report",
    publishedDate: "2024-07-28",
    retrievedDate: "2026-08-15",
    dataType: "Daily Incident Report Logs"
  },
  GSI_BHUSANKET: {
    sourceName: "GSI / NLFC",
    sourceURL: "https://gsi.gov.in/webportal/landslide-forecasting",
    publishedDate: "2024-05-18",
    retrievedDate: "2026-08-18",
    dataType: "Susceptibility Zonation Grid"
  },
  BMTPC_VULNERABILITY_ATLAS: {
    sourceName: "BMTPC",
    sourceURL: "https://bmtpc.org/vulnerability-atlas-of-india",
    publishedDate: "2019-03-10",
    retrievedDate: "2026-08-10",
    dataType: "Seismic Vulnerability Index Maps"
  },
  IMD_FORECAST: {
    sourceName: "IMD",
    sourceURL: "https://mausam.imd.gov.in/",
    publishedDate: "2026-08-19",
    retrievedDate: "2026-08-20",
    dataType: "Meteorological Alert / Heat Index warnings"
  },
  ASDMA_DDMP: {
    sourceName: "ASDMA / DDMA",
    sourceURL: "https://asdma.assam.gov.in/portlets/district-disaster-management-plans",
    publishedDate: "2023-06-15",
    retrievedDate: "2026-08-12",
    dataType: "District Disaster Management Action Plan Documents"
  }
};
