import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNavigation from './MobileNavigation';
import Suggestions from './Suggestions';
import Modal from './Modal';
import PostComposer from './PostComposer';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [composing, setComposing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const doLogout = () => { logout(); navigate('/auth', { replace: true }); };

  return (
    <div className="min-h-screen">
      <Sidebar onCompose={() => setComposing(true)} onLogout={() => setConfirmLogout(true)} />
      <div className="lg:pl-64">
        <Topbar onLogout={() => setConfirmLogout(true)} />
        <div className="mx-auto flex max-w-6xl gap-6 px-4 pb-28 pt-5 lg:pb-10">
          <main className="min-w-0 flex-1 xl:max-w-[42rem]"><Outlet /></main>
          <aside className="sticky top-24 hidden h-fit w-72 shrink-0 xl:block"><Suggestions /></aside>
        </div>
      </div>
      <MobileNavigation onCompose={() => setComposing(true)} />
      {composing && (
        <Modal title="Create post" onClose={() => setComposing(false)}>
          <PostComposer bare autoFocus onCancel={() => setComposing(false)} onSaved={() => { setComposing(false); navigate('/home'); }} />
        </Modal>
      )}
      {confirmLogout && <ConfirmationModal title="Log out?" message="You will need to sign in again to use Connectly." confirmLabel="Logout" onConfirm={doLogout} onClose={() => setConfirmLogout(false)} />}
    </div>
  );
}
