import { useState } from 'react';
import RoleSelector from './RoleSelector';
import AppDJF from './AppDJF';

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <RoleSelector onSessionSelected={setSession} />;
  }

  return <AppDJF session={session} />;
}
