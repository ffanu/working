'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cashRegistersApi } from '@/lib/api/cashRegisters';
import { CashRegister, CashTransaction, ShiftStatus } from '@/types/inventory';
import { 
  DollarSign, 
  Plus, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Receipt,
  Users,
  Building
} from 'lucide-react';

export default function CashRegisterPage() {
  const [registers, setRegisters] = useState<CashRegister[]>([]);
  const [currentRegister, setCurrentRegister] = useState<CashRegister | null>(null);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCashIn, setShowCashIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);

  // Form states
  const [shiftForm, setShiftForm] = useState({
    registerName: '',
    location: '',
    openingCash: 0
  });

  const [cashForm, setCashForm] = useState({
    amount: 0,
    description: '',
    notes: ''
  });

  const [closeForm, setCloseForm] = useState({
    closingCash: 0,
    notes: ''
  });

  useEffect(() => {
    loadRegisters();
  }, []);

  const loadRegisters = async () => {
    try {
      setLoading(true);
      const data = await cashRegistersApi.getAll();
      setRegisters(data);
      
      // Find open register for current user (assuming user ID 1 for demo)
      const openRegister = data.find((r: CashRegister) => r.status === 'Open');
      if (openRegister) {
        setCurrentRegister(openRegister);
        loadTransactions(openRegister.id || openRegister._id || '');
      }
    } catch (error) {
      console.error('Error loading registers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (registerId: string) => {
    try {
      const data = await cashRegistersApi.getTransactions(registerId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleOpenShift = async () => {
    try {
      const newRegister = await cashRegistersApi.openShift({
        ...shiftForm,
        userId: '1', // Demo user ID
        userName: 'Demo User'
      });
      
      setCurrentRegister(newRegister);
      setRegisters([...registers, newRegister]);
      setShowOpenShift(false);
      setShiftForm({ registerName: '', location: '', openingCash: 0 });
    } catch (error) {
      console.error('Error opening shift:', error);
    }
  };

  const handleCashIn = async () => {
    if (!currentRegister) return;
    
    try {
      const transaction = await cashRegistersApi.cashIn(currentRegister.id || currentRegister._id || '', {
        ...cashForm,
        userId: '1',
        userName: 'Demo User'
      });
      
      setTransactions([transaction, ...transactions]);
      setShowCashIn(false);
      setCashForm({ amount: 0, description: '', notes: '' });
      
      // Reload register to get updated balance
      loadRegisters();
    } catch (error) {
      console.error('Error processing cash in:', error);
    }
  };

  const handleCashOut = async () => {
    if (!currentRegister) return;
    
    try {
      const transaction = await cashRegistersApi.cashOut(currentRegister.id || currentRegister._id || '', {
        ...cashForm,
        userId: '1',
        userName: 'Demo User'
      });
      
      setTransactions([transaction, ...transactions]);
      setShowCashOut(false);
      setCashForm({ amount: 0, description: '', notes: '' });
      
      // Reload register to get updated balance
      loadRegisters();
    } catch (error) {
      console.error('Error processing cash out:', error);
    }
  };

  const handleCloseShift = async () => {
    if (!currentRegister) return;
    
    try {
      await cashRegistersApi.closeShift(currentRegister.id || currentRegister._id || '', {
        userId: '1',
        closingCash: closeForm.closingCash,
        notes: closeForm.notes
      });
      
      setCurrentRegister(null);
      setShowCloseShift(false);
      setCloseForm({ closingCash: 0, notes: '' });
      
      // Reload registers
      loadRegisters();
    } catch (error) {
      console.error('Error closing shift:', error);
    }
  };

  const getStatusColor = (status: ShiftStatus) => {
    switch (status) {
      case 'Open': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ShiftStatus) => {
    switch (status) {
      case 'Open': return <CheckCircle className="w-4 h-4" />;
      case 'Closed': return <X className="w-4 h-4" />;
      case 'Suspended': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading cash registers...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cash Register</h1>
            <p className="text-gray-600 mt-2">Manage cash register operations and shifts</p>
          </div>
          <div className="flex space-x-3">
            {!currentRegister && (
              <Button
                onClick={() => setShowOpenShift(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Open Shift</span>
              </Button>
            )}
            {currentRegister && (
              <>
                <Button
                  onClick={() => setShowCashIn(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Cash In</span>
                </Button>
                <Button
                  onClick={() => setShowCashOut(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Cash Out</span>
                </Button>
                <Button
                  onClick={() => setShowCloseShift(true)}
                  variant="destructive"
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close Shift</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Current Register Status */}
        {currentRegister && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Active Shift</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Register</p>
                  <p className="text-lg font-semibold">{currentRegister.registerName}</p>
                  <p className="text-sm text-gray-500">{currentRegister.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Cash</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${currentRegister.currentCash.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shift Duration</p>
                  <p className="text-lg font-semibold">
                    {Math.floor((Date.now() - new Date(currentRegister.shiftStartTime).getTime()) / (1000 * 60 * 60))}h
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${currentRegister.totalSales.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Register Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Registers</p>
                  <p className="text-2xl font-bold">{registers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Shifts</p>
                  <p className="text-2xl font-bold">
                    {registers.filter(r => r.status === 'Open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Suspended</p>
                  <p className="text-2xl font-bold">
                    {registers.filter(r => r.status === 'Suspended').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <X className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Closed Today</p>
                  <p className="text-2xl font-bold">
                    {registers.filter(r => r.status === 'Closed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        {currentRegister && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id || transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'CashIn' ? 'bg-green-100' : 
                          transaction.type === 'CashOut' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'CashIn' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                           transaction.type === 'CashOut' ? <TrendingDown className="w-4 h-4 text-red-600" /> :
                           <DollarSign className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.userName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'CashIn' ? 'text-green-600' : 
                          transaction.type === 'CashOut' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'CashIn' ? '+' : 
                           transaction.type === 'CashOut' ? '-' : ''}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transactionTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Registers */}
        <Card>
          <CardHeader>
            <CardTitle>All Registers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registers.map((register) => (
                <div key={register.id || register._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(register.status)}`}>
                      {getStatusIcon(register.status)}
                    </div>
                    <div>
                      <p className="font-semibold">{register.registerName}</p>
                      <p className="text-sm text-gray-500">{register.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Current Cash</p>
                      <p className="font-semibold">${register.currentCash.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Sales</p>
                      <p className="font-semibold text-blue-600">${register.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Transactions</p>
                      <p className="font-semibold">{register.totalTransactions}</p>
                    </div>
                    <Badge className={getStatusColor(register.status)}>
                      {register.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {/* Open Shift Modal */}
        {showOpenShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Open New Shift</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="registerName">Register Name</Label>
                  <Input
                    id="registerName"
                    value={shiftForm.registerName}
                    onChange={(e) => setShiftForm({...shiftForm, registerName: e.target.value})}
                    placeholder="e.g., Main Register"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={shiftForm.location}
                    onChange={(e) => setShiftForm({...shiftForm, location: e.target.value})}
                    placeholder="e.g., Front Desk"
                  />
                </div>
                <div>
                  <Label htmlFor="openingCash">Opening Cash</Label>
                  <Input
                    id="openingCash"
                    type="number"
                    value={shiftForm.openingCash}
                    onChange={(e) => setShiftForm({...shiftForm, openingCash: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleOpenShift} className="flex-1">Open Shift</Button>
                  <Button variant="outline" onClick={() => setShowOpenShift(false)} className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cash In Modal */}
        {showCashIn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Cash In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cashInAmount">Amount</Label>
                  <Input
                    id="cashInAmount"
                    type="number"
                    value={cashForm.amount}
                    onChange={(e) => setCashForm({...cashForm, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cashInDescription">Description</Label>
                  <Input
                    id="cashInDescription"
                    value={cashForm.description}
                    onChange={(e) => setCashForm({...cashForm, description: e.target.value})}
                    placeholder="e.g., Bank deposit"
                  />
                </div>
                <div>
                  <Label htmlFor="cashInNotes">Notes</Label>
                  <Textarea
                    id="cashInNotes"
                    value={cashForm.notes}
                    onChange={(e) => setCashForm({...cashForm, notes: e.target.value})}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCashIn} className="flex-1">Process Cash In</Button>
                  <Button variant="outline" onClick={() => setShowCashIn(false)} className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cash Out Modal */}
        {showCashOut && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Cash Out</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cashOutAmount">Amount</Label>
                  <Input
                    id="cashOutAmount"
                    type="number"
                    value={cashForm.amount}
                    onChange={(e) => setCashForm({...cashForm, amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cashOutDescription">Description</Label>
                  <Input
                    id="cashOutDescription"
                    value={cashForm.description}
                    onChange={(e) => setCashForm({...cashForm, description: e.target.value})}
                    placeholder="e.g., Petty cash"
                  />
                </div>
                <div>
                  <Label htmlFor="cashOutNotes">Notes</Label>
                  <Textarea
                    id="cashOutNotes"
                    value={cashForm.notes}
                    onChange={(e) => setCashForm({...cashForm, notes: e.target.value})}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCashOut} className="flex-1">Process Cash Out</Button>
                  <Button variant="outline" onClick={() => setShowCashOut(false)} className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Close Shift Modal */}
        {showCloseShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Close Shift</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="closingCash">Closing Cash Count</Label>
                  <Input
                    id="closingCash"
                    type="number"
                    value={closeForm.closingCash}
                    onChange={(e) => setCloseForm({...closeForm, closingCash: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="closingNotes">Closing Notes</Label>
                  <Textarea
                    id="closingNotes"
                    value={closeForm.notes}
                    onChange={(e) => setCloseForm({...closeForm, notes: e.target.value})}
                    placeholder="Any notes about the shift..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCloseShift} variant="destructive" className="flex-1">Close Shift</Button>
                  <Button variant="outline" onClick={() => setShowCloseShift(false)} className="flex-1">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
