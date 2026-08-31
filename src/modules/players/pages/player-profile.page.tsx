import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useSWR from "swr";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { playersService } from "../services/players.service";
import { achievementsService } from "../../achievements/services/achievements.service";
import { economyService } from "../../economy/services/economy.service";
import { mainAxios } from "../../../shared/services/main-axios";
import { PlayerType } from "../types/player.type";
import PlayerPassportComponent from "../components/player-passport.component";
import BusinessCertificateComponent from "../components/business-certificate.component";
import MoonLoader from "react-spinners/MoonLoader";
import "./player-profile.page.scss";
import { IUserAchievement } from "../../achievements/types/achievements.types";
import { ICompany } from "../../economy/types/economy.types";
import useAuthStore from "../../../store/auth.store";

const generateGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = Math.abs((hash + 40) % 360);
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 80%), hsl(${hue2}, 70%, 70%))`;
};

const normalizeDate = (dateToNormalize: string): string => {
  const date = new Date(dateToNormalize);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
};

const PlayerProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<"info" | "achievements" | "companies" | "documents">("info");
  const [player, setPlayer] = useState<PlayerType | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedRarities, setSelectedRarities] = useState<string[]>(['legendary', 'epic', 'rare', 'common']);
  const [sortOrder, setSortOrder] = useState<"rarityDesc" | "rarityAsc">("rarityDesc");
  const [modalState, setModalState] = useState<"none" | "ban" | "unban">("none");
  const [banReasonInput, setBanReasonInput] = useState("");

  const isAdmin = useAuthStore(state => state.isAdmin);

  // Load player info
  useEffect(() => {
    if (username) {
      setLoading(true);
      playersService
        .getByUsername(username)
        .then((res) => setPlayer(res))
        .catch((err) => console.error("Error loading player", err))
        .finally(() => setLoading(false));
    }
  }, [username]);

  // Load achievements
  const { data: userAchievements } = useSWR<IUserAchievement[]>(
    username ? `achievements/user/${username}` : null,
    () => achievementsService.getUserAchievements(username as string)
  );

  // Load companies
  const { data: documents } = useSWR(
    username ? `documents-${username}` : null,
    async () => {
      // Mock data for now, ideally fetch from backend if you have an endpoint
      return []; 
    }
  );  const { data: companies } = useSWR<ICompany[]>(
    username ? `economy/companies?owner=${username}` : null,
    () => economyService.getAllCompanies({ ownerUsername: username as string })
  );

  const rarityWeights: Record<string, number> = { legendary: 4, epic: 3, rare: 2, common: 1 };

  const filteredAndSortedAchievements = useMemo(() => {
    if (!userAchievements) return [];
    const result = userAchievements.filter(ua => selectedRarities.includes(ua.achievement.rarity));
    result.sort((a, b) => {
      const weightA = rarityWeights[a.achievement.rarity] || 0;
      const weightB = rarityWeights[b.achievement.rarity] || 0;
      return sortOrder === "rarityDesc" ? weightB - weightA : weightA - weightB;
    });
    return result;
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAchievements, selectedRarities, sortOrder]);

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => 
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
  };

  const getLastLoginText = (dateString?: string) => {
    if (!dateString) return "Никогда не играл";
    if (dateString.startsWith("1970") || dateString === "0") return "Никогда не играл";
    return normalizeDate(dateString);
  };

  if (loading) {
    return (
      <div className="player-profile-page">
        <Sidebar />
        <main className="content center-loader">
          <MoonLoader color="#fff" />
        </main>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="player-profile-page">
        <Sidebar />
        <main className="content">
          <h1>Игрок не найден</h1>
        </main>
      </div>
    );
  }

  const isOnline = false; // Placeholder if it was removed

  return (
    <div className="player-profile-page">
      <Sidebar />

      <main className="content">
        <div className="profile-header">
          <div className="profile-header__avatar">
            {player.avatar_img ? (
              <img src={player.avatar_img} alt={player.username} />
            ) : (
              <div className="avatar-placeholder">?</div>
            )}
          </div>
          <div className="profile-header__info">
            <h1>{player.username}</h1>
            <div className="tags">
              <span className={`role-tag ${player.role === "admin" ? "admin" : ""}`}>
                {player.role === "admin" ? "Администратор" : "Игрок"}
              </span>
              {player.citizenshipName && (
                <span className="state-tag">
                  {player.stateFlagUrl && <img src={player.stateFlagUrl} alt="flag" className="state-flag" />}{" "}
                  {player.citizenshipName}
                </span>
              )}
              {player.settlementName && <span className="settlement-tag">{player.settlementName}</span>}
              {player.isBanned && (
                <span className="banned-tag" style={{ backgroundColor: "#ef4444", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", marginLeft: "8px" }}>
                  ЗАБЛОКИРОВАН
                </span>
              )}
            </div>
          </div>
          
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
            {isAdmin && (
              <>
                {player.isBanned ? (
                  <button 
                    className="unban-btn"
                    style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                    onClick={() => setModalState("unban")}
                  >
                    Разбанить
                  </button>
                ) : (
                  <button 
                    className="ban-btn"
                    style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                    onClick={() => {
                      setBanReasonInput("");
                      setModalState("ban");
                    }}
                  >
                    Забанить
                  </button>
                )}
              </>
            )}
            <div className="profile-header__status">
              <span className={`status-indicator ${isOnline ? "online" : "offline"}`}></span>
              <span>{isOnline ? "В игре" : "Не в сети"}</span>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Инфо
          </button>
          <button
            className={`tab-btn ${activeTab === "achievements" ? "active" : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            Достижения
          </button>
          <button
            className={`tab-btn ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => setActiveTab("companies")}
          >
            Компании
          </button>
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            Документы
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "info" && (
            <div className="info-tab">
              <div className="info-grid">
                <div className="info-card">
                  <h3>Идентификация</h3>
                  <p><span className="label">Никнейм:</span> {player.username}</p>
                  <p><span className="label">UUID:</span> {player.uuid}</p>
                  <p><span className="label">Дата регистрации:</span> {normalizeDate(player.registrationDate)}</p>
                  <p><span className="label">Последний раз играл:</span> {getLastLoginText(player.lastLoginDate)}</p>
                  <p><span className="label">Почта:</span> {player.emailIsConfirmed ? "✅ Подтверждена" : "❌ Не подтверждена"}</p>
                </div>
                <div className="info-card">
                  <h3>Гражданство</h3>
                  <p><span className="label">Государство:</span> {player.stateName ? <Link to={`/states/${player.stateId}`}>{player.stateName}</Link> : "-"}</p>
                  <p><span className="label">Поселение:</span> {player.settlementName || "-"}</p>
                  {player.stateCoatOfArmsUrl && (
                    <img src={player.stateCoatOfArmsUrl} alt="Coat of arms" className="coat-of-arms" />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="achievements-tab">
              <div className="achievements-filters">
                <div className="rarity-filters">
                  {['legendary', 'epic', 'rare', 'common'].map(rarity => (
                    <button 
                      key={rarity} 
                      className={`filter-btn rarity-${rarity} ${selectedRarities.includes(rarity) ? 'active' : ''}`}
                      onClick={() => toggleRarity(rarity)}
                    >
                      {rarity.toUpperCase()}
                    </button>
                  ))}
                </div>
                <select 
                  className="sort-select"
                  value={sortOrder} 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="rarityDesc">Сначала редкие</option>
                  <option value="rarityAsc">Сначала частые</option>
                </select>
              </div>

              {filteredAndSortedAchievements && filteredAndSortedAchievements.length > 0 ? (
                <div className="achievements-grid">
                  {filteredAndSortedAchievements.map((ua) => (
                    <div className={`achievement-item rarity-${ua.achievement.rarity.toLowerCase()}`} key={ua.id}>
                      <div className="achievement-icon">
                        {ua.achievement.iconUrl ? (
                          <img src={ua.achievement.iconUrl} alt={ua.achievement.title} />
                        ) : (
                          <div className="placeholder" style={{ background: generateGradient(ua.achievement.title), color: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {ua.achievement.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="achievement-info">
                        <h4>{ua.achievement.title}</h4>
                        <p>{ua.achievement.description}</p>
                        <span className="rarity-badge">{ua.achievement.rarity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>У игрока пока нет достижений.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div className="companies-tab">
              {companies && companies.length > 0 ? (
                <div className="companies-grid">
                  {companies.map((company) => (
                    <Link to={`/companies/${company.id}`} className="company-card" key={company.id} style={{ textDecoration: 'none' }}>
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="company-logo" />
                      ) : (
                        <div className="company-logo-placeholder" style={{ background: generateGradient(company.name) }}>
                           {company.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <h4>{company.name}</h4>
                      <p>{company.description || "Нет описания"}</p>
                      <div className="company-tags">
                        <span className="tag-type">{company.isPublic ? "Публичная" : "Частная"}</span>
                        <span className="tag-location">{company.settlementId ? "Городская" : company.stateId ? "Государственная" : "Международная"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>У игрока пока нет компаний.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="documents-tab">
              <PlayerPassportComponent player={player} />
              {companies && companies.length > 0 && (
                <BusinessCertificateComponent player={player} companiesCount={companies.length} />
              )}
            </div>
          )}
        </div>
      </main>

      {modalState !== "none" && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            {modalState === "ban" && (
              <>
                <h2>Заблокировать игрока {player.username}</h2>
                <p>Вы собираетесь заблокировать этого игрока. Укажите причину блокировки, она будет видна игроку.</p>
                <input 
                  type="text" 
                  placeholder="Причина блокировки" 
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  autoFocus
                />
                <div className="admin-modal-actions">
                  <button className="cancel-btn" onClick={() => setModalState("none")}>Отмена</button>
                  <button className="confirm-ban-btn" onClick={async () => {
                    if (banReasonInput.trim() === '') {
                      return;
                    }
                    try {
                      const updatedPlayer = await playersService.banUser(player.username, banReasonInput);
                      setPlayer(updatedPlayer);
                      setModalState("none");
                      setBanReasonInput("");
                    } catch (e) {
                      alert('Ошибка при бане');
                    }
                  }}>Заблокировать</button>
                </div>
              </>
            )}
            {modalState === "unban" && (
              <>
                <h2>Разблокировать игрока {player.username}</h2>
                <p>Вы уверены, что хотите снять блокировку с этого игрока? Он снова сможет заходить на сайт и пользоваться всеми функциями.</p>
                <div className="admin-modal-actions">
                  <button className="cancel-btn" onClick={() => setModalState("none")}>Отмена</button>
                  <button className="confirm-unban-btn" onClick={async () => {
                    try {
                      const updatedPlayer = await playersService.unbanUser(player.username);
                      setPlayer(updatedPlayer);
                      setModalState("none");
                    } catch (e) {
                      alert('Ошибка при разбане');
                    }
                  }}>Разблокировать</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfilePage;
