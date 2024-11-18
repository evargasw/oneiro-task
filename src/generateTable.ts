import { readFromMemory, writeToMemory } from './memory.js';
import { Options, ProcessedOptions, TableData } from './types.js';

const generateTable = (options: Options): void => {
    const { loanAmount, currency, baseRate, marginRate, startDate, endDate } =
        options;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        console.error('End Date must be after Start Date.');
        process.exit(1);
    }

    const dailyInterestWithoutMargin = (loanAmount * (baseRate / 100)) / 365;
    const totalDailyInterest =
        (loanAmount * ((baseRate + marginRate) / 100)) / 365;

    const daysElapsed =
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const tableData: TableData[] = [];

    for (let i = 0; i < daysElapsed; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        const elapsedDays = i + 1;
        const totalInterestAccrued = totalDailyInterest * elapsedDays;

        tableData.push({
            accrualDate: currentDate.toISOString().split('T')[0],
            daysElapsed: elapsedDays,
            dailyInterestNoMargin: dailyInterestWithoutMargin,
            dailyInterestTotal: totalDailyInterest,
            totalInterestAccrued: totalInterestAccrued,
        });
    }

    const tableDataFormatted = tableData.map((row) => ({
        'Accrual Date': row.accrualDate,
        'Days Elapsed': row.daysElapsed,
        'Daily Interest (No Margin)': row.dailyInterestNoMargin.toFixed(2),
        'Daily Interest (With Margin)': row.dailyInterestTotal.toFixed(2),
        'Total Interest Accrued': row.totalInterestAccrued.toFixed(2),
    }));

    console.table(tableDataFormatted);

    const pastCalculations = readFromMemory();
    pastCalculations.push({
        loanAmount,
        currency,
        baseRate,
        marginRate,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        tableData,
    });
    writeToMemory(pastCalculations);
};

export { generateTable };
