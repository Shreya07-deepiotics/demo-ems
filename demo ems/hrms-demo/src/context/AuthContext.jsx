import { createContext, useContext, useState } from 'react';
import { employees } from '../data/employees';

/**
 * Seed: convert existing employees into "approved" accounts
 * password defaults to "password123" for all demo users
 */
const seedAccounts = employees.map(e => ({
  id: e.id,
  name: e.name,
  email: e.email,
  password: 'password123',
  role: e.role,
  department: e.department,
  designation: e.designation,
  avatar: e.avatar,
  phone: e.phone,
  location: e.location,
  joinDate: e.joinDate,
  salary: e.salary,
  manager: e.manager,
  status: 'Active',
  accountStatus: 'approved', // approved | pending | rejected
  registeredAt: e.joinDate,
  approvedAt: e.joinDate,
}));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(seedAccounts);
  const [currentUser, setCurrentUser] = useState(null); // { account }

  /** Login — returns { success, message, account } */
  const login = (email, password) => {
    const acc = accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!acc) return { success: false, message: 'Invalid email or password.' };
    if (acc.accountStatus === 'pending')
      return { success: false, message: 'pending', account: acc };
    if (acc.accountStatus === 'rejected')
      return { success: false, message: 'Your registration was rejected by the admin. Contact HR for help.' };
    setCurrentUser(acc);
    return { success: true, account: acc };
  };

  /** Register — creates a pending account */
  const register = ({ name, email, password, role, department, designation, phone }) => {
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase()))
      return { success: false, message: 'An account with this email already exists.' };

    const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newAcc = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      department,
      designation,
      phone: phone || '',
      avatar: initials,
      location: '',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 0,
      manager: '',
      status: 'Active',
      accountStatus: 'pending',
      registeredAt: new Date().toISOString(),
      approvedAt: null,
      // 24-hour deadline
      approvalDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setAccounts(prev => [...prev, newAcc]);
    return { success: true, account: newAcc };
  };

  /** Admin approves a pending account */
  const approveAccount = (id) => {
    setAccounts(prev => prev.map(a =>
      a.id === id
        ? { ...a, accountStatus: 'approved', approvedAt: new Date().toISOString() }
        : a
    ));
  };

  /** Admin rejects a pending account */
  const rejectAccount = (id) => {
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, accountStatus: 'rejected' } : a
    ));
  };

  const logout = () => setCurrentUser(null);

  const pendingAccounts = accounts.filter(a => a.accountStatus === 'pending');

  return (
    <AuthContext.Provider value={{
      accounts, currentUser, login, register,
      approveAccount, rejectAccount, logout, pendingAccounts,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
