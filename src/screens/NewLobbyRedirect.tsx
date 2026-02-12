import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "../telegram/useTelegram";

export default function NewLobbyRedirect() {
  const navigate = useNavigate();
  const { user } = useTelegram();

  useEffect(() => {
    const duelId = Math.random().toString(36).slice(2, 10);
    navigate(`/lobby/${duelId}`);
  }, [navigate]);

  return null;
}
