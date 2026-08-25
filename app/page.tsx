'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, useEffect } from 'react';
import { encodePassphrase, generateRoomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

function Tabs(props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'custom' ? 1 : 0;

  const router = useRouter();
  function onTabSelected(index: number) {
    const tab = index === 1 ? 'custom' : 'demo';
    router.push(`/?tab=` + tab);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    return (
      <button
        className="lk-button"
        onClick={() => {
          if (onTabSelected) {
            onTabSelected(index);
          }
        }}
        aria-pressed={tabIndex === index}
      >
        {/* @ts-ignore */}
        {child?.props.label}
      </button>
    );
  });

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

function DemoMeetingTab(props: { label: string }) {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));
  const [activeRooms, setActiveRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => setActiveRooms(data))
      .catch(err => console.error(err));
  }, []);

  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/` + generateRoomId() + `#` + encodePassphrase(sharedPassphrase));
    } else {
      router.push(`/rooms/` + generateRoomId());
    }
  };

  const joinRoom = (roomName: string) => {
    router.push(`/rooms/` + roomName);
  };

  return (
    <div className={styles.tabContent}>
      <p style={{ margin: 0 }}>Tạo một phòng mới ngẫu nhiên để bắt đầu cuộc gọi.</p>
      <button style={{ marginTop: '1rem' }} className="lk-button" onClick={startMeeting}>
        Bắt đầu gọi (Phòng mới)
      </button>
      
      {activeRooms && activeRooms.length > 0 && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>🟢 Các phòng đang mở ({activeRooms.length}):</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeRooms.map((room: any) => (
              <div key={room.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <span>Phòng: {room.name} ({room.numParticipants} người)</span>
                <button className="lk-button" style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem', height: 'auto' }} onClick={() => joinRoom(room.name)}>
                  Tham gia
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          ></input>
          <label htmlFor="use-e2ee">Bật mã hoá đầu cuối (E2EE)</label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <label htmlFor="passphrase">Mật khẩu</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CustomConnectionTab(props: { label: string }) {
  const router = useRouter();

  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverUrl = formData.get('serverUrl');
    const token = formData.get('token');
    if (e2ee) {
      router.push(
        `/custom/?liveKitUrl=` + serverUrl + `&token=` + token + `#` + encodePassphrase(sharedPassphrase),
      );
    } else {
      router.push(`/custom/?liveKitUrl=` + serverUrl + `&token=` + token);
    }
  };
  return (
    <form className={styles.tabContent} onSubmit={onSubmit}>
      <p style={{ marginTop: 0 }}>
        Kết nối Facet Meet với một máy chủ có sẵn bằng URL và Token.
      </p>
      <input
        id="serverUrl"
        name="serverUrl"
        type="url"
        placeholder="LiveKit Server URL: wss://*.livekit.cloud"
        required
      />
      <textarea
        id="token"
        name="token"
        placeholder="Token"
        required
        rows={5}
        style={{ padding: '1px 2px', fontSize: 'inherit', lineHeight: 'inherit' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          ></input>
          <label htmlFor="use-e2ee">Bật mã hoá đầu cuối (E2EE)</label>
        </div>
        {e2ee && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
            <label htmlFor="passphrase">Mật khẩu</label>
            <input
              id="passphrase"
              type="password"
              value={sharedPassphrase}
              onChange={(ev) => setSharedPassphrase(ev.target.value)}
            />
          </div>
        )}
      </div>

      <hr
        style={{ width: '100%', borderColor: 'rgba(255, 255, 255, 0.15)', marginBlock: '1rem' }}
      />
      <button
        style={{ paddingInline: '1.25rem', width: '100%' }}
        className="lk-button"
        type="submit"
      >
        Kết nối
      </button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <div className="header">
          <img src="/facet_logo_rvbg.png" alt="Facet Meet" width="200" style={{ objectFit: 'contain' }} />
          <h2>
            Facet Meet - Mạng nội bộ gọi video mã hoá 1-on-1 bảo mật cao.
          </h2>
        </div>
        <Suspense fallback="Loading">
          <DemoMeetingTab label="Gọi Nhanh" />
        </Suspense>
      </main>
      <footer data-lk-theme="default">
        Bản quyền thuộc về Facet Meet - Ứng dụng gọi video cá nhân.
      </footer>
    </>
  );
}
