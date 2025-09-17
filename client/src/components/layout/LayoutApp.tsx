import Header from './Header';
import LeftMenu from './LeftMenu';
import { Outlet } from 'react-router-dom';

const LayoutApp = () => {
  return (
    <div>
      <Header />
      <div className="flex flex-row h-[calc(100vh-56px)]">
        <LeftMenu />
        <div className="flex-grow p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutApp;
