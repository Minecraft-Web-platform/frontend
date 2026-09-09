import { FC, useEffect, useState } from "react";
import "./players.page.scss";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { GetAllUsersResponse } from "../types/get-all-users.response";
import { playersService } from "../services/players.service";
import { Link } from "react-router";
import { PropagateLoader } from "react-spinners";
import { GetOnlinePlayersResponse } from "../types/get-online-players.response";
import { statesService } from "../../states/services/states.service";
import { IState } from "../../states/types/states.types";
import { useTranslation } from "react-i18next";
import CustomSelect from "../../../shared/ui/custom-select/CustomSelect";

const PlayersPage: FC = () => {
  const [users, setUsers] = useState<GetAllUsersResponse>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterOnline, setFilterOnline] = useState<"all" | "online">("all");
  const [filterState, setFilterState] = useState<string>("all");

  const { t } = useTranslation("players");

  const [onlinePlayers, setOnlinePlayers] = useState<GetOnlinePlayersResponse>({
    online: false,
    players: [],
    playersCount: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [usersFromServer, statesFromServer] = await Promise.all([
          playersService.getAll(),
          statesService.getStates().catch(() => [] as IState[]),
        ]);
        setUsers(usersFromServer);
        setStates(statesFromServer);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const onlinePlayersResponse = await playersService.getOnlinePlayers();
      setOnlinePlayers(onlinePlayersResponse);
    })();
  }, [filterOnline]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline =
      filterOnline === "all" ||
      (filterOnline === "online" &&
        onlinePlayers.players.includes(user.username));

    const matchesState =
      filterState === "all"
        ? true
        : filterState === "none"
        ? !user.stateId
        : user.stateId === filterState;

    return matchesOnline && matchesState;
  });

  return (
    <div className="players-page page">
      <Sidebar />

      <main className="content">
        <h1>{t("players.title")}</h1>
        <div className="players-online-badge">
          {t("players.online", { online: onlinePlayers.playersCount, total: users.length })}
        </div>

        <div className="filter-buttons">
          <p>{t("players.show")}</p>
          <button
            className={`filter-buttons__button ${filterOnline === "all" ? "filter-buttons__button--active" : ""}`}
            onClick={() => setFilterOnline("all")}
          >
            {t("players.all")}
          </button>
          <button
            className={`filter-buttons__button ${filterOnline === "online" ? "filter-buttons__button--active" : ""}`}
            onClick={() => setFilterOnline("online")}
          >
            {t("players.onlyServer")}
          </button>

          <div className="filter-buttons__state-filter">
            <p>{t("players.state")}</p>
            <CustomSelect
              value={filterState}
              onChange={(val) => setFilterState(val)}
              options={[
                { value: "all", label: t("players.allStates") },
                { value: "none", label: t("players.noState") },
                ...states.map((st) => ({ value: st.id, label: st.name })),
              ]}
            />
          </div>
        </div>

        {loading ? (
          <PropagateLoader />
        ) : (
          <div className="players">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isOnline = onlinePlayers.players.includes(user.username);
                return (
                <div className="player" key={user.id}>
                  <img
                    className="player__profile-picture"
                    src={
                      user?.avatar_img
                        ? `${user.avatar_img}?t=${Date.now()}`
                        : "/png/steve-head.png"
                    }
                    alt={user.username}
                  />

                  <Link
                    to={"/players/" + user.username}
                    className="player__name-wrapper"
                  >
                    <h2>{user.username}</h2>
                    {user.stateCoatOfArmsUrl && (
                      <img
                        className="player__coat-of-arms"
                        src={user.stateCoatOfArmsUrl}
                        alt={user.stateName || ""}
                        title={user.stateName || ""}
                      />
                    )}
                  </Link>

                  <div className={`player-card-status ${isOnline ? "online" : "offline"}`}>
                    {isOnline
                    ? t("players.statusOnline")
                    : t("players.statusOffline")}
                  </div>
                </div>
              )})
            ) : (
              <div className="players-not-found">
                <p>{t("players.notFound")}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlayersPage;
