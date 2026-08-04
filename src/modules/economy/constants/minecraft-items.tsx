import React from 'react';

export interface IMinecraftItemOption {
  id: string; // Minecraft ID (for logic)
  name: string; // Display name
  type: 'ingot' | 'nugget';
  icon: React.ReactNode;
}

export interface IMinecraftEnchantOption {
  id: string; // Enchantment string (e.g. 'unbreaking:3')
  name: string; // Russian name
  category: 'none' | 'unbreaking' | 'protection';
  icon: string;
}

export const MINECRAFT_CURRENCY_ITEMS: IMinecraftItemOption[] = [
  {
    id: 'minecraft:gold_ingot',
    name: 'Золотой слиток',
    type: 'ingot',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H11L13 5H5L3 8Z" fill="#FEF08A" stroke="#713F12" strokeWidth="0.8" />
        <rect x="3" y="8" width="8" height="5" fill="#FACC15" stroke="#713F12" strokeWidth="0.8" />
        <path d="M11 8L13 5V10L11 13V8Z" fill="#CA8A04" stroke="#713F12" strokeWidth="0.8" />
        <rect x="4" y="9" width="3" height="1" fill="#FEF08A" />
      </svg>
    ),
  },
  {
    id: 'minecraft:iron_ingot',
    name: 'Железный слиток',
    type: 'ingot',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H11L13 5H5L3 8Z" fill="#F8FAFC" stroke="#334155" strokeWidth="0.8" />
        <rect x="3" y="8" width="8" height="5" fill="#E2E8F0" stroke="#334155" strokeWidth="0.8" />
        <path d="M11 8L13 5V10L11 13V8Z" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <rect x="4" y="9" width="3" height="1" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'minecraft:copper_ingot',
    name: 'Медный слиток',
    type: 'ingot',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H11L13 5H5L3 8Z" fill="#FDBA74" stroke="#7C2D12" strokeWidth="0.8" />
        <rect x="3" y="8" width="8" height="5" fill="#F97316" stroke="#7C2D12" strokeWidth="0.8" />
        <path d="M11 8L13 5V10L11 13V8Z" fill="#C2410C" stroke="#7C2D12" strokeWidth="0.8" />
        <rect x="4" y="9" width="3" height="1" fill="#FFEDD5" />
      </svg>
    ),
  },
  {
    id: 'minecraft:gold_nugget',
    name: 'Кусочек золота',
    type: 'nugget',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="9" r="2.5" fill="#FACC15" stroke="#713F12" strokeWidth="0.8" />
        <circle cx="10" cy="6" r="2" fill="#EAB308" stroke="#713F12" strokeWidth="0.8" />
        <circle cx="11" cy="11" r="2" fill="#CA8A04" stroke="#713F12" strokeWidth="0.8" />
        <circle cx="5.5" cy="8.5" r="0.8" fill="#FEF08A" />
      </svg>
    ),
  },
  {
    id: 'minecraft:iron_nugget',
    name: 'Кусочек железа',
    type: 'nugget',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="9" r="2.5" fill="#E2E8F0" stroke="#334155" strokeWidth="0.8" />
        <circle cx="10" cy="6" r="2" fill="#CBD5E1" stroke="#334155" strokeWidth="0.8" />
        <circle cx="11" cy="11" r="2" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <circle cx="5.5" cy="8.5" r="0.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'minecraft:copper_nugget',
    name: 'Кусочек меди',
    type: 'nugget',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="9" r="2.5" fill="#F97316" stroke="#7C2D12" strokeWidth="0.8" />
        <circle cx="10" cy="6" r="2" fill="#EA580C" stroke="#7C2D12" strokeWidth="0.8" />
        <circle cx="11" cy="11" r="2" fill="#C2410C" stroke="#7C2D12" strokeWidth="0.8" />
        <circle cx="5.5" cy="8.5" r="0.8" fill="#FFEDD5" />
      </svg>
    ),
  },
];

export const MINECRAFT_ENCHANTMENTS: IMinecraftEnchantOption[] = [
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
];

export function getMinecraftItemInfo(id: string): IMinecraftItemOption | undefined {
  return MINECRAFT_CURRENCY_ITEMS.find((item) => item.id === id);
}

export function getMinecraftEnchantInfo(id: string): IMinecraftEnchantOption | undefined {
  return MINECRAFT_ENCHANTMENTS.find((ench) => ench.id === id);
}
