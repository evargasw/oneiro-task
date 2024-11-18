type Options = {
    loanAmount: number;
    currency: string;
    baseRate: number;
    marginRate: number;
    startDate: string;
    endDate: string;
};

type ProcessedOptions = Omit<Options, 'startDate' | 'endDate'> & {
    startDate: Date;
    endDate: Date;
};

type TableData = {
    accrualDate: string;
    daysElapsed: number;
    dailyInterestNoMargin: number;
    dailyInterestTotal: number;
    totalInterestAccrued: number;
};

type Data = (Options & {
    tableData: TableData[];
})[];

export { Options, ProcessedOptions, TableData, Data };
