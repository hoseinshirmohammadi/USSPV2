import React from 'react';
import { useLayoutEffect } from 'react';
import { Card } from '../components/atoms/Card';
import { WALLET_SUMMARY_DATA, WALLET_TRANSACTIONS_DATA } from '../constants';
import { TransactionType } from '../types';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { ADD_ICON } from '../constants';
import { useLayout } from '../hooks/useLayout';

const WalletSidebarContent: React.FC = () => (
    <div>
        <h3 className="text-lg font-bold text-white mb-4">فیلتر تراکنش‌ها</h3>
        <div className="space-y-4">
            <div>
                <label className="form-label">نوع تراکنش</label>
                <select className="form-input">
                    <option>همه</option>
                    <option>واریز</option>
                    <option>برداشت</option>
                </select>
            </div>
            <div>
                <label className="form-label">بازه زمانی</label>
                 <select className="form-input">
                    <option>۷ روز اخیر</option>
                    <option>ماه اخیر</option>
                    <option>سال اخیر</option>
                </select>
            </div>
            <Button variant="secondary" className="w-full">اعمال فیلتر</Button>
        </div>
    </div>
);


const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
    <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-gray-400 mt-2">{subtitle}</p>
    </div>
    <Button icon={ADD_ICON}>افزایش اعتبار</Button>
  </div>
);

const TransactionRow: React.FC<{ tx: TransactionType }> = ({ tx }) => {
    const amountColor = tx.type === 'credit' ? 'text-green-400' : 'text-red-400';
    const amountSign = tx.type === 'credit' ? '+' : '-';
    return (
        <div className="flex justify-between items-center py-3 px-2 rounded-lg hover:bg-white/5">
            <div>
                <p className="font-medium text-white">{tx.description}</p>
                <p className="text-xs text-gray-500">{tx.date}</p>
            </div>
            <p className={`font-semibold ${amountColor}`}>{amountSign}{tx.amount} {WALLET_SUMMARY_DATA.currency}</p>
        </div>
    )
}

const Wallet: React.FC = () => {
  const { setSidebarContent } = useLayout();
  
  useLayoutEffect(() => {
    setSidebarContent(<WalletSidebarContent />);
    return () => setSidebarContent(null);
  }, [setSidebarContent]);


  return (
    <div className="page-container">
      <PageHeader title="کیف پول" subtitle="اعتبار خود را مدیریت کرده و تاریخچه تراکنش‌ها را مشاهده کنید." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 flex flex-col justify-center items-center text-center bg-primary/20">
              <p className="text-gray-300">موجودی فعلی</p>
              <p className="text-5xl font-bold text-white my-2">{WALLET_SUMMARY_DATA.balance.toLocaleString()}</p>
              <p className="text-primary font-semibold">{WALLET_SUMMARY_DATA.currency}</p>
              <p className="text-xs text-gray-500 mt-4">هزینه شده در این ماه: {WALLET_SUMMARY_DATA.spentThisMonth}</p>
          </Card>
          <Card className="md:col-span-2">
            <h3 className="font-bold text-white text-lg mb-4">آخرین تراکنش‌ها</h3>
            <div className="divide-y divide-white/10">
                {WALLET_TRANSACTIONS_DATA.map(tx => <TransactionRow key={tx.id} tx={tx}/>)}
            </div>
          </Card>
      </div>
    </div>
  );
};
export default Wallet;