import Image from "next/image";
import { cn } from "@/components/ui/utils";

const ATP_TO_REGION: Record<string, string> = {
  AFG: "AF", AGO: "AO", AHO: "CW", ALB: "AL", ALG: "DZ", AND: "AD", ANG: "AO", ANT: "CW",
  ARG: "AR", ARM: "AM", ARU: "AW", ASA: "AS", AUS: "AU", AUT: "AT", AZE: "AZ", BAH: "BS",
  BAN: "BD", BAR: "BB", BDI: "BI", BEL: "BE", BEN: "BJ", BER: "BM", BIH: "BA", BIZ: "BZ",
  BLR: "BY", BOL: "BO", BOT: "BW", BRA: "BR", BRN: "BH", BRU: "BN", BUL: "BG", BUR: "BF",
  CAF: "CF", CAM: "KH", CAN: "CA", CAY: "KY", CGO: "CG", CHI: "CL", CHL: "CL", CHN: "CN",
  CIV: "CI", CMR: "CM", COD: "CD", COK: "CK", COL: "CO", CPV: "CV", CRC: "CR", CRO: "HR",
  CUB: "CU", CUW: "CW", CYP: "CY", CZE: "CZ", DEN: "DK", DOM: "DO", ECU: "EC", EGY: "EG",
  ESA: "SV", ESP: "ES", EST: "EE", ETH: "ET", FIJ: "FJ", FIN: "FI", FRA: "FR", GAB: "GA",
  GBR: "GB", GEO: "GE", GER: "DE", GHA: "GH", GRE: "GR", GRN: "GD", GTM: "GT", GUA: "GT",
  GUD: "GP", GUM: "GU", HAI: "HT", HAW: "US", HKG: "HK", HON: "HN", HUN: "HU", INA: "ID",
  IND: "IN", IRI: "IR", IRL: "IE", IRQ: "IQ", ISL: "IS", ISR: "IL", ISV: "VI", ITA: "IT",
  JAM: "JM", JOR: "JO", JPN: "JP", KAZ: "KZ", KEN: "KE", KGZ: "KG", KOR: "KR", KSA: "SA",
  KUW: "KW", LAO: "LA", LAT: "LV", LBA: "LY", LBN: "LB", LBR: "LR", LCA: "LC", LES: "LS",
  LIB: "LY", LIE: "LI", LTU: "LT", LUX: "LU", MAD: "MG", MAR: "MA", MAS: "MY", MDA: "MD",
  MDG: "MG", MEX: "MX", MGL: "MN", MHL: "MH", MKD: "MK", MLI: "ML", MLT: "MT", MNE: "ME",
  MON: "MC", MOZ: "MZ", MRI: "MU", MTN: "MR", MYA: "MM", NAM: "NA", NCA: "NI", NED: "NL",
  NEP: "NP", NGR: "NG", NIC: "NI", NIG: "NE", NMI: "MP", NOR: "NO", NZL: "NZ", OMA: "OM",
  PAK: "PK", PAN: "PA", PAR: "PY", PER: "PE", PHI: "PH", PNG: "PG", POL: "PL", POR: "PT",
  PRY: "PY", PUR: "PR", QAT: "QA", REU: "RE", ROU: "RO", RSA: "ZA", RUS: "RU", RWA: "RW",
  SAM: "WS", SCG: "RS", SEN: "SN", SEY: "SC", SGP: "SG", SIN: "SG", SLE: "SL", SLO: "SI",
  SMR: "SM", SOL: "SB", SRI: "LK", SRB: "RS", SUD: "SD", SUI: "CH", SUR: "SR", SVK: "SK",
  SWE: "SE", SWZ: "SZ", SYR: "SY", TAN: "TZ", TGO: "TG", THA: "TH", TJK: "TJ", TKM: "TM",
  TKS: "TC", TOG: "TG", TPE: "TW", TRI: "TT", TTO: "TT", TUN: "TN", TUR: "TR", UAE: "AE",
  UGA: "UG", UKR: "UA", URU: "UY", USA: "US", UZB: "UZ", VAN: "VU", VEN: "VE", VIE: "VN",
  VIN: "VC", YEM: "YE", YUG: "RS", ZAM: "ZM", ZIM: "ZW"
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function CountryFlag({ country, className }: { country: string; className?: string }) {
  const code = country.trim().toUpperCase();
  const region = ATP_TO_REGION[code];
  if (!region) {
    return <span className={cn("text-[10px] font-semibold text-slate-400", className)} title={`Country code ${code}`}>{code || "n/a"}</span>;
  }

  const countryName = regionNames.of(region) ?? code;
  return (
    <Image
      src={`/assets/flags/${region.toLowerCase()}.png`}
      alt={`${countryName} flag`}
      title={`${countryName} (${code})`}
      width={20}
      height={15}
      className={cn("h-[15px] w-5 shrink-0 rounded-[2px] border border-slate-950/10 object-cover", className)}
      unoptimized
    />
  );
}
