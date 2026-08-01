import {
  addDays,
  addWeeks,
  differenceInMonths,
  differenceInWeeks,
  formatDate,
  getDay,
  getMonth,
  isBefore,
  parse,
  subDays,
} from "date-fns";
import { AppConfig } from "@/types/AppConfig";
import { CompanyConfig } from "@/types/CompanyConfig";
import { Dipendente } from "@/types/Dipendente";
import { Movimento } from "@/types/Movimento";
import { XmlFile } from "@/types/XmlFile";
import { getEmptyXml } from "@/utils/xmlUtils";

export type Periodo = {
  startDate: Date;
  endDate: Date;
};

export type BancaOreParams = {
  file: XmlFile;
  startDate: Date;
  endDate: Date;
  selectedCodes: Set<string | number>;
  config: AppConfig;
  companyConfig: CompanyConfig;
};

export function collectFileCodes(dipendenti: Dipendente[]): Set<string | number> {
  const codes = new Set<string | number>();
  for (const dipendente of dipendenti) {
    for (const movimento of dipendente.Movimenti.Movimento ?? []) {
      codes.add(movimento.CodGiustificativoUfficiale);
    }
  }
  return codes;
}

/**
 * Deriva il periodo di calcolo dal primo movimento del file:
 * inizio = lunedì della settimana del primo movimento,
 * fine = settimana successiva alla fine del mese del primo movimento.
 */
export function derivePeriod(dipendenti: Dipendente[], dateFormat: string): Periodo | null {
  let actualStartDate: Date | null = null;

  for (const dipendente of dipendenti) {
    const movimenti = dipendente.Movimenti.Movimento ?? [];
    if (movimenti.length === 0) continue;

    const date = parse(movimenti[0].Data, dateFormat, new Date());
    if (!actualStartDate || isBefore(date, actualStartDate)) {
      actualStartDate = date;
    }
  }

  if (!actualStartDate) return null;

  const mondayStartDate = subDays(actualStartDate, getDay(actualStartDate) - 1);
  let endDate = mondayStartDate;

  while (
    getMonth(endDate) === getMonth(mondayStartDate) ||
    differenceInMonths(endDate, actualStartDate) < 1
  ) {
    endDate = addWeeks(endDate, 1);
  }

  return { startDate: mondayStartDate, endDate };
}

export function buildBancaOreFile({
  file,
  startDate,
  endDate,
  selectedCodes,
  config,
  companyConfig,
}: BancaOreParams): XmlFile {
  const newFile = getEmptyXml();

  for (const dipendente of file.Fornitura.Dipendente) {
    const movimenti = buildMovimenti(
      dipendente,
      startDate,
      endDate,
      selectedCodes,
      config,
      companyConfig,
    );

    if (movimenti.length === 0) continue;

    newFile.Fornitura.Dipendente.push({
      Movimenti: {
        "@_GenerazioneAutomaticaDaTeorico": "N",
        Movimento: movimenti,
      },
      "@_CodAziendaUfficiale": `${dipendente["@_CodAziendaUfficiale"]}`,
      "@_CodDipendenteUfficiale": `${dipendente["@_CodDipendenteUfficiale"]}`,
    });
  }

  return newFile;
}

function buildMovimenti(
  dipendente: Dipendente,
  startDate: Date,
  endDate: Date,
  selectedCodes: Set<string | number>,
  config: AppConfig,
  companyConfig: CompanyConfig,
): Movimento[] {
  const codAziendaUfficiale = dipendente["@_CodAziendaUfficiale"];
  const codDipendenteUfficiale = dipendente["@_CodDipendenteUfficiale"];
  const dipendenteConfig = companyConfig[codAziendaUfficiale]?.dipendenti[codDipendenteUfficiale];

  const hiringDate = parse(
    dipendenteConfig?.dataAssunzione ?? "01/01/2000",
    "dd/MM/yyyy",
    new Date(),
  );
  const terminationDate = dipendenteConfig?.dataCessazione
    ? parse(dipendenteConfig.dataCessazione, "dd/MM/yyyy", new Date())
    : null;

  const weeklyMinutes = (dipendenteConfig?.oreSettimanali ?? config.defaultWeeklyHours) * 60;
  const movimenti = dipendente.Movimenti.Movimento;

  if (!movimenti || movimenti.length === 0) return [];

  const weeksCount = differenceInWeeks(endDate, startDate);
  if (weeksCount <= 0) return [];

  // Minuti accumulati per settimana e giorno (getDay: 0 = domenica)
  const weekMinutes = Array.from({ length: weeksCount }, () => new Array<number>(7).fill(0));

  for (const movimento of movimenti) {
    const date = parse(movimento.Data, config.dateFormatInput, new Date());

    if (isBefore(date, hiringDate)) continue;
    if (terminationDate && !isBefore(date, terminationDate)) continue;

    const weekIndex = differenceInWeeks(date, startDate);
    if (weekIndex < 0 || weekIndex >= weeksCount) continue;

    if (!selectedCodes.has(movimento.CodGiustificativoUfficiale)) continue;

    weekMinutes[weekIndex][getDay(date)] += movimento.NumOre * 60 + (movimento.NumMinuti ?? 0);
  }

  const newMovimenti: Movimento[] = [];

  for (let weekIndex = 0; weekIndex < weeksCount; weekIndex++) {
    const week = weekMinutes[weekIndex];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = addDays(startDate, weekIndex * 7 + dayOffset - 1);

      if (isBefore(currentDate, hiringDate)) continue;
      if (terminationDate && !isBefore(currentDate, terminationDate)) continue;

      const dayIndex = dayOffset === 6 ? 0 : dayOffset + 1;

      const reminder = weeklyMinutes - week.reduce((acc, minutes) => acc + minutes, 0);
      const dailyHours = weeklyMinutes / 5;

      const minutesToAdd =
        reminder <= 0
          ? 0
          : Math.min(Math.max(dailyHours - week[dayIndex], 0), Math.max(reminder, 0));

      week[dayIndex] += minutesToAdd;

      if (!config.includeZeroDays && minutesToAdd <= 0) continue;

      const hours = Math.floor(minutesToAdd / 60);
      const minutes = minutesToAdd % 60;

      const newMovimento: Movimento = {
        CodGiustificativoUfficiale: config.codeBancaOre,
        Data: formatDate(addDays(currentDate, 1), config.dateFormatOutput),
        NumOre: hours,
        GiornoDiRiposo: "N",
        GiornoChiusuraStraordinari: "N",
      };

      if (minutes > 0) {
        newMovimento.NumMinuti = minutes;
      }

      newMovimenti.push(newMovimento);
    }
  }

  return newMovimenti;
}
