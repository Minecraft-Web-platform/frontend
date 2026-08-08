import React from 'react';

export interface IMinecraftItemOption {
  id: string; // Minecraft ID (for logic)
  name: string; // Display name
  type: 'ingot' | 'nugget' | 'coin';
  icon: React.ReactNode;
}

export interface IMinecraftEnchantOption {
  id: string; // Enchantment string (e.g. 'unbreaking:3')
  name: string; // Russian name
  category: 'none' | 'unbreaking' | 'protection' | 'respiration';
  icon: string;
}

export const MINECRAFT_CURRENCY_ITEMS: IMinecraftItemOption[] = [
  // --- Монеты Create Deco ---
  {
    id: 'createdeco:gold_coin',
    name: 'Золотая монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#EAB308" stroke="#9A3412" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#FACC15" stroke="#9A3412" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#FEF08A" stroke="#9A3412" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FEF08A" />
      </svg>
    ),
  },
  {
    id: 'createdeco:netherite_coin',
    name: 'Незеритовая монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#3F3F46" stroke="#18181B" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#27272A" stroke="#18181B" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#52525B" stroke="#18181B" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#71717A" />
      </svg>
    ),
  },
  {
    id: 'createdeco:brass_coin',
    name: 'Латунная монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#D97706" stroke="#78350F" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#FDE68A" stroke="#78350F" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FEF3C7" />
      </svg>
    ),
  },
  {
    id: 'createdeco:iron_coin',
    name: 'Железная монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#F8FAFC" stroke="#475569" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'createdeco:copper_coin',
    name: 'Медная монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#EA580C" stroke="#7C2D12" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#F97316" stroke="#7C2D12" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#FDBA74" stroke="#7C2D12" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FFEDD5" />
      </svg>
    ),
  },
  {
    id: 'createdeco:industrial_iron_coin',
    name: 'Монета из промышленного железа',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#475569" stroke="#1E293B" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#64748B" stroke="#1E293B" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#94A3B8" stroke="#1E293B" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#CBD5E1" />
      </svg>
    ),
  },
  {
    id: 'createdeco:zinc_coin',
    name: 'Цинковая монета',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#5EEAD4" stroke="#115E59" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#99F6E4" stroke="#115E59" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#CCFBF1" stroke="#115E59" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#ECFDF5" />
      </svg>
    ),
  },
];

export const MINECRAFT_ENCHANTMENTS: IMinecraftEnchantOption[] = [
  // --- Прочность (Unbreaking) I-V ---
  {
    id: 'unbreaking:1',
    name: 'Прочность I',
    category: 'unbreaking',
    icon: '✨',
  },
  {
    id: 'unbreaking:2',
    name: 'Прочность II',
    category: 'unbreaking',
    icon: '✨',
  },
  {
    id: 'unbreaking:3',
    name: 'Прочность III',
    category: 'unbreaking',
    icon: '✨',
  },
  {
    id: 'unbreaking:4',
    name: 'Прочность IV',
    category: 'unbreaking',
    icon: '✨',
  },
  {
    id: 'unbreaking:5',
    name: 'Прочность V',
    category: 'unbreaking',
    icon: '✨',
  },

  // --- Защита (Protection) I-V ---
  {
    id: 'protection:1',
    name: 'Защита I',
    category: 'protection',
    icon: '🛡️',
  },
  {
    id: 'protection:2',
    name: 'Защита II',
    category: 'protection',
    icon: '🛡️',
  },
  {
    id: 'protection:3',
    name: 'Защита III',
    category: 'protection',
    icon: '🛡️',
  },
  {
    id: 'protection:4',
    name: 'Защита IV',
    category: 'protection',
    icon: '🛡️',
  },
  {
    id: 'protection:5',
    name: 'Защита V',
    category: 'protection',
    icon: '🛡️',
  },

  // --- Подводное дыхание (Respiration) I-V ---
  {
    id: 'respiration:1',
    name: 'Подводное дыхание I',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:2',
    name: 'Подводное дыхание II',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:3',
    name: 'Подводное дыхание III',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:4',
    name: 'Подводное дыхание IV',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:5',
    name: 'Подводное дыхание V',
    category: 'respiration',
    icon: '🫧',
  },
];

export function getMinecraftItemInfo(id: string): IMinecraftItemOption | undefined {
  return MINECRAFT_CURRENCY_ITEMS.find((item) => item.id === id);
}

export function getMinecraftEnchantInfo(id: string): IMinecraftEnchantOption | undefined {
  return MINECRAFT_ENCHANTMENTS.find((ench) => ench.id === id);
}
