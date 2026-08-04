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

const PlayersPage: FC = () => {
  const [users, setUsers] = useState<GetAllUsersResponse>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<"all" | "only-online">("all");
  const [selectedStateId, setSelectedStateId] = useState<string>("all");

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
  }, [filterQuery]);

  const filteredUsers = users.filter((user) => {
    const matchesOnline =
      filterQuery === "all" ||
      (filterQuery === "only-online" &&
        onlinePlayers.players.includes(user.username));

    const matchesState =
      selectedStateId === "all"
        ? true
        : selectedStateId === "none"
        ? !user.stateId
        : user.stateId === selectedStateId;

    return matchesOnline && matchesState;
  });

  return (
    <div className="players-page page">
      <Sidebar />

      <main className="content">
        <h1>Игроки</h1>
        <p>
          Игроков онлайн: {onlinePlayers.playersCount}/{users.length}
        </p>

        <div className="filter-buttons">
          <p>Показывать:</p>
          <button
            className={`filter-buttons__button ${
              filterQuery === "all" ? "filter-buttons__button--active" : ""
            }`}
            onClick={() => setFilterQuery("all")}
          >
            Всех
          </button>
          <button
            className={`filter-buttons__button ${
              filterQuery === "only-online"
                ? "filter-buttons__button--active"
                : ""
            }`}
            onClick={() => setFilterQuery("only-online")}
          >
            Только на сервере
          </button>

          <div className="filter-buttons__state-filter">
            <p>Государство:</p>
            <select
              value={selectedStateId}
              onChange={(e) => setSelectedStateId(e.target.value)}
              className="filter-buttons__select"
            >
              <option value="all">Все государства</option>
              <option value="none">Без государства</option>
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <PropagateLoader />
        ) : (
          <div className="players">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
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

                  {onlinePlayers.players.includes(user.username)
                    ? "Онлайн"
                    : "Оффлайн"}
                </div>
              ))
            ) : (
              <p>Игроки с выбранными фильтрами не найдены...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlayersPage;
