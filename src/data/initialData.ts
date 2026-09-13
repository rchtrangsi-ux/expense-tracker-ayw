import { AccountInfo, CategoryBudget, CategoryInfo, SavingsGoal, Transaction } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหาร & เครื่องดื่ม', icon: 'restaurant', defaultType: 'expense', color: '#a78bfa' },
  { id: 'commute', name: 'การเดินทาง', icon: 'directions_subway', defaultType: 'expense', color: '#fbbf24' },
  { id: 'shopping', name: 'ช้อปปิ้ง & ไลฟ์สไตล์', icon: 'shopping_bag', defaultType: 'expense', color: '#f472b6' },
  { id: 'utilities', name: 'ที่พัก & ค่าน้ำไฟ', icon: 'bolt', defaultType: 'expense', color: '#38bdf8' },
  { id: 'salary', name: 'เงินเดือนหลัก', icon: 'payments', defaultType: 'income', color: '#34d399' },
  { id: 'freelance', name: 'รายรับเสริม / ฟรีแลนซ์', icon: 'laptop_mac', defaultType: 'income', color: '#34d399' },
  { id: 'invest', name: 'ลงทุน & ดอกเบี้ย', icon: 'show_chart', defaultType: 'income', color: '#60a5fa' },
  { id: 'other', name: 'อื่นๆ ทั่วไป', icon: 'more_horiz', defaultType: 'expense', color: '#71717a' },
];

export const ACCOUNTS: AccountInfo[] = [
  { id: 'scb', name: 'SCB ออมทรัพย์ดิจิทัล', subname: 'SCB ••4820 (หลัก)', type: 'savings', balance: 0.00, icon: 'savings' },
  { id: 'ktc', name: 'บัตรเครดิต KTC', subname: 'KTC Visa ••9912', type: 'credit', balance: 0.00, icon: 'credit_card' },
  { id: 'kbank', name: 'KBank เงินฝาก', subname: 'KBank ••1904', type: 'savings', balance: 0.00, icon: 'account_balance' },
  { id: 'cash', name: 'เงินสด', subname: 'กระเป๋าตังค์', type: 'cash', balance: 0.00, icon: 'wallet' },
  { id: 'innovestx', name: 'พอร์ต InnovestX', subname: 'DCA กองทุนรวม', type: 'investment', balance: 0.00, icon: 'pie_chart' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: CategoryBudget[] = [
  {
    categoryId: 'food',
    name: 'ค่าอาหาร',
    icon: 'restaurant',
    allocated: 0,
    spent: 0,
    alertThreshold: 0.85,
    notes: 'ยังไม่มีการตั้งงบประมาณ (฿0.00)',
  },
  {
    categoryId: 'shopping',
    name: 'ช้อปปิ้ง & บันเทิง',
    icon: 'shopping_bag',
    allocated: 0,
    spent: 0,
    alertThreshold: 0.90,
    notes: 'ยังไม่มีการตั้งงบประมาณ (฿0.00)',
  },
  {
    categoryId: 'commute',
    name: 'เดินทาง / น้ำมัน',
    icon: 'directions_car',
    allocated: 0,
    spent: 0,
    alertThreshold: 0.80,
    notes: 'ยังไม่มีการตั้งงบประมาณ (฿0.00)',
  },
  {
    categoryId: 'utilities',
    name: 'ค่าที่พัก / สาธารณูปโภค',
    icon: 'apartment',
    allocated: 0,
    spent: 0,
    alertThreshold: 0.98,
    isFixed: true,
    notes: 'ยังไม่มีการตั้งงบประมาณ (฿0.00)',
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'กองทุนสำรองฉุกเฉิน',
    category: 'ความมั่นคง',
    currentAmount: 0,
    targetAmount: 200000,
    priority: 'highest',
    priorityLabel: 'ความสำคัญสูงสุด',
    description: 'สำรอง 6 เดือนสำหรับค่าใช้จ่ายจำเป็น',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOOc-NMWbTc_ymfmOHSp_aCJQODjm49qrnijQiIgPuKkjoXkABgBtMGkg1uxg9el4boh9ozd_jYadTunyfy-L-vKit1XbDUhcHb8HBSGekf4f1ReyKLkXiMQoy1L7Na8u57QwRA_koAezubbFIosIlCug-x9m41efvENd2gmhXVSV0SD-6UrR99uujV4N6HLuo173UGCczAayOWaTB-RqvL1G9Jb7UoJmDD-siogIr_tMSUOac3yfu',
    imageAlt: 'Titanium vault with emerald neon indicator',
  },
  {
    id: 'goal-2',
    name: 'ทริปท่องเที่ยวญี่ปุ่น',
    category: 'ท่องเที่ยว',
    currentAmount: 0,
    targetAmount: 50000,
    targetDate: 'พ.ย. 2568',
    priority: 'high',
    priorityLabel: 'พ.ย. 2568',
    description: 'โตเกียว & เกียวโต 7 วันช่วงใบไม้เปลี่ยนสี',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQWoZ1a1QjewzD50p4zhoYRj8Ruq8XFwTHzsqece9ttk14Fh99CfqyVCB1xIRsjLTCVfykmvQTx66vdZsXdT-d9Qh-NJL4nk2ccQmm8BBBUmkspCo9lehwZcIsWwfBkkPmW8RHywCncHEGFpotCBZN5f0CXqeLKRfCuA4nsU8VVnYEKE32FPrmHcan7I2qf1ywuioytz8O9-QJipMCfomuwjtCedw2eXBt4_JebRoeLl5WMHI3_Acm',
    imageAlt: 'Tokyo city twilight view with Mount Fuji',
  },
  {
    id: 'goal-3',
    name: 'ซื้อ Gadget / อุปกรณ์ทำงาน',
    category: 'อุปกรณ์',
    currentAmount: 0,
    targetAmount: 25000,
    priority: 'pleasure',
    priorityLabel: 'ตามความพึงพอใจ',
    description: 'จอ Monitor 4K และเก้าอี้ Ergonomic',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYH-TNcmXM4xratfN7aY9_2WqKjyzzLtK9j9RoILb8j-rsTU97fJmjumxLNODW8grsaPAhw71ik7l480mitybQN9I4nWj4DCC1a20xWkzh46ufhQi411WdUYuvMh7q8zglcC6zttE18ztocASddcx9BBn1238NLDdDods2MaJSzUk5PaY-CMP2XAtIhv2JNjgJ1O0Rz7pSbiffb10uAH9TEdEhHXXLDPvilmvPB-2nI6HAdfpsCfSp',
    imageAlt: 'Minimalist developer desk workstation',
  },
];

export const APP_LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1VkUfl8ZasVh4VScPbIuasJBiXc8hipEh4IlQB9AsGE41MYdFTlodlg1FkUnnjg3MGYNWdjYvl_yMhPmBg1I_t3PKrzh-9azwqhzUaavHmH3t1p1ha2WrhBiKid_2T7J4QbozUZn0ekYk-lSjQiXusohgT_eOqPWZD5TYCzy3RRdiCJYxNc3-Lcp2mMkt7hnhlV8GwTe67LT9SEmvGoAkyQPQE3q9WJnkVLFsAnJ5DyO6IDKCFEOYPthME';
