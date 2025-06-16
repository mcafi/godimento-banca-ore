export type Azienda = {
    denominazione: string;
    dipendenti: Record<number, {
        nome: string;
        cognome: string;
        codiceFiscale: string;
        dataAssunzione: string;
        dataCessazione: string | null;
    }>
}