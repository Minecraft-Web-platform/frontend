import { FC, useEffect, useState } from "react";
import "./players.page.scss";
import Sidebar from "../../../shared/ui/sidebar/sidebar.component";
import { GetAllUsersResponse } from "../types/get-all-users.response";
import { playersService } from "../services/players.service";
import { Link } from "react-router";
import { PropagateLoader } from "react-spinners";

const PlayersPage: FC = () => {
  const [users, setUsers] = useState<GetAllUsersResponse>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const usersFromServer = await playersService.getAll();
      setUsers(usersFromServer);

      setLoading(false);
    })();
  }, []);

  return (
    <div className="players-page page">
      <Sidebar />

      <main className="content">
        <h1>Игроки</h1>

        {loading ? (
          <PropagateLoader />
        ) : (
          <div className="players">
            {users.length > 0 ? (
              users.map((user) => {
                return (
                  <div className="player" key={user.id}>
                    <img
                      className="player__profile-picture"
                      src="/png/steve-head.png"
                    />

                    <Link to={"/players/" + user.username}>
                      <h2>{user.username}</h2>
                    </Link>
                  </div>
                );
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
