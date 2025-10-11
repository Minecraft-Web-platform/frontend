import { FC, useEffect, useState } from "react";
import "./players.page.scss";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { GetAllUsersResponse } from "../types/get-all-users.response";
import { playersService } from "../services/players.service";
import { Link } from "react-router";
import { PropagateLoader } from "react-spinners";
import { GetOnlinePlayersResponse } from "../types/get-online-players.response";

const PlayersPage: FC = () => {
  const [users, setUsers] = useState<GetAllUsersResponse>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<"all" | "only-online">("all");

  const [onlinePlayers, setOnlinePlayers] = useState<GetOnlinePlayersResponse>({
    online: false,
    players: [],
    playersCount: 0,
  });

  useEffect(() => {
    (async () => {
      const usersFromServer = await playersService.getAll();
      setUsers(usersFromServer);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const onlinePlayersResponse = await playersService.getOnlinePlayers();
      setOnlinePlayers(onlinePlayersResponse);
    })();
  }, [filterQuery]);

  return (
    <div className="players-page page">
      <Sidebar />

      <main className="content">
        <h1>Игроки</h1>
        <p>Игроков онлайн: {onlinePlayers.playersCount}</p>

        <div className="filter-buttons">
          <p>Показывать:</p>
          <button
            className={`filter-buttons__button ${
              filterQuery === "all" && "filter-buttons__button--active"
            }`}
            onClick={() => setFilterQuery("all")}
          >
            Всех
          </button>
          <button
            className={`filter-buttons__button ${
              filterQuery === "only-online" && "filter-buttons__button--active"
            }`}
            onClick={() => setFilterQuery("only-online")}
          >
            Только на сервере
          </button>
        </div>

        {loading ? (
          <PropagateLoader />
        ) : (
          <div className="players">
            {users.length > 0 ? (
              users.map((user) => {
                if (
                  (filterQuery === "only-online" &&
                    onlinePlayers.players.includes(user.username)) ||
                  filterQuery === "all"
                ) {
                  return (
                    <div className="player" key={user.id}>
                      <img
                        className="player__profile-picture"
                        src={
                          user?.avatar_img
                            ? `${user.avatar_img}?t=${Date.now()}`
                            : "/png/steve-head.png"
                        }
                      />

                      <Link to={"/players/" + user.username}>
                        <h2>{user.username}</h2>
                      </Link>

                      {onlinePlayers.players.includes(user.username)
                        ? "Онлайн"
                        : "Оффлайн"}
                    </div>
                  );
                }
              })
            ) : (
              <p>
                Этот сервер чист как белый лист... В этом мире еще не вступала
                нога человека...
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PlayersPage;
