interface IAccountService {
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  printStatement: () => void;
}

export interface IConsole {
  print: (value: string) => void;
}

export interface IDate {
  getToday: () => Date;
}

interface Transaction {
  balance: number;
  amount: number;
  date: Date;
}
export class AccountService implements IAccountService {
  constructor(private readonly console: IConsole, private readonly date: IDate) {}

  private balance: number = 0;
  private transactionHistory: Transaction[] = [];

  deposit(amount: number) {
    this.balance += amount;

    const transaction: Transaction = {
      balance: this.balance,
      amount,
      date: this.date.getToday()
    };

    this.transactionHistory.push(transaction);
  }

  withdraw(amount: number) {
    if (amount > this.balance) return;
    this.deposit(-amount);
  }

  printStatement() {
    const header = ["Date || Amount || Balance"];

    const history = this.transactionHistory
      .sort((a, b) => {
        return b.date > a.date ? 1 : -1;
      })
      .map(t => `${this.getFormattedDate(t.date)} || ${t.amount} || ${t.balance}`);
    const linesToPrint = header.concat(history);

    this.console.print(linesToPrint.join("\n"));
  }

  private getFormattedDate(date: Date): string {
    return date
      .toLocaleDateString("en-GB")
      .split("/")
      .map(part => part.padStart(2, "0"))
      .join("/");
  }
}
