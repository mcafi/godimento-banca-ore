export type Azienda = {
    denominazione: string;
    dipendenti: Record<string, {
        nome: string;
        cognome: string;
        codiceFiscale: string;
        dataAssunzione: string;
        dataCessazione: string | null;
    }>
}