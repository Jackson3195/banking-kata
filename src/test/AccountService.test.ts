import { AccountService, IConsole, IDate } from "../main/AccountService";
import { mock, MockProxy } from "jest-mock-extended";

describe("Given a client makes a deposit of 1000 on 10-01-2012", () => {
  let fakeConsole: IConsole;
  let fakeDate: MockProxy<IDate> & IDate;
  let service: AccountService;

  beforeEach(() => {
    fakeConsole = mock<IConsole>();
    fakeDate = mock<IDate>();
    service = new AccountService(fakeConsole, fakeDate);

    fakeDate.getToday.mockReturnValue(new Date(2012, 0, 10));
    service.deposit(1000);
  });

  describe("And a deposit of 2000 on 13-01-2012", () => {
    beforeEach(() => {
      fakeDate.getToday.mockReturnValue(new Date(2012, 0, 13));
      service.deposit(2000);
    });
    describe("And a withdrawl of 500 on 14-01-2012", () => {
      beforeEach(() => {
        fakeDate.getToday.mockReturnValue(new Date(2012, 0, 14));
        service.withdraw(500);
      });

      describe("When they print their bank statement", () => {
        beforeEach(() => {
          service.printStatement();
        });

        it("They would see", () => {
          const expectedValue = `Date || Amount || Balance
14/01/2012 || -500 || 2500
13/01/2012 || 2000 || 3000
10/01/2012 || 1000 || 1000`;

          expect(fakeConsole.print).toBeCalledWith(expectedValue);
        });
      });
    });
  });
});

describe("AccountService", () => {
  describe("printStatement", () => {
    let console: IConsole;
    let date: MockProxy<IDate> & IDate;
    let service: AccountService;

    beforeEach(() => {
      console = mock<IConsole>();
      date = mock<IDate>();
      service = new AccountService(console, date);

      date.getToday.mockReturnValue(new Date(2020, 0, 1));
    });
    it("should print the header", () => {
      service.printStatement();
      expect(console.print).toHaveBeenCalledWith("Date || Amount || Balance");
    });

    describe("Given a deposit of 1000 on 01-01-2020", () => {
      it("should print the header and the deposit", () => {
        service.deposit(1000);
        service.printStatement();
        expect(console.print).toHaveBeenCalledWith("Date || Amount || Balance\n01/01/2020 || 1000 || 1000");
      });
    });

    describe("Given two deposits of 1000 and 2000 on 01-01-2020", () => {
      it("should print the header and the two deposits", () => {
        service.deposit(1000);
        service.deposit(2000);
        service.printStatement();
        expect(console.print).toHaveBeenCalledWith(
          "Date || Amount || Balance\n01/01/2020 || 2000 || 3000\n01/01/2020 || 1000 || 1000"
        );
      });
    });

    describe("Given a withdrawl that would cause an overdraft on 01-01-2020", () => {
      it("should ignore the transaction", () => {
        service.withdraw(100);
        service.printStatement();
        expect(console.print).toHaveBeenCalledWith("Date || Amount || Balance");
      });
    });

    describe("Given a deposit of 1000 and a withdrawl of 100", () => {
      it("should print the right statement", () => {
        service.deposit(1000);
        service.withdraw(100);
        service.printStatement();
        expect(console.print).toHaveBeenCalledWith(
          "Date || Amount || Balance\n01/01/2020 || -100 || 900\n01/01/2020 || 1000 || 1000"
        );
      });
    });

    describe("Given transactions on different dates", () => {
      it("should print them with the most recent transaction at the top", () => {
        date.getToday.mockReturnValue(new Date(2020, 0, 1));
        service.deposit(1000);
        date.getToday.mockReturnValue(new Date(2021, 0, 1));
        service.deposit(2000);
        service.printStatement();
        expect(console.print).toHaveBeenCalledWith(
          "Date || Amount || Balance\n01/01/2021 || 2000 || 3000\n01/01/2020 || 1000 || 1000"
        );
      });
    });
  });
});
