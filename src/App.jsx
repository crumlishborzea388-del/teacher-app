import React, { useEffect, useState } from 'react';
import Home from './pages/Home';
import Teacher from './pages/Teacher';

function App() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const onpop = () => setRoute(window.location.pathname);
    window.addEventListener('popstate', onpop);
    return () => window.removeEventListener('popstate', onpop);
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(path);
  }

  if (route.startsWith('/teacher/')) {
    const id = route.split('/teacher/')[1];
    return <Teacher id={id} back={() => navigate('/')} />;
  }
  return <Home onOpenTeacher={(id) => navigate(`/teacher/${id}`)} />;
}

export default App;
