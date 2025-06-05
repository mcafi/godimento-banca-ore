
export type UserConfig = {
    dateFormatInput: string;
    dateFormatOutput: string;
    useSameFormatAsInput: boolean;
    codeBancaOre: string;
    includeZeroDays: boolean;
    companies: Record<string, CompanySettings>;
    employers: Record<string, EmployerSettings>;
}

export type CompanySettings = {
    weeklyHours: number;
}

export type EmployerSettings = {
    weeklyHours: number;
}