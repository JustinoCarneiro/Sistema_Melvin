import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTopRouter = () => {
  const location = useLocation();

  useEffect(() => {
    // Força o scroll para o topo toda vez que a navegação ocorre
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

export default ScrollToTopRouter;
