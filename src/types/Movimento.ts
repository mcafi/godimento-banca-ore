export type Movimento = {
    CodGiustificativoUfficiale: string | number;
    Data: string;
    NumOre: number;
    NumMinuti?: number;
    GiornoDiRiposo: string
    GiornoChiusuraStraordinari: string
}