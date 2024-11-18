#!/usr/bin/env node

import { Command } from 'commander';
import { generateTable } from './generateTable';
import { clearMemory, readFromMemory, writeToMemory } from './memory';
import inquirer from 'inquirer';

const program = new Command();

program
    .name('loan-interest-calculator')
    .description('Loan Interest Calculator')
    .version('1.0.0');

program
    .command('calculate')
    .description('Calculate the loan interest')
    .action(async () => {
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'loanAmount',
                    message: 'Enter the loan amount:',
                    validate: (input) =>
                        (input && input > 0) ||
                        'Loan amount must be a positive number.',
                },
                {
                    type: 'input',
                    name: 'currency',
                    message: 'Enter the currency (e.g., USD, EUR):',
                    validate: (input) => {
                        const regex = /^[A-Z]{3}$/;
                        return (
                            regex.test(input) ||
                            'Currency must be a valid 3-letter ISO code.'
                        );
                    },
                },
                {
                    type: 'number',
                    name: 'baseRate',
                    message: 'Enter the annual interest rate (%):',
                    validate: (input) =>
                        (input && input > 0) ||
                        'Base rate must be a positive number.',
                },
                {
                    type: 'number',
                    name: 'marginRate',
                    message: 'Enter the margin rate (%):',
                    validate: (input) =>
                        (input && input > 0) ||
                        'Margin rate must be a positive number.',
                },
                {
                    type: 'input',
                    name: 'startDate',
                    message: 'Enter the start date (YYYY-MM-DD):',
                    validate: (input) => {
                        const date = new Date(input);
                        return (
                            !isNaN(date.getTime()) ||
                            'Start date must be a valid date in YYYY-MM-DD format.'
                        );
                    },
                },
                {
                    type: 'input',
                    name: 'endDate',
                    message: 'Enter the end date (YYYY-MM-DD):',
                    validate: (input) => {
                        const date = new Date(input);
                        return (
                            !isNaN(date.getTime()) ||
                            'End date must be a valid date in YYYY-MM-DD format.'
                        );
                    },
                },
            ]);

            generateTable(answers);
        } catch (err: any) {
            console.error('Error during calculation:', err.message);
        }
    });

program
    .command('memory:view')
    .description('View memory entries')
    .action(() => {
        try {
            const memory = readFromMemory();
            if (memory.length === 0) {
                console.log('No entries found.');
                return;
            }

            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'selectedEntry',
                        message: 'Select an entry to view',
                        choices: memory.map((entry, index) => ({
                            name: `Entry #${index + 1}: ${entry.loanAmount} ${entry.currency}`,
                            value: index,
                        })),
                    },
                ])
                .then((answer) => {
                    const selectedEntry = memory[answer.selectedEntry];

                    const tableDataFormatted = selectedEntry.tableData.map(
                        (row) => ({
                            'Accrual Date': row.accrualDate,
                            'Days Elapsed': row.daysElapsed,
                            'Daily Interest (No Margin)':
                                row.dailyInterestNoMargin.toFixed(2),
                            'Daily Interest (With Margin)':
                                row.dailyInterestTotal.toFixed(2),
                            'Total Interest Accrued':
                                row.totalInterestAccrued.toFixed(2),
                        }),
                    );

                    console.table(tableDataFormatted);
                });
        } catch (err: any) {
            console.error('Error reading memory:', err.message);
        }
    });

program
    .command('memory:update')
    .description('View memory entries')
    .action(async () => {
        try {
            const memory = readFromMemory();
            if (memory.length === 0) {
                console.log('No entries found.');
                return;
            }

            const { selectedEntry } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectedEntry',
                    message: 'Select an entry to view',
                    choices: memory.map((entry, index) => ({
                        name: `Entry #${index + 1}: ${entry.loanAmount} ${entry.currency}`,
                        value: index,
                    })),
                },
            ]);

            const entryToUpdate = memory[selectedEntry];

            const answers = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'loanAmount',
                    message: `Loan amount (${entryToUpdate.loanAmount}):`,
                    default: entryToUpdate.loanAmount,
                    validate: (input) =>
                        (input && input > 0) ||
                        'Loan amount must be a positive number.',
                },
                {
                    type: 'input',
                    name: 'currency',
                    message: `Currency (${entryToUpdate.currency}):`,
                    default: entryToUpdate.currency,
                    validate: (input) => {
                        const regex = /^[A-Z]{3}$/;
                        return (
                            regex.test(input) ||
                            'Currency must be a valid 3-letter ISO code.'
                        );
                    },
                },
                {
                    type: 'number',
                    name: 'baseRate',
                    message: `Base rate (${entryToUpdate.baseRate}):`,
                    default: entryToUpdate.baseRate,
                    validate: (input) =>
                        (input && input > 0) ||
                        'Base rate must be a positive number.',
                },
                {
                    type: 'number',
                    name: 'marginRate',
                    message: `Margin rate (${entryToUpdate.marginRate}):`,
                    default: entryToUpdate.marginRate,
                    validate: (input) =>
                        (input && input > 0) ||
                        'Margin rate must be a positive number.',
                },
                {
                    type: 'input',
                    name: 'startDate',
                    message: `Start date (${entryToUpdate.startDate}):`,
                    default: entryToUpdate.startDate,
                    validate: (input) => {
                        const date = new Date(input);
                        return (
                            !isNaN(date.getTime()) ||
                            'Start date must be a valid date in YYYY-MM-DD format.'
                        );
                    },
                },
                {
                    type: 'input',
                    name: 'endDate',
                    message: `End date (${entryToUpdate.endDate}):`,
                    default: entryToUpdate.endDate,
                    validate: (input) => {
                        const date = new Date(input);
                        return (
                            !isNaN(date.getTime()) ||
                            'End date must be a valid date in YYYY-MM-DD format.'
                        );
                    },
                },
            ]);

            memory[selectedEntry] = { ...entryToUpdate, ...answers };

            clearMemory();
            writeToMemory(memory);

            console.log('Entry updated successfully.');
        } catch (err: any) {
            console.error('Error reading memory:', err.message);
        }
    });

program
    .command('memory:clear')
    .description('Clear all memory entries')
    .action(() => {
        clearMemory();
        console.log('Memory cleared successfully.');
    });

program.parse(process.argv);
