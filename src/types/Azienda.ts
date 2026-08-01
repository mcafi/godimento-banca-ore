export type DipendenteConfig = {
  nome: string;
  cognome: string;
  codiceFiscale: string;
  dataAssunzione: string;
  dataCessazione: string | null;
  oreSettimanali: number;
};

export type Azienda = {
  denominazione: string;
  dipendenti: Record<string, DipendenteConfig>;
};
