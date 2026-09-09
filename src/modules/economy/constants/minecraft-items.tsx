import React from 'react';
import i18n from '../../../i18n/i18n';

export interface IMinecraftItemOption {
  id: string; // Minecraft ID (for logic)
  name: string; // Display name
  type: 'ingot' | 'nugget' | 'coin';
  icon: React.ReactNode;
}

export interface IMinecraftEnchantOption {
  id: string; // Enchantment string (e.g. 'unbreaking:3')
  name: string; // Enchantment name
  category: 'none' | 'unbreaking' | 'protection' | 'respiration';
  icon: string;
}

export const MINECRAFT_CURRENCY_ITEMS: IMinecraftItemOption[] = [
  // --- Create Deco Coins ---
  {
    id: 'createdeco:gold_coin',
    name: 'Gold Coin',
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
    name: 'Netherite Coin',
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
    name: 'Brass Coin',
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
    name: 'Iron Coin',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#F1F5F9" stroke="#475569" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'createdeco:copper_coin',
    name: 'Copper Coin',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#EA580C" stroke="#7C2D12" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#F97316" stroke="#7C2D12" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#FED7AA" stroke="#7C2D12" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FFEDD5" />
      </svg>
    ),
  },
  {
    id: 'createdeco:industrial_iron_coin',
    name: 'Industrial Iron Coin',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#94A3B8" stroke="#1E293B" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#CBD5E1" stroke="#1E293B" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#E2E8F0" />
      </svg>
    ),
  },
  {
    id: 'createdeco:zinc_coin',
    name: 'Zinc Coin',
    type: 'coin',
    icon: (
      <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="6.5" fill="#A1A1AA" stroke="#3F3F46" strokeWidth="1" />
        <circle cx="8" cy="8" r="4.5" fill="#D4D4D8" stroke="#3F3F46" strokeWidth="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" fill="#F4F4F5" stroke="#3F3F46" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="0.8" fill="#FFFFFF" />
      </svg>
    ),
  },
  // --- Standard Ingot/Item equivalents ---
  {
    id: 'minecraft:diamond',
    name: 'Diamond',
    type: 'ingot',
    icon: <img src="/png/diamond.webp" alt="Diamond" style={{ width: '1em', height: '1em', objectFit: 'contain', imageRendering: 'pixelated' }} />,
  },
  {
    id: 'minecraft:gold_ingot',
    name: 'Gold Ingot',
    type: 'ingot',
    icon: <img src="/png/gold_ingot.webp" alt="Gold Ingot" style={{ width: '1em', height: '1em', objectFit: 'contain', imageRendering: 'pixelated' }} />,
  },
  {
    id: 'minecraft:netherite_ingot',
    name: 'Netherite Ingot',
    type: 'ingot',
    icon: <img src="/png/netherite_ingot.webp" alt="Netherite Ingot" style={{ width: '1em', height: '1em', objectFit: 'contain', imageRendering: 'pixelated' }} />,
  },
  {
    id: 'minecraft:netherite_block',
    name: 'Netherite Block',
    type: 'ingot',
    icon: <img src="/png/netherite_block.webp" alt="Netherite Block" style={{ width: '1em', height: '1em', objectFit: 'contain', imageRendering: 'pixelated' }} />,
  },
];

export const MINECRAFT_ENCHANTMENTS: IMinecraftEnchantOption[] = [
  // --- Unbreaking I-V ---
  {
    id: 'unbreaking:1',
    name: 'Unbreaking I',
    category: 'unbreaking',
    icon: '🛡️',
  },
  {
    id: 'unbreaking:2',
    name: 'Unbreaking II',
    category: 'unbreaking',
    icon: '🛡️',
  },
  {
    id: 'unbreaking:3',
    name: 'Unbreaking III',
    category: 'unbreaking',
    icon: '🛡️',
  },
  {
    id: 'unbreaking:4',
    name: 'Unbreaking IV',
    category: 'unbreaking',
    icon: '🛡️',
  },
  {
    id: 'unbreaking:5',
    name: 'Unbreaking V',
    category: 'unbreaking',
    icon: '🛡️',
  },
  // --- Protection I-V ---
  {
    id: 'protection:1',
    name: 'Protection I',
    category: 'protection',
    icon: '✨',
  },
  {
    id: 'protection:2',
    name: 'Protection II',
    category: 'protection',
    icon: '✨',
  },
  {
    id: 'protection:3',
    name: 'Protection III',
    category: 'protection',
    icon: '✨',
  },
  {
    id: 'protection:4',
    name: 'Protection IV',
    category: 'protection',
    icon: '✨',
  },
  {
    id: 'protection:5',
    name: 'Protection V',
    category: 'protection',
    icon: '✨',
  },
  // --- Respiration I-V ---
  {
    id: 'respiration:1',
    name: 'Respiration I',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:2',
    name: 'Respiration II',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:3',
    name: 'Respiration III',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:4',
    name: 'Respiration IV',
    category: 'respiration',
    icon: '🫧',
  },
  {
    id: 'respiration:5',
    name: 'Respiration V',
    category: 'respiration',
    icon: '🫧',
  },
];

export function getMinecraftItemInfo(id: string): IMinecraftItemOption | undefined {
  const item = MINECRAFT_CURRENCY_ITEMS.find((item) => item.id === id);
  if (!item) return undefined;
  return {
    ...item,
    name: i18n.t(`economy:minecraftItems.${item.id}`, { defaultValue: item.name }),
  };
}

export function getMinecraftEnchantInfo(id: string): IMinecraftEnchantOption | undefined {
  const ench = MINECRAFT_ENCHANTMENTS.find((ench) => ench.id === id);
  if (!ench) return undefined;
  return {
    ...ench,
    name: i18n.t(`economy:minecraftEnchants.${ench.id}`, { defaultValue: ench.name }),
  };
}
