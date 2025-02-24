
import QuickActions from "./bank-accounts/QuickActions";
import PendingTransactions from "./bank-accounts/PendingTransactions";
import AccountList from "./bank-accounts/AccountList";
import TransactionHistory from "./bank-accounts/TransactionHistory";

const BankAccounts = () => {
  return (
    <div className="grid gap-4">
      <QuickActions />
      <PendingTransactions />
      <AccountList />
      <TransactionHistory />
    </div>
  );
};

export default BankAccounts;
