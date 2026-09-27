import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MINECRAFT_CURRENCY_ITEMS,
  MINECRAFT_ENCHANTMENTS,
  getMinecraftItemInfo,
  getMinecraftEnchantInfo,
} from '../constants/minecraft-items';

interface MinecraftItemDropdownProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  required?: boolean;
  filterType?: 'coin' | 'ingot';
}

export const MinecraftItemDropdown: React.FC<MinecraftItemDropdownProps> = ({
  value,
  onChange,
  label,
  required,
  filterType,
}) => {
  const { t } = useTranslation('economy');
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(
    () => Boolean(value) && !getMinecraftItemInfo(value),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = getMinecraftItemInfo(value);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const handleCustomModeToggle = () => {
    setIsCustomMode(true);
    setIsOpen(false);
  };

  const handleBackToList = () => {
    setIsCustomMode(false);
    onChange('createdeco:gold_coin');
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', marginBottom: '16px' }}
    >
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label} {required && <span style={{ color: 'var(--danger, #e11d48)' }}>*</span>}
        </label>
      )}

      {isCustomMode ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="minecraft:emerald, custom:coin_1..."
            required={required}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
            }}
          />
          <button
            type="button"
            onClick={handleBackToList}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'var(--accent-diamond, #3b82f6)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {t('minecraftSelector.backToList')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--text-primary)',
            fontSize: '14px',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {currentInfo ? currentInfo.icon : '📦'}
            </span>
            <span style={{ fontWeight: 600 }}>
              {currentInfo ? currentInfo.name : value || t('minecraftSelector.selectItem')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {value && (
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {value}
              </span>
            )}
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          </div>
        </button>
      )}

      {isOpen && !isCustomMode && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--input-border)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '6px' }}>
            {MINECRAFT_CURRENCY_ITEMS.filter((item) => !filterType || item.type === filterType).map((item) => {
              const isSelected = item.id === value;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--accent-diamond, #1d4ed8)' : 'var(--text-primary)',
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-hover)',
                      color: isSelected ? 'var(--accent-diamond, #1e40af)' : 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {item.id}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            <button
              type="button"
              onClick={handleCustomModeToggle}
              style={{
                width: '100%',
                padding: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--accent-diamond, #3b82f6)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {t('minecraftSelector.customItemId')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MinecraftEnchantDropdownProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}

export const MinecraftEnchantDropdown: React.FC<
  MinecraftEnchantDropdownProps
> = ({ value, onChange, label }) => {
  const { t } = useTranslation('economy');
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(
    () => Boolean(value) && !getMinecraftEnchantInfo(value),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentInfo = getMinecraftEnchantInfo(value);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      {label && (
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}

      {isCustomMode ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="efficiency:5"
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid var(--input-border)',
              borderRadius: '8px',
              backgroundColor: 'var(--input-bg)',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              if (!getMinecraftEnchantInfo(value)) {
                onChange(MINECRAFT_ENCHANTMENTS[0].id);
              }
            }}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'var(--accent-diamond, #3b82f6)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {t('minecraftSelector.backToList')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--text-primary)',
            fontSize: '14px',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>
              {currentInfo ? currentInfo.icon : '✨'}
            </span>
            <span style={{ fontWeight: 600 }}>
              {currentInfo
                ? currentInfo.name
                : value || t('minecraftSelector.selectEnchant')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {value ? (
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {value}
              </span>
            ) : null}
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          </div>
        </button>
      )}

      {isOpen && !isCustomMode && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
          }}
        >
          <div style={{ padding: '6px' }}>
            {MINECRAFT_ENCHANTMENTS.map((ench) => {
              const isSelected = value === ench.id;
              return (
                <div
                  key={ench.id || 'none'}
                  onClick={() => {
                    onChange(ench.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-active)' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{ench.icon}</span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--accent-diamond, #1d4ed8)' : 'var(--text-primary)',
                      }}
                    >
                      {ench.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      backgroundColor: isSelected ? 'var(--bg-active)' : 'var(--bg-hover)',
                      color: isSelected ? 'var(--accent-diamond, #1e40af)' : 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {ench.id || '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-muted)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--accent-diamond, #3b82f6)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {t('minecraftSelector.customEnchant')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
